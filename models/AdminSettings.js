const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  adminUsername: { type: String, required: true, default: 'admin' },
  adminPassword: { type: String, required: true, default: 'Parveen988' },
  companyBankDetails: {
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    accountHolder: { type: String, default: '' }
  },
  companyUpiId: { type: String, default: '' }, 
  companyQrCodeUrl: { type: String, default: '' },
  minGameTransferLimit: { type: Number, default: 100 },
  maxGameTransferLimit: { type: Number, default: 50000 },
  bannerAdUnitId: { type: String, default: 'ca-app-pub-5481672368116024/9700500853' }
}, { timestamps: true });

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
