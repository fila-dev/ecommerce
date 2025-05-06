const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true },
  message: { type: String, required: true },
  unread: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Contact", contactSchema);
