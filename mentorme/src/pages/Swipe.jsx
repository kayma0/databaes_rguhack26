import { useMemo, useRef, useState } from "react";

const mentors = [
  {
    id: 1,
    name: "Sarah",
    title: "Software Engineer",
    industry: "Big Tech",
    company: "Amazon",
    match: 92,
    bio: "I help students break into large tech companies and scale their careers.",
    img: "https://img.freepik.com/premium-photo/happy-beautiful-portrait-woman-wall-work-with-confidence-happiness-pride-smile-content-executive-employee-working-corporate-professional-business-management_590464-161571.jpg?w=360",
  },
  {
    id: 2,
    name: "David",
    title: "Data Scientist",
    industry: "Finance",
    company: "JP Morgan",
    match: 87,
    bio: "I mentor students who want to enter quantitative finance roles.",
    img: "https://images.squarespace-cdn.com/content/v1/6253c0a34c71c941801fde7c/a0a371e9-1517-44d6-964d-1b22fadb9a47/2024-street-portraits-106.jpg?format=original",
  },
];

export default function MentorSwipe() {
  const [index, setIndex] = useState(0);
  const current = mentors[index];

  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startRef = useRef({ x: 0, y: 0 });

  const preview = useMemo(() => {
    if (dx > 60) return "request";
    if (dx < -60) return "pass";
    return null;
  }, [dx]);

  const recordSwipe = (decision) => {
    const saved = JSON.parse(localStorage.getItem("mentor_swipes") || "[]");
    saved.push({
      mentorId: current.id,
      decision,
      at: new Date().toISOString(),
    });
    localStorage.setItem("mentor_swipes", JSON.stringify(saved));
  };

  const swipe = (direction) => {
    const decision = direction === "right" ? "request" : "pass";
    recordSwipe(decision);
    setIndex((i) => i + 1);
    setDx(0);
    setDy(0);
  };

  const onPointerDown = (e) => {
    setIsDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    setDx(e.clientX - startRef.current.x);
    setDy(e.clientY - startRef.current.y);
  };

  const onPointerUp = () => {
    setIsDragging(false);
    const threshold = 120;

    if (dx > threshold) {
      setDx(500);
      setTimeout(() => swipe("right"), 150);
      return;
    }

    if (dx < -threshold) {
      setDx(-500);
      setTimeout(() => swipe("left"), 150);
      return;
    }

    setDx(0);
    setDy(0);
  };

  const rotation = dx / 20;

  return (
    <div style={styles.wrap}>
      <h2 style={{ marginBottom: 10 }}>Mentor Matches</h2>

      {!current ? (
        <div style={styles.done}>
          <h3>No more mentors</h3>
        </div>
      ) : (
        <>
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {preview === "request" && (
              <div style={styles.badgeRight}>REQUEST</div>
            )}
            {preview === "pass" && <div style={styles.badgeLeft}>PASS</div>}

            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              style={{
                ...styles.card,
                transform: `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`,
                transition: isDragging ? "none" : "transform 0.2s ease",
                touchAction: "none",
              }}
            >
              <img src={current.img} alt={current.name} style={styles.photo} />
              <div style={styles.gradient} />
              <div style={styles.match}>{current.match}% match</div>

              <div style={styles.info}>
                <h2 style={styles.name}>{current.name}</h2>
                <p style={styles.title}>{current.title}</p>

                {/* NEW INDUSTRY SECTION */}
                <div style={{ marginTop: 8 }}>
                  <div style={styles.sectionTitle}>Industry</div>
                  <div style={styles.industryBadge}>{current.industry}</div>
                  <div style={styles.company}>{current.company}</div>
                </div>

                <p style={styles.bio}>{current.bio}</p>
              </div>
            </div>
          </div>

          <div style={styles.actions}>
            <button style={styles.nope} onClick={() => swipe("left")}>
              Pass
            </button>
            <button style={styles.like} onClick={() => swipe("right")}>
              Request
            </button>
          </div>
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
    background: "#f2f5f3",
  },

  card: {
    width: 350,
    height: 550,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },

  photo: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  gradient: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top, rgba(0,0,0,0.85) 20%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 100%)",
  },

  match: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: "6px 10px",
    borderRadius: 999,
    background: "white",
    fontSize: 12,
    fontWeight: 800,
    zIndex: 3,
  },

  info: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 16,
    color: "white",
    zIndex: 3,
  },

  name: { fontSize: 24, fontWeight: 900 },
  title: { opacity: 0.85, fontWeight: 600 },

  sectionTitle: { fontSize: 12, fontWeight: 700, marginTop: 8 },

  industryBadge: {
    display: "inline-block",
    marginTop: 6,
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.25)",
    fontWeight: 700,
    fontSize: 13,
  },

  company: {
    marginTop: 6,
    fontSize: 13,
    opacity: 0.9,
  },

  bio: { marginTop: 8, fontSize: 12 },

  actions: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginTop: 14,
  },

  nope: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "1px solid #ccc",
    background: "white",
  },

  like: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "none",
    background: "#1d3557",
    color: "white",
  },

  done: {
    padding: 16,
    borderRadius: 18,
    background: "white",
    textAlign: "center",
  },

  badgeRight: {
    position: "absolute",
    top: 40,
    left: 40,
    padding: "8px 12px",
    background: "green",
    color: "white",
    fontWeight: 900,
    borderRadius: 8,
    zIndex: 5,
  },

  badgeLeft: {
    position: "absolute",
    top: 40,
    right: 40,
    padding: "8px 12px",
    background: "red",
    color: "white",
    fontWeight: 900,
    borderRadius: 8,
    zIndex: 5,
  },
};
