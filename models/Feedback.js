const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  feedbackType: {
    type: String,
    required: true,
    enum: ['very_useful', 'good_idea', 'not_useful'],
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for efficient queries
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ feedbackType: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
