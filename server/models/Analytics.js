const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  studyTime: {
    type: Number,
    default: 0 // in minutes
  },
  tasksCompleted: {
    type: Number,
    default: 0
  },
  sessionsCount: {
    type: Number,
    default: 0
  },
  focusScore: {
    type: Number,
    default: 0
  },
  subjectBreakdown: {
    type: Map,
    of: Number
  }
}, { timestamps: true });

// Index for efficient queries
analyticsSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);

