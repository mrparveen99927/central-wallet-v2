const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. यूज़र रजिस्ट्रेशन API
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, mobile, email, password, referralByCode } = req.body;
        let userExists = await User.findOne({ $or: [{ mobile }, { email }] });
        if (userExists) return res.status(400).json({ error: "Mobile or Email already registered!" });

        const totalUsers = await User.countDocuments();
        const nextUidNum = 1001 + totalUsers;
        const uid = `CW${nextUidNum}`;
        const customUpiId = `${uid.toLowerCase()}@centralwallet`;

        const cleanName = firstName.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4);
        const referralCode = `${cleanName}${nextUidNum}`;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let referredByUid = null;
        if (referralByCode) {
            const referrer = await User.findOne({ referralCode: referralByCode.toUpperCase() });
            if (referrer) referredByUid = referrer.uid;
        }

        const newUser = new User({
            uid, firstName, lastName, mobile, email,
            password: hashedPassword,
            customUpiId, referralCode,
            referredBy: referredByUid
        });

        await newUser.save();
        res.status(201).json({ message: "Registration successful!", uid, customUpiId, referralCode });
    } catch (err) {
        res.status(500).json({ error: "Server Error", details: err.message });
    }
});

// 2. यूज़र लॉगिन API
router.post('/login', async (req, res) => {
    try {
        const { loginId, password } = req.body;
        const user = await User.findOne({ $or: [{ mobile: loginId }, { email: loginId }] });
        if (!user) return res.status(400).json({ error: "Invalid Credentials!" });
        if (user.isBanned) return res.status(403).json({ error: "Your account is permanently Banned!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid Credentials!" });

        const token = jwt.sign({ id: user._id, uid: user.uid }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({
            message: "Login successful!",
            token,
            user: {
                uid: user.uid,
                firstName: user.firstName,
                lastName: user.lastName,
                mobile: user.mobile,
                email: user.email,
                customUpiId: user.customUpiId,
                alphaCoins: user.alphaCoins,
                realMoneyBalance: user.realMoneyBalance,
                mpinSet: user.mpin ? true : false
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Server Error", details: err.message });
    }
});

// 3. MPIN सेट/चेंज API
router.post('/set-mpin', async (req, res) => {
    try {
        const { uid, mpin } = req.body;
        if (!mpin || mpin.length < 4) return res.status(400).json({ error: "MPIN must be 4 digits!" });

        const user = await User.findOneAndUpdate({ uid }, { mpin }, { new: true });
        if (!user) return res.status(404).json({ error: "User not found!" });

        res.json({ message: "MPIN updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
