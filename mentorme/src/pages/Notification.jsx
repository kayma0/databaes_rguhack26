import { Link } from "react-router-dom";

export default function Notification() {
  return (
    <div style={styles.wrap}>
      <h2 style={styles.h2}>Notifications</h2>
      <div style={styles.card}>No new notifications yet.</div>
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
    gap: 14,
    alignContent: "start",
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
  },
  h2: {
    marginTop: 8,
    marginBottom: 0,
  },
  card: {
    border: "1px solid #d3e7da",
    borderRadius: 14,
    background: "#ffffff",
    padding: 14,
    color: "#244e62",
  },
  backLink: {
    textDecoration: "none",
    fontWeight: 700,
    color: "#023047",
  },
};
