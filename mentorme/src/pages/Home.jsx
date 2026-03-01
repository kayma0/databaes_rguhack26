import { Link } from "react-router-dom";

export default function Home() {
  const logoSrc = `${import.meta.env.BASE_URL}mentorWho.jpg`;

  return (
    <div style={styles.wrap}>
      <div style={styles.logoWrap}>
        <img src={logoSrc} style={styles.logo} alt="Mentor Me logo" />
      </div>
      <p style={styles.p}>Guidance for a Better Tomorrow</p>
      <Link to="/onboarding" style={styles.btnPrimary}>
        Click to begin
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
  logoWrap: {
    width: "min(360px, 90vw)",
    // background: "#e4f2e8",
    borderRadius: 20,
    padding: 10,
    margin: "34px auto 6px",
    display: "flex",
    justifyContent: "center",
    // boxShadow: "0 4px 12px rgba(2, 48, 71, 0.08)",
  },
  logo: {
    width: "min(340px, 86vw)",
    height: "auto",
    display: "block",
    objectFit: "contain",
  },
  p: {
    margin: "4px 0 10px",
    opacity: 0.9,
    color: "#0c384e",
    textAlign: "center",
    fontSize: 25,
    fontWeight: 600,
    fontFamily: "Times New Roman",
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
