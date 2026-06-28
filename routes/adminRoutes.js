const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AdminSettings = require('../models/AdminSettings');

// 1. एडमिन लॉगिन API (cPanel Access)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        let settings = await AdminSettings.findOne();
        if (!settings) {
            settings = new AdminSettings();
            await settings.save();
        }

        if (username !== settings.adminUsername || password !== settings.adminPassword) {
            return res.status(401).json({ error: "Invalid Admin Credentials!" });
        }

        res.json({ message: "Admin Login Successful!", success: true });
    } catch (err) {
        res.status(500).json({ error: "Server Error", details: err.message });
    }
});

// 2. डिपॉजिट रिक्वेस्ट अप्रूव या डिक्लाइन (UTR Verification)
router.post('/process-deposit', async (req, res) => {
    try {
        const { txnId, action } = req.body; // action: 'Approve' | 'Decline'

        const txn = await Transaction.findOne({ txnId, type: 'Deposit', status: 'Pending' });
        if (!txn) return res.status(404).json({ error: "Pending deposit request not found!" });

        const user = await User.findOne({ uid: txn.receiverId });
        if (!user) return res.status(404).json({ error: "User not found!" });

        if (action === 'Approve') {
            txn.status = 'Success';
            user.alphaCoins += txn.amount;
            await user.save();
        } else {
            txn.status = 'Failed';
        }

        await txn.save();
        res.json({ message: `Deposit request ${action}d successfully!`, status: txn.status });
    } catch (err) {
        res.status(500).json({ error: "Server Error", details: err.message });
    }
});

// 3. विड्रॉल रिक्वेस्ट अप्रूव या डिक्लाइन (Decline पर रिवर्सल लॉजिक)
router.post('/process-withdrawal', async (req, res) => {
    try {
        const { txnId, action } = req.body; // action: 'Approve' | 'Decline'

        const txn = await Transaction.findOne({ txnId, type: 'Withdrawal', status: 'Pending' });
        if (!txn) return res.status(404).json({ error: "Pending withdrawal request not found!" });

        const user = await User.findOne({ uid: txn.senderId });
        if (!user) return res.status(404).json({ error: "User not found!" });

        if (action === 'Approve') {
            txn.status = 'Success';
        } else {
            txn.status = 'Failed';
            user.realMoneyBalance += txn.amount;
            await user.save();
        }

        await txn.save();
        res.json({ message: `Withdrawal request ${action}d successfully!`, status: txn.status });
    } catch (err) {
        res.status(500).json({ error: "Server Error", details: err.message });
    }
});

// 4. यूजर बैन और मैन्युअल वॉलेट कंट्रोल
router.post('/wallet-control', async (req, res) => {
    try {
        const { uid, action, amount, banStatus } = req.body; // action: 'Add' | 'Deduct' | 'None'

        const user = await User.findOne({ uid });
        if (!user) return res.status(404).json({ error: "User not found!" });

        if (typeof banStatus === 'boolean') {
            user.isBanned = banStatus;
        }

        if (action === 'Add' && amount > 0) {
            user.alphaCoins += Number(amount);
        } else if (action === 'Deduct' && amount > 0) {
            user.alphaCoins = Math.max(0, user.alphaCoins - Number(amount));
        }

        await user.save();
        res.json({ message: "User account updated!", isBanned: user.isBanned, currentCoins: user.alphaCoins });
    } catch (err) {
        res.status(500).json({ error: "Server Error", details: err.message });
    }
});

// 5. पेमेंट डिटेल्स लाइव बदलने का फॉर्म (बिना ऐप अपडेट किए चेंज)
router.post('/update-payment-settings', async (req, res) => {
    try {
        const { bankName, accountNumber, ifscCode, accountHolder, companyUpiId, companyQrCodeUrl } = req.body;

        let settings = await AdminSettings.findOne();
        if (!settings) settings = new AdminSettings();

        if (bankName) settings.companyBankDetails.bankName = bankName;
        if (accountNumber) settings.companyBankDetails.accountNumber = accountNumber;
        if (ifscCode) settings.companyBankDetails.ifscCode = ifscCode;
        if (accountHolder) settings.companyBankDetails.accountHolder = accountHolder;
        if (companyUpiId) settings.companyUpiId = companyUpiId;
        if (companyQrCodeUrl) settings.companyQrCodeUrl = companyQrCodeUrl;

        await settings.save();
        res.json({ message: "Payment details updated live!", settings });
    } catch (err) {
        res.status(500).json({ error: "Server Error", details: err.message });
    }
});

// 6. लाइव गेट पेमेंट सेटिंग्स API (यूजर ऐप के लिए)
router.get('/get-payment-settings', async (req, res) => {
    try {
        const settings = await AdminSettings.findOne().select('companyBankDetails companyUpiId companyQrCodeUrl bannerAdUnitId minGameTransferLimit maxGameTransferLimit');
        res.json(settings || {});
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
          
