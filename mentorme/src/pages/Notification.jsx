import { useMemo } from "react";
import { Link } from "react-router-dom";

export default function Notification() {
  const mentorName = useMemo(() => {
    const mentorNames = ["Sarah", "David", "Lena", "Omar", "Samira", "Maya"];
    const indexKey = "mentorme_notification_mentor_index";
    const lastIndex = Number(localStorage.getItem(indexKey) || "-1");
    const nextIndex = (lastIndex + 1) % mentorNames.length;

    localStorage.setItem(indexKey, String(nextIndex));
    return mentorNames[nextIndex];
  }, []);

  return (
    <div style={styles.wrap}>
      <h2 style={styles.h2}>Notifications</h2>
      <div style={styles.card}>
        <div style={styles.cardTop}>
          <div style={styles.icon}>🔔</div>
          <div>
            <p style={styles.tag}>New Update</p>
            <p style={styles.cardTitle}>Mentor Match Confirmed</p>
          </div>
        </div>
        <p style={styles.message}>
          <span style={styles.mentorName}>{mentorName}</span> has accepted your
          invitation to be your mentor.
        </p>
      </div>
      <Link to="/roadmap" style={styles.backLink}>
        ← Back to roadmap
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
    display: "grid",
    gap: 16,
    alignContent: "start",
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  h2: {
    marginTop: 10,
    marginBottom: 0,
    fontSize: 30,
    letterSpacing: "0.01em",
  },
  card: {
    border: "1px solid #cfe3d7",
    borderRadius: 18,
    background: "#ffffff",
    padding: 16,
    color: "#244e62",
    boxShadow: "0 10px 22px rgba(2, 48, 71, 0.08)",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "#e8f3ec",
    fontSize: 20,
  },
  tag: {
    margin: 0,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#3d6a57",
  },
  cardTitle: {
    margin: "2px 0 0",
    fontSize: 17,
    fontWeight: 800,
    color: "#023047",
  },
  message: {
    margin: 0,
    lineHeight: 1.45,
    fontSize: 15,
    color: "#244e62",
  },
  mentorName: {
    fontWeight: 800,
    color: "#1f5f3a",
  },
  backLink: {
    textDecoration: "none",
    fontWeight: 700,
    color: "#023047",
    marginTop: 2,
  },
};
