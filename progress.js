const express = require("express");
const router = express.Router();

let progressData = [];

router.post("/", (req, res) => {
  const { subject, score, timeSpent } = req.body;

  if (!subject || score == null) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const entry = {
    subject,
    score,
    timeSpent: timeSpent || 0,
    date: new Date(),
  };

  progressData.push(entry);

  res.status(201).json({
    message: "Progress recorded",
    entry,
  });
});

router.get("/", (req, res) => {
  res.json(progressData);
});

router.get("/analytics", (req, res) => {
  const summary = {};

  progressData.forEach((item) => {
    if (!summary[item.subject]) {
      summary[item.subject] = {
        attempts: 0,
        avgScore: 0,
        totalTime: 0,
      };
    }

    summary[item.subject].attempts += 1;
    summary[item.subject].avgScore += item.score;
    summary[item.subject].totalTime += item.timeSpent;
  });

  Object.keys(summary).forEach((sub) => {
    summary[sub].avgScore =
      summary[sub].avgScore / summary[sub].attempts;
  });

  res.json(summary);
});

module.exports = router;
