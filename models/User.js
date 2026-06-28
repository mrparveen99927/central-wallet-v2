const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // जैसे: CW1001
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mpin: { type: String, default: null }, // 4 या 6 डिजिट का सुरक्षा पिन
  alphaCoins: { type: Number, default: 0 }, // गेमिंग कॉइन्स का मुख्य बैलेंस
  realMoneyBalance: { type: Number, default: 0 }, // कनवर्टेड असली पैसों का बैलेंस
  customUpiId: { type: String, required: true, unique: true }, // uid@centralwallet
  referralCode: { type: String, required: true, unique: true }, // जैसे: PARV1001
  referredBy: { type: String, default: null }, // इनवाइट करने वाले की UID
  isBanned: { type: Boolean, default: false } // यूज़र ब्लॉक स्टेटस
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
