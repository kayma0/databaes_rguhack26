import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    name: "Mariah",
    title: "Data Scientist",
    industry: "Finance",
    company: "JP Morgan",
    match: 87,
    bio: "I mentor students who want to enter quantitative finance roles.",
    img: "https://images.squarespace-cdn.com/content/v1/6253c0a34c71c941801fde7c/a0a371e9-1517-44d6-964d-1b22fadb9a47/2024-street-portraits-106.jpg?format=original",
  },
  {
    id: 4,
    name: "Priya",
    title: "Product Manager",
    industry: "Big Tech",
    company: "Google",
    match: 95,
    bio: "I help students transition into product roles and prepare for PM interviews.",
    img: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1200&q=80",
  },
  {
    id: 5,
    name: "James",
    title: "Management Consultant",
    industry: "Consulting",
    company: "McKinsey & Company",
    match: 91,
    bio: "I mentor students aiming for consulting careers and case interview prep.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
  },
  {
    id: 6,
    name: "Aisha",
    title: "Investment Banking Analyst",
    industry: "Finance",
    company: "Goldman Sachs",
    match: 93,
    bio: "I guide students through investment banking applications and technical prep.",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&q=80",
  },
  {
    id: 7,
    name: "Leo",
    title: "Software Engineer",
    industry: "Startup",
    company: "Stripe",
    match: 89,
    bio: "I help students break into high-growth startups and scale engineering skills.",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&q=80",
  },
  {
    id: 8,
    name: "Maya",
    title: "UX Designer",
    industry: "Big Tech",
    company: "Microsoft",
    match: 90,
    bio: "I mentor aspiring designers in building portfolios and landing UX roles.",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=80",
  },
  {
    id: 9,
    name: "Omar",
    title: "Quantitative Analyst",
    industry: "Finance",
    company: "BlackRock",
    match: 97,
    bio: "I support students targeting quant and asset management careers.",
    img: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=1200&q=80",
  },
  {
    id: 10,
    name: "Aaliyah",
    title: "Cybersecurity Engineer",
    industry: "Technology",
    company: "IBM",
    match: 88,
    bio: "I help students prepare for cybersecurity certifications and roles.",
    img: "https://nonprofitquarterly.org/wp-content/uploads/2024/04/3.jpeg",
  },
  {
    id: 11,
    name: "Daniel",
    title: "AI Research Engineer",
    industry: "Artificial Intelligence",
    company: "OpenAI",
    match: 98,
    bio: "I mentor students interested in machine learning research and AI careers.",
    img: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=1200&q=80",
  },
  {
    id: 12,
    name: "Chloe",
    title: "Healthcare Consultant",
    industry: "Healthcare",
    company: "Deloitte",
    match: 86,
    bio: "I guide students exploring healthcare consulting and policy careers.",
    img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80",
  },
  {
    id: 13,
    name: "Marcus",
    title: "Cloud Solutions Architect",
    industry: "Technology",
    company: "AWS",
    match: 94,
    bio: "I help students build cloud skills and land infrastructure roles.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&q=80",
  },
];

export default function MentorSwipe() {
  const navigate = useNavigate();
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
    const nextIndex = index + 1;

    if (nextIndex >= mentors.length) {
      navigate("/roadmap");
      return;
    }

    setIndex(nextIndex);
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
      <div style={styles.topBar}>
        <h2 style={styles.h2}>Mentor Matches</h2>
        <div style={styles.sub}>Swipe right to request</div>
      </div>

      {!current ? (
        <div style={styles.done}>
          <h3 style={{ margin: 0 }}>No more mentors</h3>
          <p style={{ margin: "8px 0 0", opacity: 0.75 }}>
            You can revisit later or check community.
          </p>
        </div>
      ) : (
        <>
          <div style={styles.center}>
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

                {/* Pills row */}
                <div style={styles.pillsRow}>
                  <span style={styles.pill}>{current.industry}</span>
                  <span style={styles.pillSoft}>{current.company}</span>
                </div>

                <p style={styles.bio}>{current.bio}</p>
              </div>
            </div>
          </div>

          <div style={styles.actions}>
            <button style={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
            </button>

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
    position: "relative",
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },

  topBar: { marginTop: 6 },
  h2: { margin: 0, fontSize: 22, fontWeight: 900, color: "#023047" },
  sub: { marginTop: 4, fontSize: 12, opacity: 0.7, color: "#023047" },

  center: { position: "relative", display: "flex", justifyContent: "center" },

  card: {
    width: 350,
    height: 560,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
    background: "#000",
  },

  photo: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: "scale(1.02)",
  },

  gradient: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top, rgba(0,0,0,0.9) 18%, rgba(0,0,0,0.35) 58%, rgba(0,0,0,0.08) 100%)",
  },

  match: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: "7px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.95)",
    fontSize: 12,
    fontWeight: 900,
    zIndex: 3,
    color: "#023047",
  },

  info: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 16,
    color: "white",
    zIndex: 3,
  },

  name: {
    fontSize: 26,
    fontWeight: 950,
    margin: 0,
    letterSpacing: 0.2,
  },

  title: {
    margin: "6px 0 10px",
    fontSize: 14,
    fontWeight: 650,
    opacity: 0.88,
  },

  pillsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },

  pill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 900,
    background: "rgba(255,255,255,0.24)",
    border: "1px solid rgba(255,255,255,0.22)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },

  pillSoft: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 900,
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },

  bio: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.45,
    opacity: 0.92,
  },

  actions: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginTop: 10,
  },

  nope: {
    padding: "12px 18px",
    borderRadius: 999,
    border: "1px solid #cfe4d7",
    background: "white",
    fontWeight: 900,
    color: "#023047",
  },

  like: {
    padding: "12px 18px",
    borderRadius: 999,
    border: "none",
    background: "#1f5f3a",
    color: "white",
    fontWeight: 900,
  },

  done: {
    padding: 16,
    borderRadius: 18,
    border: "1px solid #d3e7da",
    background: "#ffffff",
    textAlign: "center",
  },

  badgeRight: {
    position: "absolute",
    top: 42,
    right: 34, // ✅ right side for REQUEST
    padding: "8px 12px",
    background: "rgba(31, 95, 58, 0.92)",
    color: "white",
    fontWeight: 950,
    borderRadius: 10,
    zIndex: 5,
    letterSpacing: 0.4,
  },

  badgeLeft: {
    position: "absolute",
    top: 42,
    left: 34, // ✅ left side for PASS
    padding: "8px 12px",
    background: "rgba(190, 50, 50, 0.92)",
    color: "white",
    fontWeight: 950,
    borderRadius: 10,
    zIndex: 5,
    letterSpacing: 0.4,
  },

  backBtn: {
    position: "absolute",
    top: 20,
    right: 20,
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
};
