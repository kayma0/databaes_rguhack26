import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={styles.wrap}>
      <h1 style={styles.h1}>MentorMe</h1>
      <p style={styles.p}>Career help, matched fast.</p>

      <div style={{ display: "grid", gap: 12, width: "100%" }}>
        <Link to="/onboarding" style={styles.btn}>
          Start (CV + Profile)
        </Link>
        <Link to="/swipe" style={styles.btnSecondary}>
          Swipe Mentors
        </Link>
        <Link to="/community" style={styles.btnSecondary}>
          Community
        </Link>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    padding: 18,
    maxWidth: 420,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 12,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },
  h1: { margin: 0, fontSize: 34 },
  p: { margin: 0, opacity: 0.8 },
  btn: {
    padding: 14,
    borderRadius: 14,
    textAlign: "center",
    background: "black",
    color: "white",
    textDecoration: "none",
    fontWeight: 600,
  },
  btnSecondary: {
    padding: 14,
    borderRadius: 14,
    textAlign: "center",
    border: "1px solid #ddd",
    color: "black",
    textDecoration: "none",
    fontWeight: 600,
  },
};
