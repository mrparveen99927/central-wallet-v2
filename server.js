const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// मिडलवेयर सेटअप
app.use(cors());
app.use(express.json());

// मुख्य रूट (यह चेक करने के लिए कि आपका नया सर्वर लाइव हुआ या नहीं)
app.get('/', (req, res) => {
    res.json({ 
        message: "New Central Wallet V2 Engine is 100% Live & Functional!",
        port: 10000,
        status: "Active"
    });
});

// MongoDB Atlas कनेक्शन लॉजिक (जो आपके रेंडर डैशबोर्ड से URI उठाएगा)
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✓ MongoDB Atlas Connected Successfully to Central Wallet DB!"))
.catch((err) => console.error("✗ MongoDB Connection Error:", err));

// सर्वर पोर्ट लिस्टनर (Port 10000)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`✓ New Server running safely on port ${PORT}`);
});
