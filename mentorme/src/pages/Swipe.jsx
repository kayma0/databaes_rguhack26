import { useMemo, useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { mentors as fallbackMentors } from "../data/mentors.js";

export default function Swipe() {
  const navigate = useNavigate();
  const location = useLocation();

  // Load swipes safely
  const swipes = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("mentor_swipes") || "[]");
    } catch {
      return [];
    }
  }, []);

  const swipedMentorIds = new Set(swipes.map((s) => String(s.mentorId)));

  // Load mentors safely
  const storedMentors = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("mentorme_mentors") || "[]");
    } catch {
      return [];
    }
  }, []);
  const allMentors = storedMentors.length ? storedMentors : fallbackMentors;

  // Available mentors that haven't been swiped
  const availableMentors = useMemo(
    () => allMentors.filter((mentor) => !swipedMentorIds.has(String(mentor.id))),
    [allMentors, swipes]
  );

  // Reset index if availableMentors changes
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [availableMentors]);

  const current = availableMentors[index];

  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [requestedMentor, setRequestedMentor] = useState("");

  const startRef = useRef({ x: 0, y: 0 });

  const isActive = (path) => location.pathname === path;

  const preview = useMemo(() => {
    if (dx > 60) return "request";
    if (dx < -60) return "pass";
    return null;
  }, [dx]);

  const recordSwipe = (decision) => {
    if (!current) return;
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem("mentor_swipes") || "[]");
    } catch {}
    saved.push({
      mentorId: current.id,
      decision,
      at: new Date().toISOString(),
    });
    localStorage.setItem("mentor_swipes", JSON.stringify(saved));
  };

  const swipe = (direction) => {
    if (!current) return;

    const decision = direction === "right" ? "request" : "pass";
    setShowPopup(true);
    recordSwipe(decision);

    // Create request only on swipe right
    if (direction === "right") {
      setShowPopup(true)
      setRequestedMentor(current.name);

      let requests = [];
      try {
        requests = JSON.parse(localStorage.getItem("mentor_requests") || "[]");
      } catch {}
      let mentee = {};
      try {
        mentee = JSON.parse(localStorage.getItem("mentorme_mentee") || "{}");
      } catch {}

      requests.push({
        id: crypto?.randomUUID?.() || String(Date.now()),
        mentorId: current.id,
        mentorName: current.name,
        mentorCompany: current.company,
        mentee: {
          name:
            mentee.name ||
            `${mentee.firstName || ""} ${mentee.lastName || ""}`.trim() ||
            "Unknown Mentee",
          firstName: mentee.firstName || "",
          lastName: mentee.lastName || "",
          email: mentee.email || "",
          targetRole: mentee.role || "",
          interests: mentee.interests || "",
          lookingFor: Array.isArray(mentee.lookingFor) ? mentee.lookingFor : [],
          cvName: mentee.cvName || null,
        },
        status: "pending",
        at: new Date().toISOString(),
      });

      localStorage.setItem("mentor_requests", JSON.stringify(requests));

      setTimeout(() => setShowPopup(false), 2000);
    }


    const nextIndex = index + 1;
    if (nextIndex >= availableMentors.length) {
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
      {showPopup && (
        <div style={styles.popup}>Request sent to {requestedMentor}</div>
      )}

      <div style={styles.topBar}>
        <h2 style={styles.h2}>Mentor Matches</h2>
        <div style={styles.sub}>Swipe right to request</div>
      </div>

      <div style={styles.main}>
        {!current ? (
          <div style={styles.done}>
            <h3 style={{ margin: 0 }}>No more mentors</h3>
            <p style={{ margin: "8px 0 0", opacity: 0.75 }}>
              Try again later or check community.
            </p>
          </div>
        ) : (
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

                <div style={styles.pillsRow}>
                  <span style={styles.pill}>{current.industry}</span>
                  <span style={styles.pillSoft}>{current.company}</span>
                </div>

                <p style={styles.bio}>{current.bio}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={styles.bottomNav}>
        <Link
          to="/roadmap"
          style={{ ...styles.navItem, ...(isActive("/roadmap") && styles.active) }}
        >
          🏠 <span style={styles.navLabel}>Home</span>
        </Link>

        <Link
          to="/swipe"
          style={{ ...styles.navItem, ...(isActive("/swipe") && styles.active) }}
        >
          🔍 <span style={styles.navLabel}>Swipe</span>
        </Link>

        <Link
          to="/community"
          style={{ ...styles.navItem, ...(isActive("/community") && styles.active) }}
        >
          👥 <span style={styles.navLabel}>Community</span>
        </Link>

        <Link
          to="/goals"
          style={{ ...styles.navItem, ...(isActive("/goals") && styles.active) }}
        >
          🎯 <span style={styles.navLabel}>Goals</span>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    padding: 18,
    paddingBottom: 90,
    maxWidth: 420,
    margin: "0 auto",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    gap: 14,
    position: "relative",
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
  },

  topBar: { marginTop: 6 },
  h2: { margin: 0, fontSize: 22, fontWeight: 900, color: "#023047" },
  sub: { marginTop: 4, fontSize: 12, opacity: 0.7, color: "#023047" },

  main: { display: "grid", gap: 12, marginTop: 20 },
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

  name: { fontSize: 26, fontWeight: 950, margin: 0 },
  title: { margin: "6px 0 10px", fontSize: 14, opacity: 0.88 },
  pillsRow: { display: "flex", gap: 8, marginBottom: 10 },

  pill: {
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 900,
    background: "rgba(255,255,255,0.24)",
  },

  pillSoft: {
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 900,
    background: "rgba(255,255,255,0.14)",
  },

  bio: { margin: 0, fontSize: 13, lineHeight: 1.45 },

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
    right: 34,
    padding: "8px 12px",
    background: "rgba(31, 95, 58, 0.92)",
    color: "white",
    fontWeight: 950,
    borderRadius: 10,
    zIndex: 5,
  },

  badgeLeft: {
    position: "absolute",
    top: 42,
    left: 34,
    padding: "8px 12px",
    background: "rgba(190, 50, 50, 0.92)",
    color: "white",
    fontWeight: 950,
    borderRadius: 10,
    zIndex: 5,
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

  navLabel: { fontSize: 11 },

  active: { color: "#1f5f3a", fontWeight: 900 },

  popup: {
    position: "fixed",
    bottom: 100,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1f5f3a",
    color: "white",
    padding: "12px 20px",
    borderRadius: 12,
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 999,
},
};
