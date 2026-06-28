const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// 1. P2P ट्रांसफर API
router.post('/p2p-transfer', async (req, res) => {
    try {
        const { senderUid, receiverUpiOrMobile, amount, mpin } = req.body;
        if (!senderUid || !receiverUpiOrMobile || amount <= 0) return res.status(400).json({ error: "Invalid transfer parameters!" });

        const sender = await User.findOne({ uid: senderUid });
        if (!sender) return res.status(404).json({ error: "Sender not found!" });
        if (sender.isBanned) return res.status(403).json({ error: "Your account is banned!" });
        if (sender.mpin !== mpin) return res.status(401).json({ error: "Incorrect MPIN!" });
        if (sender.alphaCoins < amount) return res.status(400).json({ error: "Insufficient Alpha Coins!" });

        const receiver = await User.findOne({
            $or: [
                { customUpiId: receiverUpiOrMobile.toLowerCase().trim() },
                { mobile: receiverUpiOrMobile.trim() }
            ]
        });
        if (!receiver) return res.status(404).json({ error: "Receiver not found!" });
        if (receiver.isBanned) return res.status(400).json({ error: "Receiver account is banned!" });
        if (sender.uid === receiver.uid) return res.status(400).json({ error: "Cannot transfer to yourself!" });

        sender.alphaCoins -= Number(amount);
        receiver.alphaCoins += Number(amount);

        await sender.save();
        await receiver.save();

        const txnId = 'TXNP2P' + Date.now();
        const transaction = new Transaction({
            txnId, senderId: sender.uid, receiverId: receiver.uid, amount: Number(amount), type: 'P2P_Send', status: 'Success'
        });
        await transaction.save();

        res.json({ message: "Transfer successful!", txnId, newBalance: sender.alphaCoins });
    } catch (err) {
        res.status(500).json({ error: "Server Error", details: err.message });
    }
});

// 2. मैन्युअल UTR डिपॉजिट रिक्वेस्ट API
router.post('/deposit-request', async (req, res) => {
    try {
        const { uid, amount, utrNumber } = req.body;
        if (!uid || amount <= 0 || !utrNumber || utrNumber.length < 6) return res.status(400).json({ error: "Invalid amount or UTR!" });

        const utrExists = await Transaction.findOne({ utrNumber });
        if (utrExists) return res.status(400).json({ error: "This UTR number has already been used!" });

        const user = await User.findOne({ uid });
        if (!user) return res.status(404).json({ error: "User not found!" });

        const txnId = 'TXNDEP' + Date.now();
        const newDepositTxn = new Transaction({
            txnId, senderId: 'BANK', receiverId: uid, amount: Number(amount), type: 'Deposit', utrNumber, status: 'Pending'
        });
        await newDepositTxn.save();

        res.json({ message: "Deposit request submitted successfully!", txnId });
    } catch (err) {
        res.status(500).json({ error: "Server Error", details: err.message });
    }
});

// 3. 3-ऑप्शन विड्रॉल रिक्वेस्ट API
router.post('/withdraw-request', async (req, res) => {
    try {
        const { uid, amount, mpin } = req.body;
        if (!uid || amount <= 0) return res.status(400).json({ error: "Invalid amount!" });

        const user = await User.findOne({ uid });
        if (!user) return res.status(404).json({ error: "User not found!" });
        if (user.mpin !== mpin) return res.status(401).json({ error: "Incorrect MPIN!" });
        if (user.realMoneyBalance < amount) return res.status(400).json({ error: "Insufficient Balance!" });

        user.realMoneyBalance -= Number(amount);
        await user.save();

        const txnId = 'TXNWTH' + Date.now();
        const newWithdrawTxn = new Transaction({
            txnId, senderId: uid, receiverId: 'BANK', amount: Number(amount), type: 'Withdrawal', status: 'Pending'
        });
        await newWithdrawTxn.save();

        res.json({ message: "Withdrawal request submitted!", txnId });
    } catch (err) {
        res.status(500).json({ error: "Server Error", details: err.message });
    }
});

module.exports = router;
    
