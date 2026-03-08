
const express = require('express');
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all schedules for user
router.get('/', auth, async (req, res) => {
  try {
    const schedules = await Schedule.find({ user: req.userId }).sort({ dayOfWeek: 1, startTime: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new schedule
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, subject, dayOfWeek, startTime, endTime, location, color, isRecurring } = req.body;

    // Validation
    if (!title || dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ message: 'Title, day of week, start time and end time are required' });
    }

    const schedule = new Schedule({
      user: req.userId,
      title,
      description,
      subject,
      dayOfWeek,
      startTime,
      endTime,
      location,
      color,
      isRecurring: isRecurring !== false
    });

    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a schedule
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, subject, dayOfWeek, startTime, endTime, location, color, isRecurring } = req.body;

    const schedule = await Schedule.findOne({ _id: req.params.id, user: req.userId });
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    if (title) schedule.title = title;
    if (description !== undefined) schedule.description = description;
    if (subject !== undefined) schedule.subject = subject;
    if (dayOfWeek !== undefined) schedule.dayOfWeek = dayOfWeek;
    if (startTime) schedule.startTime = startTime;
    if (endTime) schedule.endTime = endTime;
    if (location !== undefined) schedule.location = location;
    if (color) schedule.color = color;
    if (isRecurring !== undefined) schedule.isRecurring = isRecurring;

    await schedule.save();
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a schedule
router.delete('/:id', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get schedule by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ _id: req.params.id, user: req.userId });
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

