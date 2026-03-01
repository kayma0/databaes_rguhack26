import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Welcome() {
  const location = useLocation();
  const navigate = useNavigate();

  const { firstName = "there", lastName = "" } = location.state || {};
  const isActive = (path) => location.pathname === path;

  return (
    <div style={styles.wrap}>
      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div style={styles.content}>
        <h1 style={styles.heading}>
          Hello, {firstName} {lastName}
        </h1>

        <p style={styles.p}>Ready to find your mentor?</p>

        <Link to="/swipe" style={styles.btnPrimary}>
          Start Swiping →
        </Link>
      </div>

      {/* Roadmap-style Bottom Navbar */}
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
    paddingBottom: 90, // ✅ important so fixed navbar doesn't cover content
    maxWidth: 420,
    margin: "0 auto",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    gap: 18,
    position: "relative",
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },

  backBtn: {
    justifySelf: "start",
    marginTop: 2,
    border: "1px solid #d3e7da",
    borderRadius: 12,
    padding: "8px 12px",
    background: "#1f5f3a",
    color: "#ffffff",
    fontWeight: 900,
    width: "fit-content",
  },

  content: {
    alignSelf: "center",
    textAlign: "center",
    display: "grid",
    gap: 14,
    justifyItems: "center",
  },

  heading: {
    margin: 0,
    fontSize: 30,
    fontWeight: 900,
  },

  p: {
    margin: 0,
    opacity: 0.9,
    fontSize: 18,
    fontWeight: 600,
    color: "#0c384e",
  },

  btnPrimary: {
    width: "100%",
    maxWidth: 360,
    marginTop: 22,
    padding: 18,
    borderRadius: 20,
    textAlign: "center",
    background: "#1f5f3a",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 800,
    border: "1px solid #1a4f31",
  },

  // ✅ EXACT same navbar as Roadmap
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
