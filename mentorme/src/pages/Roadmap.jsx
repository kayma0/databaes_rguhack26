import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Roadmap() {
  const navigate = useNavigate();
  const location = useLocation();

  const mentee = JSON.parse(localStorage.getItem("mentorme_mentee") || "{}");
  const firstName = mentee.firstName || "there";

  const isActive = (path) => location.pathname === path;

  return (
    <div style={styles.wrap}>
      {/* Notification button (unchanged style) */}
      <button
        style={styles.notificationBtn}
        onClick={() => navigate("/notification")}
      >
        🔔 Notifications
      </button>

      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>


      <div style={styles.content}>
        <h1 style={styles.hello}>Hello {firstName}</h1>
        <h2 style={styles.title}>Here is your roadmap</h2>
      </div>

      <div style={styles.bottomNav}>
        <Link to = "/Onboarding" style={styles.navButton}>
          Account
        </Link>
        <Link to="/Swipe" style={styles.navButton}>
          Swipe
        </Link>
        <Link to="/Community" style={styles.navButton}>
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
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    gap: 18,
    position: "relative",
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
  },

  notificationBtn: {
    justifySelf: "end",
    marginTop: 2,
    fontSize: 15,
    border: "1px solid #d3e7da",
    borderRadius: 999,
    padding: "8px 12px",
    background: "#1f5f3a",
    color: "#ffffff",
    fontWeight: 900,
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

    navButton: {
    color: "#023047",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 16,
    padding: "6px 12px",
    borderRadius: 12,
    background: "#f5fbf7",
  },

    backBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    border: "none",
    borderTop: "1px solid #d3e7da",
    color: "#ffffff",
    background: "#1f5f3a",
    padding: "8px 14px",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    },
  
};
