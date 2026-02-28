import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={styles.wrap}>
      <img src="/mentorme.png" style={styles.logo} alt="Mentor Me logo" />
      <h1 style={styles.h1}>MentorMe</h1>
      <p style={styles.p}>Guidance for a better tomorrow</p>

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
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
  },
  logo: {
    width: "min(180px, 50vw)",
    height: "auto",
    margin: "0 auto 2px",
  },
  h1: { margin: 0, fontSize: 34 },
  p: { margin: 0, opacity: 0.8, color: "#0c384e" },
  btn: {
    padding: 14,
    borderRadius: 14,
    textAlign: "center",
    background: "#94c3a3",
    color: "#023047",
    textDecoration: "none",
    fontWeight: 700,
    border: "1px solid #7fb491",
  },
  btnSecondary: {
    padding: 14,
    borderRadius: 14,
    textAlign: "center",
    border: "1px solid #d3e7da",
    background: "#ffffff",
    color: "#023047",
    textDecoration: "none",
    fontWeight: 600,
  },
};
