import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const nav = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [interests, setInterests] = useState("");
  const [cvFile, setCvFile] = useState(null);

  function handleContinue() {
    // For demo: store minimal data in localStorage
    localStorage.setItem(
      "mentorme_mentee",
      JSON.stringify({
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        email,
        role,
        interests,
        cvName: cvFile?.name || null,
      }),
    );
    nav("/swipe");
  }

  return (
    <div style={styles.wrap}>
      <img src="/mentorme.png" style={styles.logo} alt="Mentor Me logo" />
      <h2 style={styles.h2}>Your Profile</h2>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>First Name</label>
        <input
          style={styles.input}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="e.g. Aisha"
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Last Name</label>
        <input
          style={styles.input}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="e.g. Khan"
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Email</label>
        <input
          style={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. aisha@email.com"
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Target Role</label>
        <input
          style={styles.input}
          list="target-role-options"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Search or select a role"
        />
        <datalist id="target-role-options">
          <option value="Software Engineer" />
          <option value="Data Analyst" />
          <option value="Product Manager" />
          <option value="Consultant" />
          <option value="Marketing" />
          <option value="Finance" />
          <option value="Law" />
          <option value="Healthcare" />
          <option value="Teacher / Education" />
          <option value="Entrepreneur" />
        </datalist>
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Interests and Societies</label>
        <textarea
          style={{ ...styles.input, ...styles.textarea }}
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="e.g. Women in Tech Society"
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Upload CV (PDF)</label>
        <input
          style={styles.input}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setCvFile(e.target.files?.[0] || null)}
        />
      </div>

      {cvFile && (
        <div style={styles.card}>
          <div style={{ fontWeight: 700 }}>Selected:</div>
          <div style={{ opacity: 0.8 }}>{cvFile.name}</div>
        </div>
      )}
  <Link
      to="/Welcome"
      style={{
        ...styles.btn,
        opacity: firstName ? 1 : 0.5,
        pointerEvents: firstName ? "auto" : "none", // disables click
        display: "inline-block",
        textAlign: "center",
      }}
>
      Continue
    </Link>
      <button
        style={{ ...styles.btn, opacity: firstName && lastName && email ? 1 : 0.5 }}
        disabled={!firstName || !lastName || !email}
        onClick={handleContinue}
      >
        Continue to Mentor Matching →
      </button>
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
    gap: 12,
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
  fieldGroup: {
    display: "grid",
    gap: 2,
    marginBottom: 6,
  },
  label: { fontSize: 13, fontWeight: 700, opacity: 0.85, color: "#244e62" },
  input: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #d3e7da",
    fontSize: 15,
    color: "#023047",
    background: "#ffffff",
  },
  textarea: {
    minHeight: 92,
    resize: "vertical",
  },
  card: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #d3e7da",
    background: "#ffffff",
  },
  btn: {
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    border: "1px solid #7fb491",
    background: "#94c3a3",
    color: "#023047",
    fontWeight: 700,
  },
};
