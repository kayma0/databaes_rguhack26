import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function MentorDashboard() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const [requests, setRequests] = useState([]);
  const [tick, setTick] = useState(0);

  //  Load mentor profile (and re-load when we patch it)
  const mentor = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("mentorme_mentor") || "{}");
    } catch {
      return {};
    }
  }, [tick]);

  //  Resolve mentor ID even for older mentors that don't have id saved
  const resolvedMentorId = useMemo(() => {
    if (mentor?.id) return mentor.id;

    const pool = (() => {
      try {
        const arr = JSON.parse(
          localStorage.getItem("mentorme_mentors") || "[]",
        );
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    })();

    const fullName =
      mentor?.name ||
      `${mentor?.firstName || ""} ${mentor?.lastName || ""}`.trim();

    const match =
      pool.find((m) => mentor?.email && m?.email === mentor.email) ||
      pool.find((m) => fullName && m?.name === fullName) ||
      pool.find(
        (m) =>
          mentor?.firstName && (m?.name || "").startsWith(mentor.firstName),
      );

    if (match?.id) {
      const patched = {
        ...mentor,
        id: match.id,
        name: mentor.name || fullName,
      };
      localStorage.setItem("mentorme_mentor", JSON.stringify(patched));
      // trigger re-read
      setTimeout(() => setTick((x) => x + 1), 0);
      return match.id;
    }

    return null;
  }, [mentor]);

  // Load requests repeatedly so UI updates even in the same tab
  useEffect(() => {
    const load = () => {
      try {
        const all = JSON.parse(localStorage.getItem("mentor_requests") || "[]");
        setRequests(Array.isArray(all) ? all : []);
      } catch {
        setRequests([]);
      }
    };

    load();

    // other-tab updates
    const onStorage = (e) => {
      if (e.key === "mentor_requests") load();
    };
    window.addEventListener("storage", onStorage);

    // same-tab updates (simple demo-friendly polling)
    const interval = setInterval(load, 700);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  // Requests for this mentor
  const myRequests = useMemo(() => {
    const mentorName =
      mentor?.name ||
      `${mentor?.firstName || ""} ${mentor?.lastName || ""}`.trim();

    return requests.filter((r) => {
      // prefer id matching
      if (resolvedMentorId && r?.mentorId === resolvedMentorId) return true;

      // fallback for older saved requests
      if (mentorName && r?.mentorName === mentorName) return true;

      return false;
    });
  }, [requests, resolvedMentorId, mentor]);

  const pending = myRequests.filter((r) => r.status === "pending");
  const accepted = myRequests.filter((r) => r.status === "accepted");

  const updateRequestStatus = (requestId, status) => {
    const all = JSON.parse(localStorage.getItem("mentor_requests") || "[]");
    const idx = all.findIndex((r) => r.id === requestId);
    if (idx === -1) return;

    const updatedReq = {
      ...all[idx],
      status,
      decidedAt: new Date().toISOString(),
    };

    all[idx] = updatedReq;
    localStorage.setItem("mentor_requests", JSON.stringify(all));

    // If accepted, create mentee notification
    if (status === "accepted") {
      const notif = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        type: "mentor_accepted",
        mentorName:
          mentor?.name ||
          `${mentor?.firstName || ""} ${mentor?.lastName || ""}`.trim() ||
          "A mentor",
        mentorCompany: mentor?.company || "",
        mentorIndustry: mentor?.industry || "",
        menteeEmail: updatedReq?.mentee?.email || "",
        menteeName: updatedReq?.mentee?.name || "",
        createdAt: new Date().toISOString(),
        read: false,
      };

      const notifications = JSON.parse(
        localStorage.getItem("mentorme_notifications") || "[]",
      );
      notifications.unshift(notif);
      localStorage.setItem(
        "mentorme_notifications",
        JSON.stringify(notifications),
      );
    }

    // force UI refresh instantly
    setRequests([...all]);
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>Mentor Dashboard</h1>
          <p style={styles.sub}>
            Welcome{" "}
            <span style={{ fontWeight: 950, color: "#1f5f3a" }}>
              {mentor.firstName || "Mentor"}
            </span>
            . Review requests and accept mentees.
          </p>
        </div>

        <div style={styles.profileCard}>
          <div style={styles.profileTop}>
            {mentor.img ? (
              <img
                src={mentor.img}
                alt={mentor.name || "Mentor profile"}
                style={styles.avatarImage}
              />
            ) : (
              <div style={styles.avatar}>
                {(
                  mentor.firstName?.[0] ||
                  mentor.name?.[0] ||
                  "M"
                ).toUpperCase()}
              </div>
            )}
            <div>
              <div style={styles.profileName}>
                {mentor.name || "Your profile"}
              </div>
              <div style={styles.profileMeta}>
                {mentor.title || "Mentor"}{" "}
                {mentor.company ? `• ${mentor.company}` : ""}
              </div>
            </div>
          </div>
          <div style={styles.profilePills}>
            {mentor.industry && (
              <span style={styles.pill}>{mentor.industry}</span>
            )}
            {mentor.company && (
              <span style={styles.pillSoft}>{mentor.company}</span>
            )}
          </div>
          {mentor.bio && <div style={styles.profileBio}>{mentor.bio}</div>}
        </div>
      </div>

      {/* Pending */}
      <div style={styles.sectionTitleRow}>
        <h2 style={styles.h2}>Pending Requests</h2>
        <span style={styles.countPill}>{pending.length}</span>
      </div>

      {pending.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={{ fontWeight: 950 }}>No pending requests yet</div>
          <div style={{ opacity: 0.75, marginTop: 6 }}>
            When students swipe right on you, they’ll appear here automatically.
          </div>
        </div>
      ) : (
        <div style={styles.list}>
          {pending.map((r) => (
            <div key={r.id} style={styles.requestCard}>
              <div style={styles.requestTop}>
                <div style={styles.menteeAvatar}>
                  {(
                    r.mentee?.firstName?.[0] ||
                    r.mentee?.name?.[0] ||
                    "S"
                  ).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={styles.menteeName}>
                    {r.mentee?.name || "Student"}
                  </div>
                  <div style={styles.meta}>
                    {r.mentee?.targetRole
                      ? `Target: ${r.mentee.targetRole}`
                      : "Target role not set"}
                  </div>
                  {r.mentee?.email && (
                    <div style={styles.metaSmall}>{r.mentee.email}</div>
                  )}
                </div>

                <div style={styles.statusPillPending}>PENDING</div>
              </div>

              {Array.isArray(r.mentee?.lookingFor) &&
                r.mentee.lookingFor.length > 0 && (
                  <div style={styles.pillsRow}>
                    {r.mentee.lookingFor.slice(0, 3).map((x) => (
                      <span key={x} style={styles.pillSoft}>
                        {x}
                      </span>
                    ))}
                  </div>
                )}

              {r.mentee?.interests && (
                <p style={styles.note}>
                  <span style={{ fontWeight: 950 }}>Interests:</span>{" "}
                  {r.mentee.interests}
                </p>
              )}

              {r.mentee?.cvName && (
                <div style={styles.cvRow}>
                  <span style={{ fontWeight: 950 }}>CV:</span>{" "}
                  <span style={{ opacity: 0.85 }}>{r.mentee.cvName}</span>
                </div>
              )}

              <div style={styles.actions}>
                <button
                  style={styles.declineBtn}
                  onClick={() => updateRequestStatus(r.id, "declined")}
                >
                  Decline
                </button>
                <button
                  style={styles.acceptBtn}
                  onClick={() => updateRequestStatus(r.id, "accepted")}
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accepted */}
      <div style={{ marginTop: 40 }}>
        <div style={styles.sectionTitleRow}>
          <h2 style={styles.h2}>Accepted</h2>
          <span style={styles.countPill}>{accepted.length}</span>
        </div>

        {accepted.length === 0 ? (
          <div style={{ ...styles.miniCard, marginTop: 22 }}>
            No accepted mentees yet.
          </div>
        ) : (
          <div style={styles.list}>
            {accepted.map((r) => (
              <div key={r.id} style={styles.miniCard}>
                <div style={{ fontWeight: 950 }}>
                  {r.mentee?.name || "Student"}
                </div>
                <div style={{ opacity: 0.75, marginTop: 4 }}>
                  {r.mentee?.targetRole
                    ? `Target: ${r.mentee.targetRole}`
                    : "Accepted"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={styles.bottomNav}>
        <Link
          to="/mentor"
          style={{
            ...styles.navItem,
            ...(isActive("/mentor") && styles.active),
          }}
        >
          🏠
          <span style={styles.navLabel}>Dashboard</span>
        </Link>

        <Link
          to="/mentor-community"
          style={{
            ...styles.navItem,
            ...(isActive("/mentor-community") && styles.active),
          }}
        >
          👥
          <span style={styles.navLabel}>Community</span>
        </Link>

        <Link
          to="/mentor-goals"
          style={{
            ...styles.navItem,
            ...(isActive("/mentor-goals") && styles.active),
          }}
        >
          🎯
          <span style={styles.navLabel}>Goals</span>
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
    gap: 12,
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },

  header: { marginTop: 8, display: "grid", gap: 12 },
  h1: { margin: 0, fontSize: 30, fontWeight: 950, letterSpacing: -0.2 },
  sub: { margin: "6px 0 0", opacity: 0.78, fontWeight: 650 },

  profileCard: {
    padding: 14,
    borderRadius: 18,
    border: "1px solid #d3e7da",
    background: "#ffffff",
    boxShadow: "0 10px 22px rgba(2, 48, 71, 0.06)",
  },

  profileTop: { display: "flex", gap: 10, alignItems: "center" },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    background: "#e8f3ec",
    color: "#1f5f3a",
    border: "1px solid #cfe3d7",
  },

  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 999,
    objectFit: "cover",
    border: "1px solid #cfe3d7",
    background: "#f3f7f5",
  },

  profileName: { fontWeight: 950, fontSize: 16 },
  profileMeta: { fontSize: 12, opacity: 0.75, marginTop: 2 },

  profilePills: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },

  profileBio: { marginTop: 10, fontSize: 13, lineHeight: 1.45, opacity: 0.9 },

  sectionTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  h2: { margin: 0, fontSize: 18, fontWeight: 950 },

  countPill: {
    fontSize: 12,
    fontWeight: 950,
    padding: "4px 10px",
    borderRadius: 999,
    background: "#ffffff",
    border: "1px solid #d3e7da",
    color: "#1f5f3a",
  },

  list: { display: "grid", gap: 12 },

  requestCard: {
    padding: 14,
    borderRadius: 18,
    border: "1px solid #d3e7da",
    background: "#ffffff",
    boxShadow: "0 10px 22px rgba(2, 48, 71, 0.06)",
  },

  requestTop: { display: "flex", gap: 12, alignItems: "center" },

  menteeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    background: "#f3f7f5",
    color: "#244e62",
    border: "1px solid #dfeee6",
  },

  menteeName: { fontWeight: 950, fontSize: 16, marginBottom: 2 },
  meta: { fontSize: 13, fontWeight: 750, opacity: 0.85 },
  metaSmall: { fontSize: 12, opacity: 0.7, marginTop: 2 },

  statusPillPending: {
    fontSize: 11,
    fontWeight: 950,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(190, 50, 50, 0.10)",
    color: "rgb(190, 50, 50)",
    border: "1px solid rgba(190, 50, 50, 0.25)",
  },

  pillsRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 },

  pill: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(31, 95, 58, 0.12)",
    border: "1px solid rgba(31, 95, 58, 0.18)",
    fontSize: 12,
    fontWeight: 900,
    color: "#1f5f3a",
  },

  pillSoft: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#f5fbf7",
    border: "1px solid #d3e7da",
    fontSize: 12,
    fontWeight: 850,
  },

  note: { margin: "10px 0 0", fontSize: 13, lineHeight: 1.45, opacity: 0.9 },

  cvRow: {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 14,
    background: "#f7fbf8",
    border: "1px solid #dfeee6",
    fontSize: 13,
  },

  actions: {
    display: "flex",
    gap: 10,
    marginTop: 12,
    justifyContent: "flex-end",
  },

  declineBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    background: "#ffffff",
    border: "1px solid rgba(190, 50, 50, 0.35)",
    color: "rgb(190, 50, 50)",
    fontWeight: 900,
  },

  acceptBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    background: "#1f5f3a",
    border: "1px solid #1a4f31",
    color: "#ffffff",
    fontWeight: 950,
  },

  emptyCard: {
    padding: 16,
    borderRadius: 18,
    border: "1px solid #d3e7da",
    background: "#ffffff",
    textAlign: "center",
  },

  miniCard: {
    padding: 14,
    borderRadius: 18,
    border: "1px solid #d3e7da",
    background: "#ffffff",
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
};
