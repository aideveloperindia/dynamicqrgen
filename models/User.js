const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  picture: {
    type: String
  },
  uniqueSlug: {
    type: String,
    unique: true,
    sparse: true
  },
  businessName: {
    type: String,
    default: ''
  },
  logo: {
    type: String, // URL to uploaded logo
    default: ''
  },
  paymentCompleted: {
    type: Boolean,
    default: false
  },
  paymentId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);

