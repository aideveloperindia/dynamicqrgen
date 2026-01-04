const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String, // Hashed password (bcrypt)
    select: false // Don't return password by default
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
    type: String, // Base64 data URL for logo
    default: ''
  },
  qrCode: {
    type: String, // Base64 data URL for QR code
    default: ''
  },
  paymentCompleted: {
    type: Boolean,
    default: false
  },
  paymentId: {
    type: String
  },
  subscriptionActive: {
    type: Boolean,
    default: false
  },
  subscriptionStartDate: {
    type: Date
  },
  subscriptionEndDate: {
    type: Date
  },
  subscriptionAmount: {
    type: Number,
    default: 999 // ₹999/year
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ uniqueSlug: 1 });
userSchema.index({ subscriptionActive: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);

