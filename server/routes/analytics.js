
const express = require('express');
const Analytics = require('../models/Analytics');
const auth = require('../middleware/auth');

const router = express.Router();

// Get analytics for user (default: last 30 days)
router.get('/', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const analytics = await Analytics.find({ 
      user: req.userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get today's analytics
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let analytics = await Analytics.findOne({ 
      user: req.userId,
      date: { $gte: today }
    });

    if (!analytics) {
      // Create today's analytics if not exists
      analytics = new Analytics({
        user: req.userId,
        date: today
      });
      await analytics.save();
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update analytics
router.post('/', auth, async (req, res) => {
  try {
    const { date, studyTime, tasksCompleted, sessionsCount, focusScore, subjectBreakdown } = req.body;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    let analytics = await Analytics.findOne({ 
      user: req.userId,
      date: { $gte: dateObj }
    });

    if (analytics) {
      // Update existing
      if (studyTime !== undefined) analytics.studyTime += studyTime;
      if (tasksCompleted !== undefined) analytics.tasksCompleted += tasksCompleted;
      if (sessionsCount !== undefined) analytics.sessionsCount += sessionsCount;
      if (focusScore !== undefined) analytics.focusScore = focusScore;
      if (subjectBreakdown) {
        analytics.subjectBreakdown = new Map(Object.entries(subjectBreakdown));
      }
    } else {
      // Create new
      analytics = new Analytics({
        user: req.userId,
        date: dateObj,
        studyTime: studyTime || 0,
        tasksCompleted: tasksCompleted || 0,
        sessionsCount: sessionsCount || 0,
        focusScore: focusScore || 0,
        subjectBreakdown: subjectBreakdown ? new Map(Object.entries(subjectBreakdown)) : new Map()
      });
    }

    await analytics.save();
    res.status(201).json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get summary stats
router.get('/summary', auth, async (req, res) => {
  try {
    const totalAnalytics = await Analytics.find({ user: req.userId });
    
    const summary = {
      totalStudyTime: 0,
      totalTasksCompleted: 0,
      totalSessions: 0,
      averageFocusScore: 0,
      currentStreak: 0
    };

    totalAnalytics.forEach(a => {
      summary.totalStudyTime += a.studyTime || 0;
      summary.totalTasksCompleted += a.tasksCompleted || 0;
      summary.totalSessions += a.sessionsCount || 0;
    });

    if (totalAnalytics.length > 0) {
      summary.averageFocusScore = totalAnalytics.reduce((sum, a) => sum + (a.focusScore || 0), 0) / totalAnalytics.length;
    }

    // Calculate streak (consecutive days with study time > 0)
    const sortedAnalytics = totalAnalytics.sort((a, b) => b.date - a.date);
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedAnalytics.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      const dayAnalytics = sortedAnalytics.find(a => {
        const aDate = new Date(a.date);
        aDate.setHours(0, 0, 0, 0);
        return aDate.getTime() === expectedDate.getTime();
      });

      if (dayAnalytics && dayAnalytics.studyTime > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    summary.currentStreak = streak;
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

