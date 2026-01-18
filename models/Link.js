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
    default: ''
  },
  showDisplayName: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  menuCardImages: {
    type: [String], // Menu card images (base64 data URLs array) - for menu category, up to 3 images
    default: []
  },
  menuItems: {
    type: [{
      categoryName: {
        type: String,
        required: true
      },
      items: [{
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        }
      }]
    }],
    default: []
  },
  menuType: {
    type: String,
    enum: ['images', 'items'], // 'images' for menuCardImages, 'items' for menuItems
    default: 'images'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Link', linkSchema);






