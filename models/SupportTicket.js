const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  userId: { type: String, required: true }, 
  category: { 
    type: String, 
    required: true, 
    enum: ['Deposit', 'Withdrawal', 'Technical Bug'] 
  },
  message: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['Open', 'Resolved'], 
    default: 'Open' 
  }
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
