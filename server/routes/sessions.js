
const express = require('express');
const StudySession = require('../models/StudySession');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all sessions for user
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await StudySession.find({ user: req.userId }).sort({ startTime: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new session
router.post('/', auth, async (req, res) => {
  try {
    const { subject, startTime, type, notes } = req.body;

    if (!startTime) {
      return res.status(400).json({ message: 'Start time is required' });
    }

    const session = new StudySession({
      user: req.userId,
      subject,
      startTime,
      type: type || 'focus',
      notes
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a session (end time, duration)
router.put('/:id', auth, async (req, res) => {
  try {
    const { endTime, duration, completed, notes } = req.body;

    const session = await StudySession.findOne({ _id: req.params.id, user: req.userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (endTime) session.endTime = endTime;
    if (duration !== undefined) session.duration = duration;
    if (completed !== undefined) session.completed = completed;
    if (notes !== undefined) session.notes = notes;

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a session
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await StudySession.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get session by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await StudySession.findOne({ _id: req.params.id, user: req.userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

