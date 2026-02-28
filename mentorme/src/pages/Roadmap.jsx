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

      <div style={styles.content}>
        <h1 style={styles.hello}>Hello {firstName}</h1>
        <h2 style={styles.title}>Here is your roadmap</h2>
      </div>

      {/* Bottom Navigation */}
      <div style={styles.bottomNav}>
        <Link
          to="/onboarding"
          style={{
            ...styles.navItem,
            ...(isActive("/onboarding") && styles.active),
          }}
        >
          👤
          <span style={styles.navLabel}>Profile</span>
        </Link>

        <Link
          to="/swipe"
          style={{
            ...styles.navItem,
            ...(isActive("/swipe") && styles.active),
          }}
        >
          ⬅️ ➡️
          <span style={styles.navLabel}>Swipe</span>
        </Link>

        <Link
          to="/chat"
          style={{
            ...styles.navItem,
            ...(isActive("/chat") && styles.active),
          }}
        >
          💬
          <span style={styles.navLabel}>Community</span>
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
    fontSize: 15,
    border: "1px solid #d3e7da",
    borderRadius: 999,
    padding: "8px 12px",
    background: "#ffffff",
    color: "#023047",
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
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "12px 0",
    borderTop: "1px solid #d3e7da",
    background: "#ffffff",
    borderRadius: 16,
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
};
