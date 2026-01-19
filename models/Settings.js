const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  usersCount: {
    type: Number,
    default: 0,
    min: 0
  },
  clientsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Ensure only one settings document exists
  collection: 'settings'
});

// Create a method to get or create the single settings document
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this({ usersCount: 0, clientsCount: 0 });
    await settings.save();
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
