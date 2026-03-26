import React, { useState } from "react";

const Planner = () => {
  const [subjects, setSubjects] = useState("");
  const [hours, setHours] = useState(4);
  const [goals, setGoals] = useState("");
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjects: subjects.split(",").map((s) => s.trim()),
          hoursPerDay: Number(hours),
          goals: goals.split(",").map((g) => g.trim()),
        }),
      });

      const data = await res.json();
      setPlan(data.schedule);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        🧠 AI Study Planner
      </h1>

      <input
        className="border p-2 w-full mb-3"
        placeholder="Subjects (Math, Physics, DSA)"
        value={subjects}
        onChange={(e) => setSubjects(e.target.value)}
      />

      <input
        type="number"
        className="border p-2 w-full mb-3"
        placeholder="Hours per day"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-3"
        placeholder="Priority subjects (optional)"
        value={goals}
        onChange={(e) => setGoals(e.target.value)}
      />

      <button
        onClick={generatePlan}
        className="bg-blue-600 text-white px-4 py-2 w-full"
      >
        {loading ? "Generating..." : "Generate Plan"}
      </button>

      <div className="mt-6">
        {plan.map((item, index) => (
          <div
            key={index}
            className="p-4 border rounded mb-3 shadow"
          >
            <h2 className="text-lg font-semibold">
              {item.subject}
            </h2>
            <p>⏱ Duration: {item.duration} hrs</p>
            <p>🔥 Priority: {item.priority}</p>

            <ul className="mt-2 list-disc pl-5">
              {item.recommendedTasks.map((task, i) => (
                <li key={i}>{task}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Planner;
