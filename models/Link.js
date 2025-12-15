const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  categoryType: {
    type: String,
    enum: ['default', 'custom'],
    default: 'default'
  },
  url: {
    type: String,
    required: true
  },
  icon: {
    type: String, // For default: icon class name, For custom: uploaded logo URL
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Link', linkSchema);

