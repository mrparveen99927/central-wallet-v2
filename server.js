const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// राउट्स इम्पोर्ट करना
const userRoutes = require('./routes/userRoutes');
const walletRoutes = require('./routes/walletRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// मिडलवेयर सेटअप
app.use(cors());
app.use(express.json());

// मुख्य रूट चेक (ताकि रेंडर को पता चले सर्वर स्वस्थ है)
app.get('/', (req, res) => {
    res.json({ 
        message: "New Central Wallet V2 Engine is 100% Live & Functional!",
        port: 10000,
        status: "Active"
    });
});

// राउट्स को लिंक करना
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

// MongoDB Atlas लाइव कनेक्शन (यह रेंडर के Environment Variables से MONGO_URI उठाएगा)
const mongoURI = process.env.MONGO_URI || "mongodb+srv://mrparveen99927_db_user:ParveenWallet2026@cluster0.pluvfcd.mongodb.net/central_wallet_db?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
.then(() => console.log("✓ MongoDB Atlas Connected Successfully to Central Wallet DB!"))
.catch((err) => console.error("✗ MongoDB Connection Error:", err));

// सर्वर पोर्ट लिस्टनर (Port 10000 या रेंडर का डायनामिक पोर्ट)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`✓ New Server running safely on port ${PORT}`);
});
