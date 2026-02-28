import { useMemo, useRef, useState } from "react";

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

  // Drag state
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // For smooth “throw away” animation
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const startRef = useRef({ x: 0, y: 0 });

  const preview = useMemo(() => {
    if (dx > 60) return "request"; // RIGHT
    if (dx < -60) return "pass"; // LEFT
    return null;
  }, [dx]);

  const recordSwipe = (decision) => {
    if (!current) return;

    const saved = JSON.parse(localStorage.getItem("mentor_swipes") || "[]");
    saved.push({
      mentorId: current.id,
      decision, // "request" or "pass"
      at: new Date().toISOString(),
    });
    localStorage.setItem("mentor_swipes", JSON.stringify(saved));
  };

  const goNext = () => {
    setIndex((i) => i + 1);
    setDx(0);
    setDy(0);
    setIsDragging(false);
    setIsAnimatingOut(false);
  };

  const swipe = (direction) => {
    if (!current) return;

    // RIGHT = request, LEFT = pass
    const decision = direction === "right" ? "request" : "pass";
    recordSwipe(decision);
    goNext();
  };

  const onPointerDown = (e) => {
    if (!current || isAnimatingOut) return;
    setIsDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging || !current || isAnimatingOut) return;
    setDx(e.clientX - startRef.current.x);
    setDy(e.clientY - startRef.current.y);
  };

  const onPointerUp = () => {
    if (!isDragging || !current || isAnimatingOut) return;
    setIsDragging(false);

    const threshold = 120;

    if (dx > threshold) {
      // RIGHT → REQUEST
      setIsAnimatingOut(true);
      setDx(500);
      setTimeout(() => swipe("right"), 180);
      return;
    }

    if (dx < -threshold) {
      // LEFT → PASS
      setIsAnimatingOut(true);
      setDx(-500);
      setTimeout(() => swipe("left"), 180);
      return;
    }

    // snap back
    setDx(0);
    setDy(0);
  };

  const rotation = dx / 18;

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
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {/* Preview badges */}
            {preview === "request" && (
              <div style={styles.badgeRight}>REQUEST</div>
            )}
            {preview === "pass" && <div style={styles.badgeLeft}>PASS</div>}

            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={{
                ...styles.card,
                background: "linear-gradient(180deg, #9ac8a8 0%, #5c916b 100%)",
                transform: `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`,
                transition: isDragging ? "none" : "transform 180ms ease",
                touchAction: "none",
                cursor: isDragging ? "grabbing" : "grab",
              }}
            >
              <div style={styles.match}>{current.match}% match</div>

              <div style={styles.info}>
                <h2 style={styles.name}>{current.name}</h2>
                <p style={styles.title}>{current.title}</p>

                <div style={{ marginTop: 8 }}>
                  <div style={styles.sectionTitle}>Helps with</div>
                  <div style={styles.tags}>
                    {current.helpsWith.map((item) => (
                      <span key={item} style={styles.tag}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <p style={styles.bio}>{current.bio}</p>
              </div>
            </div>
          </div>

          {/* Buttons (optional backup) */}
          <div style={styles.actions}>
            <button style={styles.nope} onClick={() => swipe("left")}>
              Pass
            </button>
            <button style={styles.like} onClick={() => swipe("right")}>
              Request
            </button>
          </div>

          <p style={styles.small}>Swipe right to request. Left to pass.</p>
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
    position: "relative",
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
  sectionTitle: {
    fontWeight: 700,
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
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

  actions: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginTop: 12,
  },
  nope: {
    padding: "12px 16px",
    borderRadius: 999,
    border: "1px solid #d3e7da",
    fontSize: 14,
    background: "white",
    color: "#023047",
    fontWeight: 800,
  },
  like: {
    padding: "12px 16px",
    borderRadius: 999,
    border: "1px solid #7fb491",
    fontSize: 14,
    background: "#94c3a3",
    color: "#023047",
    fontWeight: 900,
  },

  small: { textAlign: "center", fontSize: 12, opacity: 0.75 },
  done: {
    padding: 16,
    borderRadius: 18,
    border: "1px solid #d3e7da",
    background: "#ffffff",
    textAlign: "center",
  },

  badgeRight: {
    position: "absolute",
    zIndex: 5,
    top: 28,
    left: 28,
    padding: "8px 10px",
    borderRadius: 12,
    background: "rgba(0,0,0,0.75)",
    color: "white",
    fontWeight: 900,
    letterSpacing: 0.5,
  },
  badgeLeft: {
    position: "absolute",
    zIndex: 5,
    top: 28,
    right: 28,
    padding: "8px 10px",
    borderRadius: 12,
    background: "rgba(0,0,0,0.75)",
    color: "white",
    fontWeight: 900,
    letterSpacing: 0.5,
  },
};
