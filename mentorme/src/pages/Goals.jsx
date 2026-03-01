import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const storageKeyFor = (mentee) => {
  const id = (mentee.email || mentee.name || "default").trim().toLowerCase();
  return `mentorme_goals_${id}`;
};

export default function Goals() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const mentee = JSON.parse(localStorage.getItem("mentorme_mentee") || "{}");
  const firstName = mentee.firstName || "there";
  const storageKey = storageKeyFor(mentee);

  const [goals, setGoals] = useState([]);
  const [goalInput, setGoalInput] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setGoals(Array.isArray(saved) ? saved : []);
    } catch {
      setGoals([]);
    }
  }, [storageKey]);

  const persist = (nextGoals) => {
    setGoals(nextGoals);
    localStorage.setItem(storageKey, JSON.stringify(nextGoals));
  };

  const addGoal = () => {
    const text = goalInput.trim();
    if (!text) return;

    const nextGoals = [
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
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

  const { completed, total, percent } = useMemo(() => {
    const totalGoals = goals.length;
    const doneGoals = goals.filter((goal) => goal.done).length;
    return {
      completed: doneGoals,
      total: totalGoals,
      percent: totalGoals ? Math.round((doneGoals / totalGoals) * 100) : 0,
    };
  }, [goals]);

  return (
    <div style={styles.wrap}>
      <div style={styles.topRow}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <h1 style={styles.h1}>{firstName}'s Goal Tracker</h1>
      <p style={styles.sub}>Track your mentorship goals each week.</p>

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
          placeholder="Add a new goal..."
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
        <div style={styles.empty}>No goals yet. Add your first goal above.</div>
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
          to="/roadmap"
          style={{
            ...styles.navItem,
            ...(isActive("/roadmap") && styles.active),
          }}
        >
          🏠 <span style={styles.navLabel}>Home</span>
        </Link>

        <Link
          to="/swipe"
          style={{
            ...styles.navItem,
            ...(isActive("/swipe") && styles.active),
          }}
        >
          🔍 <span style={styles.navLabel}>Swipe</span>
        </Link>

        <Link
          to="/community"
          style={{
            ...styles.navItem,
            ...(isActive("/community") && styles.active),
          }}
        >
          👥 <span style={styles.navLabel}>Community</span>
        </Link>

        <Link
          to="/goals"
          style={{
            ...styles.navItem,
            ...(isActive("/goals") && styles.active),
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

  navLabel: {
    fontSize: 11,
  },

  active: {
    color: "#1f5f3a",
    fontWeight: 900,
  },
};
