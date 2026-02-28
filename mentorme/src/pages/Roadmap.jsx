import { Link, useNavigate } from "react-router-dom";

export default function Roadmap() {
  const navigate = useNavigate();
  const mentee = JSON.parse(localStorage.getItem("mentorme_mentee") || "{}");
  const firstName = mentee.firstName || "there";

  return (
    <div style={styles.wrap}>
      <button style={styles.notificationBtn} onClick={() => navigate("/notification")}>
        🔔 Notifications
      </button>

      <div style={styles.content}>
        <h1 style={styles.hello}>Hello {firstName}</h1>
        <h2 style={styles.title}>Here is your roadmap</h2>
      </div>

      <div style={styles.options}>
        <Link to="/onboarding" style={styles.optionPrimary}>
          Update account details
        </Link>
        <Link to="/swipe" style={styles.optionSecondary}>
          Swipe
        </Link>
        <Link to="/chat" style={styles.optionSecondary}>
          Connection
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
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    gap: 18,
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
  },
  notificationBtn: {
    justifySelf: "end",
    marginTop: 2,
    border: "1px solid #d3e7da",
    borderRadius: 999,
    padding: "8px 12px",
    background: "#ffffff",
    color: "#023047",
    fontWeight: 700,
  },
  content: {
    alignSelf: "center",
    textAlign: "center",
  },
  hello: {
    margin: 0,
    fontSize: 36,
    lineHeight: 1.1,
  },
  title: {
    marginTop: 10,
    marginBottom: 0,
    fontSize: 24,
    color: "#244e62",
  },
  options: {
    display: "grid",
    gap: 12,
    marginBottom: 6,
  },
  optionPrimary: {
    textDecoration: "none",
    textAlign: "center",
    padding: 14,
    borderRadius: 14,
    fontWeight: 800,
    border: "1px solid #7fb491",
    background: "#94c3a3",
    color: "#023047",
  },
  optionSecondary: {
    textDecoration: "none",
    textAlign: "center",
    padding: 14,
    borderRadius: 14,
    fontWeight: 700,
    border: "1px solid #d3e7da",
    background: "#ffffff",
    color: "#023047",
  },
};
