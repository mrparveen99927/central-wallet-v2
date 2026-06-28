const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// सभी राउट्स इम्पोर्ट करना
const userRoutes = require('./routes/userRoutes');
const walletRoutes = require('./routes/walletRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// मुख्य रूट चेक
app.get('/', (req, res) => {
    res.json({ 
        message: "New Central Wallet V2 Engine is 100% Live & Functional!",
        port: 10000,
        status: "Active"
    });
});

// राउट्स लिंक करना
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

// MongoDB Atlas कनेक्शन
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✓ MongoDB Atlas Connected Successfully to Central Wallet DB!"))
.catch((err) => console.error("✗ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`✓ New Server running safely on port ${PORT}`);
});
