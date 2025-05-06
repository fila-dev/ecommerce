const mongoose = require("mongoose");

const contactProviderSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true
  },
   
  
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'read', 'replied'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("ContactProvider", contactProviderSchema);
