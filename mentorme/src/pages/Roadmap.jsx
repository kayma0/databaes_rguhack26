import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Roadmap() {
  const navigate = useNavigate();
  const location = useLocation();

  const mentee = JSON.parse(localStorage.getItem("mentorme_mentee") || "{}");
  const firstName = mentee.firstName || "there";

  const isActive = (path) => location.pathname === path;

  return (
    <div style={styles.wrap}>
      {/* Top Row (Notifications only) */}
      <div style={styles.topRow}>
        <button
          style={styles.notificationBtn}
          onClick={() => navigate("/notification")}
        >
          🔔 Notifications
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <h1 style={styles.hello}>Hello, {firstName}!</h1>
        <h2 style={styles.title}>Here is your roadmap</h2>

        <img src="/roadmap4.png" alt="Roadmap" style={styles.roadmapImage} />
      </div>

      {/* Bottom Navigation */}
      <div style={styles.bottomNav}>
        <Link
          to="/roadmap"
          style={{
            ...styles.navItem,
            ...(isActive("/roadmap") && styles.active),
          }}
        >
          🏠
          <span style={styles.navLabel}>Home</span>
        </Link>

        <Link
          to="/swipe"
          style={{
            ...styles.navItem,
            ...(isActive("/swipe") && styles.active),
          }}
        >
          🔍
          <span style={styles.navLabel}>Swipe</span>
        </Link>

        <Link
          to="/community"
          style={{
            ...styles.navItem,
            ...(isActive("/community") && styles.active),
          }}
        >
          👥
          <span style={styles.navLabel}>Community</span>
        </Link>

        <Link
          to="/goals"
          style={{
            ...styles.navItem,
            ...(isActive("/goals") && styles.active),
          }}
        >
          🎯
          <span style={styles.navLabel}>Goals</span>
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
    gap: 8, // reduced gap so content sits higher
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },

  topRow: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 0, // tighter top spacing
  },

  notificationBtn: {
    fontSize: 15,
    marginRight: -10,
    marginTop: -8,
    border: "1px solid #d3e7da",
    borderRadius: 999,
    padding: "8px 12px",
    background: "#1f5f3a",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },

  content: {
    alignSelf: "start", // 🔥 pushes everything up
    textAlign: "center",
    marginTop: 50, // small controlled spacing
  },

  hello: {
    margin: 0,
    fontSize: 40, // slightly bigger
    fontWeight: 950,
    lineHeight: 1.1,
  },

  title: {
    marginTop: 6,
    fontSize: 26,
    fontWeight: 800,
    color: "#244e62",
  },

  roadmapImage: {
    width: "100%",
    marginTop: 24,
    borderRadius: 18,
    transform: "scale(1.1)", // 🔥 makes roadmap bigger
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
};
