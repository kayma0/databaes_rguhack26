import { useMemo, useState } from "react";
import { mentors as seed } from "../data/mentors.js";
import { Link } from "react-router-dom";

export default function Swipe() {
  const [index, setIndex] = useState(0);
  const mentors = useMemo(() => seed, []);

  const current = mentors[index];

  function swipe(decision) {
    // Save decisions for demo
    const saved = JSON.parse(localStorage.getItem("mentorme_swipes") || "[]");
    saved.push({
      mentorId: current.id,
      decision,
      at: new Date().toISOString(),
    });
    localStorage.setItem("mentorme_swipes", JSON.stringify(saved));

    setIndex((i) => Math.min(i + 1, mentors.length));
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.top}>
        <h2 style={{ margin: 0 }}>Mentor Matches</h2>
        <Link to="/community" style={styles.link}>
          Community
        </Link>
      </div>

      {!current ? (
        <div style={styles.done}>
          <h3>No more mentors 🎉</h3>
          <p style={{ opacity: 0.8 }}>
            You can revisit later or check community.
          </p>
          <Link to="/chat" style={styles.btn}>
            Go to Requests / Chat →
          </Link>
        </div>
      ) : (
        <>
          <div style={styles.card}>
            <div style={styles.match}>{current.match}% match</div>
            <div style={styles.name}>{current.name}</div>
            <div style={styles.title}>{current.title}</div>

            <div style={{ marginTop: 12 }}>
              <div style={styles.sectionTitle}>Helps with</div>
              <div style={styles.tags}>
                {current.helpsWith.map((t) => (
                  <span key={t} style={styles.tag}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <p style={styles.bio}>{current.bio}</p>
          </div>

          <div style={styles.actions}>
            <button style={styles.nope} onClick={() => swipe("left")}>
              ✕
            </button>
            <button style={styles.like} onClick={() => swipe("right")}>
              ❤
            </button>
          </div>

          <p style={styles.small}>Swipe right to request. Left to skip.</p>
        </>
      )}
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
    gap: 14,
    alignContent: "start",
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  link: { textDecoration: "none", fontWeight: 700, color: "#023047" },
  card: {
    position: "relative",
    padding: 16,
    borderRadius: 18,
    border: "1px solid #d3e7da",
    background: "white",
    boxShadow: "0 8px 24px rgba(2, 48, 71, 0.08)",
  },
  match: {
    position: "absolute",
    top: 12,
    right: 12,
    fontSize: 12,
    fontWeight: 800,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #d3e7da",
    color: "#023047",
    background: "#ffffff",
  },
  name: { fontSize: 28, fontWeight: 900, marginTop: 18 },
  title: { opacity: 0.85, fontWeight: 600, color: "#244e62" },
  sectionTitle: {
    fontWeight: 800,
    fontSize: 13,
    opacity: 0.8,
    marginBottom: 8,
  },
  tags: { display: "flex", flexWrap: "wrap", gap: 8 },
  tag: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #d3e7da",
    background: "#f5fbf7",
    color: "#023047",
  },
  bio: { marginTop: 14, opacity: 0.85, lineHeight: 1.35, color: "#244e62" },
  actions: { display: "flex", justifyContent: "center", gap: 16 },
  nope: {
    width: 64,
    height: 64,
    borderRadius: 999,
    border: "1px solid #d3e7da",
    fontSize: 22,
    background: "white",
    color: "#023047",
  },
  like: {
    width: 64,
    height: 64,
    borderRadius: 999,
    border: "1px solid #7fb491",
    fontSize: 22,
    background: "#94c3a3",
    color: "#023047",
  },
  small: { textAlign: "center", fontSize: 12, opacity: 0.75, color: "#244e62" },
  done: {
    padding: 16,
    borderRadius: 18,
    border: "1px solid #d3e7da",
    background: "#ffffff",
  },
  btn: {
    display: "inline-block",
    marginTop: 8,
    padding: 12,
    borderRadius: 14,
    background: "#94c3a3",
    color: "#023047",
    textDecoration: "none",
    fontWeight: 800,
    border: "1px solid #7fb491",
  },
};
