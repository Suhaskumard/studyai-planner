const mongoose = require('mongoose');

const flashcardDeckSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    trim: true
  },
  cards: [{
    front: {
      type: String,
      required: true
    },
    back: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    lastReviewed: Date,
    reviewCount: { type: Number, default: 0 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('FlashcardDeck', flashcardDeckSchema);

