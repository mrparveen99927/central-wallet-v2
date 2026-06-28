const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  txnId: { type: String, required: true, unique: true }, 
  senderId: { type: String, required: true }, 
  receiverId: { type: String, required: true }, 
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['Deposit', 'Withdrawal', 'Wallet_to_Game', 'Game_to_Wallet', 'P2P_Send', 'P2P_Receive'] 
  },
  utrNumber: { type: String, default: null }, 
  status: { 
    type: String, 
    required: true, 
    enum: ['Pending', 'Success', 'Failed'], 
    default: 'Pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
