import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function MentorGoals() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const mentor = JSON.parse(localStorage.getItem("mentorme_mentor") || "{}");
  const firstName = mentor.firstName || "Mentor";

  const key = useMemo(() => {
    const id = (mentor.email || mentor.name || "default").trim().toLowerCase();
    return `mentorme_mentor_goals_${id}`;
  }, [mentor.email, mentor.name]);

  const [goalInput, setGoalInput] = useState("");
  const [goals, setGoals] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const persist = (nextGoals) => {
    setGoals(nextGoals);
    localStorage.setItem(key, JSON.stringify(nextGoals));
  };

  const addGoal = () => {
    const text = goalInput.trim();
    if (!text) return;

    const nextGoals = [
      {
        id: crypto.randomUUID ? crypto.randomUUID() : `${new Date().toISOString()}-goal`,
        text,
        done: false,
        createdAt: new Date().toISOString(),
      },
      ...goals,
    ];

    persist(nextGoals);
    setGoalInput("");
  };

  const toggleGoal = (goalId) => {
    const nextGoals = goals.map((goal) =>
      goal.id === goalId ? { ...goal, done: !goal.done } : goal,
    );
    persist(nextGoals);
  };

  const deleteGoal = (goalId) => {
    persist(goals.filter((goal) => goal.id !== goalId));
  };

  const completed = goals.filter((goal) => goal.done).length;
  const total = goals.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div style={styles.wrap}>
      <div style={styles.topRow}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <h1 style={styles.h1}>{firstName}'s Mentor Goals</h1>
      <p style={styles.sub}>Track your mentoring priorities and follow-ups.</p>

      <div style={styles.progressCard}>
        <div style={styles.progressHead}>
          <span style={styles.progressText}>
            {completed}/{total} completed
          </span>
          <span style={styles.progressPct}>{percent}%</span>
        </div>
        <div style={styles.progressBarWrap}>
          <div style={{ ...styles.progressBarFill, width: `${percent}%` }} />
        </div>
      </div>

      <div style={styles.inputRow}>
        <input
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
          placeholder="Add a mentor goal..."
          style={styles.input}
          onKeyDown={(e) => {
            if (e.key === "Enter") addGoal();
          }}
        />
        <button style={styles.addBtn} onClick={addGoal}>
          Add
        </button>
      </div>

      {goals.length === 0 ? (
        <div style={styles.empty}>No mentor goals yet. Add your first goal above.</div>
      ) : (
        <div style={styles.list}>
          {goals.map((goal) => (
            <div key={goal.id} style={styles.goalCard}>
              <label style={styles.goalLabel}>
                <input
                  type="checkbox"
                  checked={goal.done}
                  onChange={() => toggleGoal(goal.id)}
                />
                <span
                  style={{
                    ...styles.goalText,
                    ...(goal.done ? styles.goalDone : {}),
                  }}
                >
                  {goal.text}
                </span>
              </label>
              <button style={styles.deleteBtn} onClick={() => deleteGoal(goal.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.bottomNav}>
        <Link
          to="/mentor"
          style={{
            ...styles.navItem,
            ...(isActive("/mentor") && styles.active),
          }}
        >
          🏠 <span style={styles.navLabel}>Dashboard</span>
        </Link>

        <Link
          to="/mentor-community"
          style={{
            ...styles.navItem,
            ...(isActive("/mentor-community") && styles.active),
          }}
        >
          👥 <span style={styles.navLabel}>Community</span>
        </Link>

        <Link
          to="/mentor-goals"
          style={{
            ...styles.navItem,
            ...(isActive("/mentor-goals") && styles.active),
          }}
        >
          🎯 <span style={styles.navLabel}>Goals</span>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    padding: 18,
    paddingBottom: 90,
    maxWidth: 420,
    margin: "0 auto",
    display: "grid",
    gap: 12,
    alignContent: "start",
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },

  backBtn: {
    border: "none",
    color: "#ffffff",
    background: "#1f5f3a",
    padding: "8px 14px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },

  h1: { margin: "6px 0 0", fontSize: 30, fontWeight: 950 },
  sub: { margin: 0, opacity: 0.8, fontWeight: 600 },

  progressCard: {
    border: "1px solid #cfe3d7",
    borderRadius: 16,
    background: "#ffffff",
    padding: 12,
  },

  progressHead: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  progressText: { fontWeight: 700 },
  progressPct: { fontWeight: 900, color: "#1f5f3a" },

  progressBarWrap: {
    height: 10,
    borderRadius: 999,
    background: "#edf4ef",
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    background: "#1f5f3a",
    borderRadius: 999,
    transition: "width 0.2s ease",
  },

  inputRow: { display: "flex", gap: 8 },

  input: {
    flex: 1,
    borderRadius: 12,
    border: "1px solid #cfe3d7",
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    background: "#ffffff",
  },

  addBtn: {
    border: "none",
    borderRadius: 12,
    background: "#1f5f3a",
    color: "#ffffff",
    fontWeight: 800,
    padding: "10px 14px",
    cursor: "pointer",
  },

  empty: {
    border: "1px dashed #c5dbcd",
    borderRadius: 14,
    padding: 14,
    background: "#ffffff",
    color: "#3a5968",
    fontWeight: 600,
  },

  list: { display: "grid", gap: 10 },

  goalCard: {
    border: "1px solid #cfe3d7",
    borderRadius: 14,
    background: "#ffffff",
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },

  goalLabel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  goalText: {
    fontWeight: 700,
    color: "#244e62",
  },

  goalDone: {
    textDecoration: "line-through",
    opacity: 0.65,
  },

  deleteBtn: {
    border: "1px solid #d3e7da",
    borderRadius: 10,
    padding: "7px 10px",
    background: "#ffffff",
    color: "#244e62",
    fontWeight: 700,
    cursor: "pointer",
  },

  bottomNav: {
    width: "100%",
    maxWidth: 420,
    display: "flex",
    justifyContent: "space-around",
    padding: "12px 0",
    borderTop: "1px solid #d3e7da",
    background: "#ffffff",
    borderRadius: "12px 12px 0 0",
    boxShadow: "0 -2px 8px rgba(2, 48, 71, 0.08)",
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
  },

  navItem: {
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    fontSize: 22,
    color: "#7a9e8c",
    fontWeight: 600,
  },

  navLabel: { fontSize: 11 },

  active: {
    color: "#1f5f3a",
    fontWeight: 900,
  },
};
