const express = require('express');
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all goals for user
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new goal
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, targetDate, targetHours, targetTasks } = req.body;

    // Validation
    if (!title || !targetDate) {
      return res.status(400).json({ message: 'Title and target date are required' });
    }

    const goal = new Goal({
      user: req.userId,
      title,
      description,
      targetDate,
      targetHours,
      targetTasks
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a goal
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, targetDate, targetHours, targetTasks, currentHours, completedTasks, status } = req.body;

    const goal = await Goal.findOne({ _id: req.params.id, user: req.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (targetDate) goal.targetDate = targetDate;
    if (targetHours !== undefined) goal.targetHours = targetHours;
    if (targetTasks !== undefined) goal.targetTasks = targetTasks;
    if (currentHours !== undefined) goal.currentHours = currentHours;
    if (completedTasks !== undefined) goal.completedTasks = completedTasks;
    if (status) goal.status = status;

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get goal by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

