const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const { subjects, hoursPerDay, goals } = req.body;

  if (!subjects || !hoursPerDay) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const schedule = subjects.map((subject) => {
    let priority = "Medium";

    if (goals && goals.includes(subject)) {
      priority = "High";
    }

    const duration =
      priority === "High"
        ? Math.ceil(hoursPerDay / subjects.length + 1)
        : Math.floor(hoursPerDay / subjects.length);

    return {
      subject,
      duration,
      priority,
      recommendedTasks: [
        "Revise concepts",
        "Practice questions",
        "Take mini test",
      ],
    };
  });

  schedule.sort(() => Math.random() - 0.5);

  res.json({
    message: "AI study plan generated successfully",
    totalSubjects: subjects.length,
    totalHours: hoursPerDay,
    schedule,
  });
});

module.exports = router;
