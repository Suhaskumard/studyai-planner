const express = require('express');
const router = express.Router();
const FlashcardDeck = require('../models/FlashcardDeck');
const auth = require('../middleware/auth');

// Get all flashcard decks
router.get('/', auth, async (req, res) => {
  try {
    const decks = await FlashcardDeck.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(decks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single flashcard deck
router.get('/:id', auth, async (req, res) => {
  try {
    const deck = await FlashcardDeck.findOne({ _id: req.params.id, user: req.user.id });
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' });
    }
    res.json(deck);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create flashcard deck
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, subject, cards } = req.body;
    const deck = new FlashcardDeck({
      user: req.user.id,
      title,
      description,
      subject,
      cards: cards || []
    });
    await deck.save();
    res.status(201).json(deck);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update flashcard deck
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, subject, cards } = req.body;
    const deck = await FlashcardDeck.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, description, subject, cards },
      { new: true, runValidators: true }
    );
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' });
    }
    res.json(deck);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete flashcard deck
router.delete('/:id', auth, async (req, res) => {
  try {
    const deck = await FlashcardDeck.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' });
    }
    res.json({ message: 'Deck deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

