const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mpin: { type: String, default: null },
  alphaCoins: { type: Number, default: 0 },
  realMoneyBalance: { type: Number, default: 0 },
  customUpiId: { type: String, required: true, unique: true },
  referralCode: { type: String, required: true, unique: true },
  referredBy: { type: String, default: null },
  isBanned: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
