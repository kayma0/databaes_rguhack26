import { Link } from "react-router-dom";

export default function Menu() {
  return (
    <div style={styles.wrap}>
      <div style={styles.actions}>
        <Link to="/onboarding" style={styles.btnPrimary}>
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
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 24,
    paddingTop: 120,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
  },
  actions: {
    display: "grid",
    gap: 20,
    width: "100%",
    marginTop: 8,
  },
  btnPrimary: {
    padding: 18,
    borderRadius: 20,
    textAlign: "center",
    background: "#94c3a3",
    color: "#023047",
    textDecoration: "none",
    fontWeight: 700,
    border: "1px solid #7fb491",
  },
  btnSecondary: {
    padding: 18,
    borderRadius: 20,
    textAlign: "center",
    border: "1px solid #d3e7da",
    background: "#ffffff",
    color: "#023047",
    textDecoration: "none",
    fontWeight: 600,
  },
};
