import { Link } from "react-router-dom";
import { mentors } from "../data/mentors.js";

export default function Chat() {
  const swipes = JSON.parse(localStorage.getItem("mentor_swipes") || "[]");
  const liked = swipes.filter((s) => s.decision === "right" || s.decision === "request");
  const mentorById = new Map(mentors.map((mentor) => [String(mentor.id), mentor.name]));

  return (
    <div style={styles.wrap}>
      <h2 style={{ marginTop: 8, color: "#023047" }}>Requests</h2>
      <p style={{ opacity: 0.85, color: "#244e62" }}>
        Demo page: show mentors you requested (swiped right).
      </p>

      {liked.length === 0 ? (
        <p style={{ opacity: 0.75, color: "#244e62" }}>No requests yet. Go swipe mentors.</p>
      ) : (
        <ul style={styles.list}>
          {liked.map((x) => (
            <li key={x.at} style={styles.listItem}>
              {mentorById.get(String(x.mentorId)) || "Mentor"} — requested
            </li>
          ))}
        </ul>
      )}

      <Link to="/swipe" style={styles.backLink}>
        ← Back to swipe
      </Link>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    padding: 18,
    maxWidth: 420,
    margin: "0 auto",
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
  },
  list: {
    paddingLeft: 18,
  },
  listItem: {
    marginBottom: 8,
    color: "#244e62",
  },
  backLink: {
    textDecoration: "none",
    fontWeight: 800,
    color: "#023047",
  },
};
