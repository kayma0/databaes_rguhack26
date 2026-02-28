import { Link } from "react-router-dom";

export default function Welcome({ firstName, lastName }) {
return (
    <div style={styles.wrap}>
    <h1 style={styles.heading}>
        Hello, {firstName} {lastName}
    </h1>

    <p style={styles.p}>Ready to find your mentor?</p>

    <Link to="/swipe.jsx" style={styles.btnPrimary}>
        Start Swiping
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
    justifyContent: "center",
    alignItems: "center",
    gap: 28,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
},

heading: {
    margin: "10px 0 0",
    fontSize: 28,
    fontWeight: 900,
    textAlign: "center",
    color: "#023047",
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

