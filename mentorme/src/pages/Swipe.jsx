import { useState } from "react";
import TinderCard from "react-tinder-card";

const mentors = [
  {
    id: 1,
    name: "Sarah",
    title: "Software Engineer",
    match: 92,
    helpsWith: ["React", "Node.js", "Career Advice"],
    bio: "I love mentoring juniors in software engineering and helping them grow their careers.",
  },
  {
    id: 2,
    name: "David",
    title: "Data Scientist",
    match: 87,
    helpsWith: ["Python", "Machine Learning", "Resume Review"],
    bio: "Passionate about data and helping others get into data science roles.",
  },
];

export default function MentorSwipe() {
  const [index, setIndex] = useState(0);

  const current = mentors[index];

  const swipe = (decision) => {
    if (!current) return;

    // Save swipe in localStorage
    const saved = JSON.parse(localStorage.getItem("mentor_swipes") || "[]");
    saved.push({
      mentorId: current.id,
      decision,
      at: new Date().toISOString(),
    });
    localStorage.setItem("mentor_swipes", JSON.stringify(saved));

    setIndex((i) => i + 1);
  };

  return (
    <div style={styles.wrap}>
      <h2 style={{ marginBottom: 10 }}>Mentor Matches</h2>

      {!current ? (
        <div style={styles.done}>
          <h3>No more mentors</h3>
          <p style={{ opacity: 0.8 }}>
            You can revisit later or check the community.
          </p>
        </div>
      ) : (
        <>
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <TinderCard
              key={current.id}
              onSwipe={(dir) => swipe(dir === "right" ? "right" : "left")}
              preventSwipe={["up", "down"]}
            >
              <div
                style={{
                  ...styles.card,
                  backgroundImage: `url(${current.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div style={styles.match}>{current.match}% match</div>
                <div style={styles.info}>
                  <h2 style={styles.name}>{current.name}</h2>
                  <p style={styles.title}>{current.title}</p>
                  <div style={{ marginTop: 8 }}>
                    <div style={styles.sectionTitle}>Helps with</div>
                    <div style={styles.tags}>
                      {current.helpsWith.map((t) => (
                        <span key={t} style={styles.tag}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <p style={styles.bio}>{current.bio}</p>
                </div>
              </div>
            </TinderCard>
          </div>

          <div style={styles.actions}>
            <button style={styles.nope} onClick={() => swipe("left")}>✕</button>
            <button style={styles.like} onClick={() => swipe("right")}>❤</button>
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
  card: {
    width: 350,
    height: 550,
    borderRadius: 18,
    boxShadow: "0 8px 24px rgba(2, 48, 71, 0.08)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: 16,
    color: "#fff",
  },
  info: {
    background: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    padding: 12,
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
  name: { fontSize: 22, fontWeight: 900 },
  title: { opacity: 0.85, fontWeight: 600 },
  sectionTitle: { fontWeight: 700, fontSize: 12, opacity: 0.8, marginBottom: 4 },
  tags: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: {
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid #d3e7da",
    background: "#f5fbf7",
    color: "#023047",
  },
  bio: { marginTop: 8, fontSize: 12, lineHeight: 1.35 },
  actions: { display: "flex", justifyContent: "center", gap: 16, marginTop: 12 },
  nope: {
    width: 60,
    height: 60,
    borderRadius: 999,
    border: "1px solid #d3e7da",
    fontSize: 22,
    background: "white",
    color: "#023047",
  },
  like: {
    width: 60,
    height: 60,
    borderRadius: 999,
    border: "1px solid #7fb491",
    fontSize: 22,
    background: "#94c3a3",
    color: "#023047",
  },
  small: { textAlign: "center", fontSize: 12, opacity: 0.75 },
  done: {
    padding: 16,
    borderRadius: 18,
    border: "1px solid #d3e7da",
    background: "#ffffff",
    textAlign: "center",
  },
};