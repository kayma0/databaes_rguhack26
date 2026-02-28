import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Software Engineer");
  const [cvFile, setCvFile] = useState(null);

  function handleContinue() {
    // For demo: store minimal data in localStorage
    localStorage.setItem(
      "mentorme_mentee",
      JSON.stringify({ name, role, cvName: cvFile?.name || null }),
    );
    nav("/swipe");
  }

  return (
    <div style={styles.wrap}>
      <img src="/mentorme.png" style={styles.logo} alt="Mentor Me logo" />
      <h2 style={styles.h2}>Your Profile</h2>

      <label style={styles.label}>Name</label>
      <input
        style={styles.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Aisha"
      />

      <label style={styles.label}>Target Role</label>
      <select
        style={styles.input}
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option>Software Engineer</option>
        <option>Data Analyst</option>
        <option>Consulting</option>
        <option>Marketing</option>
        <option>Finance</option>
      </select>

      <label style={styles.label}>Upload CV (PDF)</label>
      <input
        style={styles.input}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => setCvFile(e.target.files?.[0] || null)}
      />

      {cvFile && (
        <div style={styles.card}>
          <div style={{ fontWeight: 700 }}>Selected:</div>
          <div style={{ opacity: 0.8 }}>{cvFile.name}</div>
        </div>
      )}

      <button
        style={{ ...styles.btn, opacity: name ? 1 : 0.5 }}
        disabled={!name}
        onClick={handleContinue}
      >
        Continue to Mentor Matching →
      </button>

      <p style={styles.small}>
        Demo tip: CV parsing/AI can be added later — for now just upload and
        store filename.
      </p>
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
    gap: 10,
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
  },
  logo: {
    width: "min(220px, 58vw)",
    height: "auto",
    margin: "6px auto 2px",
    background: "#e4f2e8",
    borderRadius: 16,
    padding: 8,
  },
  h2: { marginTop: 8, marginBottom: 6, color: "#023047" },
  label: { fontSize: 13, fontWeight: 700, opacity: 0.85, color: "#244e62" },
  input: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #d3e7da",
    fontSize: 15,
    color: "#023047",
    background: "#ffffff",
  },
  card: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #d3e7da",
    background: "#ffffff",
  },
  btn: {
    padding: 14,
    borderRadius: 14,
    border: "1px solid #7fb491",
    background: "#94c3a3",
    color: "#023047",
    fontWeight: 700,
  },
  small: { fontSize: 12, opacity: 0.75, marginTop: 6, color: "#244e62" },
};
