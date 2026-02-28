import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Welcome() {
  const location = useLocation();
  const navigate = useNavigate();
  const { firstName = "there", lastName = "" } = location.state || {};

  return (
    <div style={styles.wrap}>

      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1 style={styles.heading}>
        Hello, {firstName} {lastName}
      </h1>

      <p style={styles.p}>Ready to find your mentor?</p>

      <Link to="/Swipe" style={styles.btnPrimary}>
        Start Swiping →
      </Link>

      
    <div style={styles.bottomNav}>
        <Link to="/roadmap" style={styles.navItem}>
            🏠
            <span style={styles.navLabel}>Home</span>
        </Link>
    
        <Link to="/swipe" style={styles.navItem}>
            🔍
            <span style={styles.navLabel}>Swipe</span>
        </Link>
    
            {/* THIS IS COMMUNITY */}
        <Link to="/community" style={styles.navItem}>
            👥
            <span style={styles.navLabel}>Community</span>
        </Link>
    
            {/* THIS IS CHAT / REQUESTS */}
        <Link to="/chat" style={styles.navItem}>
            💬
            <span style={styles.navLabel}>Requests</span>
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
    alignItems: "center",
    gap: 28,
    position: "relative",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
  },

  heading: {
    margin: "10px 0 0",
    fontSize: 28,
    fontWeight: 900,
    textAlign: "center",
  },

  p: {
    margin: "4px 0 10px",
    opacity: 0.9,
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

   navItem: {
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    fontSize: 10,
    color: "#7a9e8c",
    fontWeight: 600,
  },
};
