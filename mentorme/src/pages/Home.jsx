import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={styles.wrap}>
      <img src="mentorme.png" style={styles.logo} alt="Mentor Me logo" />
      <h1 style={styles.h1}>MentorMe</h1>
      <p style={styles.p}>Guidance for a better tomorrow</p>
      <Link to="/onboarding" style={styles.btnPrimary}>
        Upload CV to begin
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
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 28,
    paddingTop: 90,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
  },
  logo: {
    width: "min(340px, 86vw)",
    height: "auto",
    margin: "34px auto 6px",
    background: "#e4f2e8",
    borderRadius: 20,
    padding: 10,
  },
  p: {
    margin: "4px 0 10px",
    opacity: 0.9,
    color: "#0c384e",
    textAlign: "center",
    fontSize: 20,
    fontWeight: 600,
  },
  btnPrimary: {
    width: "100%",
    maxWidth: 360,
    marginTop: 56,
    padding: 18,
    borderRadius: 20,
    textAlign: "center",
    background: "#1f5f3a",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
    border: "1px solid #1a4f31",
  },
};
