import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function MentorDashboard() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const mentor = JSON.parse(localStorage.getItem("mentorme_mentor") || "{}");

  const [refresh, setRefresh] = useState(0);

  const allRequests = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("mentor_requests") || "[]");
    } catch {
      return [];
    }
  }, [refresh]);

  // Only requests for THIS mentor (by id)
  const myRequests = allRequests.filter((r) => r.mentorId === mentor.id);

  const pending = myRequests.filter((r) => r.status === "pending");
  const accepted = myRequests.filter((r) => r.status === "accepted");

  const updateRequestStatus = (requestId, status) => {
    const requests = JSON.parse(
      localStorage.getItem("mentor_requests") || "[]",
    );
    const idx = requests.findIndex((r) => r.id === requestId);
    if (idx === -1) return;

    requests[idx] = {
      ...requests[idx],
      status,
      decidedAt: new Date().toISOString(),
    };

    localStorage.setItem("mentor_requests", JSON.stringify(requests));

    // If accepted, create a notification for the mentee
    if (status === "accepted") {
      const notif = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        type: "mentor_accepted",
        mentorName: mentor.name || "A mentor",
        mentorCompany: mentor.company || "",
        mentorIndustry: mentor.industry || "",
        menteeEmail: requests[idx]?.mentee?.email || "",
        menteeName: requests[idx]?.mentee?.name || "",
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

    setRefresh((x) => x + 1);
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.h1}>Welcome {mentor.firstName || "Mentor"}</h1>
        <p style={styles.sub}>
          Review mentee requests and accept when you’re ready.
        </p>
      </div>

      {/* Pending */}
      <div style={styles.sectionTitleRow}>
        <h2 style={styles.h2}>Pending Requests</h2>
        <span style={styles.countPill}>{pending.length}</span>
      </div>

      {pending.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={{ fontWeight: 900 }}>No pending requests</div>
          <div style={{ opacity: 0.75, marginTop: 6 }}>
            When students request you, they’ll appear here.
          </div>
        </div>
      ) : (
        <div style={styles.list}>
          {pending.map((r) => (
            <div key={r.id} style={styles.requestCard}>
              <div style={styles.requestTop}>
                <div style={styles.avatar}>
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
                  <span style={{ fontWeight: 900 }}>Interests:</span>{" "}
                  {r.mentee.interests}
                </p>
              )}

              {r.mentee?.cvName && (
                <div style={styles.cvRow}>
                  <span style={{ fontWeight: 900 }}>CV:</span>{" "}
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
      <div style={{ marginTop: 14 }}>
        <div style={styles.sectionTitleRow}>
          <h2 style={styles.h2}>Accepted</h2>
          <span style={styles.countPill}>{accepted.length}</span>
        </div>

        {accepted.length === 0 ? (
          <div style={{ ...styles.miniCard, marginTop: 30 }}>
            No accepted mentees yet.
          </div>
        ) : (
          <div style={styles.list}>
            {accepted.map((r) => (
              <div key={r.id} style={styles.miniCard}>
                <div style={{ fontWeight: 900 }}>
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
          to="/community"
          style={{
            ...styles.navItem,
            ...(isActive("/community") && styles.active),
          }}
        >
          👥
          <span style={styles.navLabel}>Community</span>
        </Link>

        <Link
          to="/chat"
          style={{ ...styles.navItem, ...(isActive("/chat") && styles.active) }}
        >
          💬
          <span style={styles.navLabel}>Requests</span>
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

  header: { marginTop: 8 },
  h1: { margin: 0, fontSize: 34, fontWeight: 950, letterSpacing: -0.2 },
  sub: { margin: "6px 0 0", opacity: 0.75, fontWeight: 600 },

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

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    background: "#e8f3ec",
    color: "#1f5f3a",
    border: "1px solid #cfe3d7",
  },

  menteeName: { fontWeight: 950, fontSize: 16, marginBottom: 2 },
  meta: { fontSize: 13, fontWeight: 700, opacity: 0.85 },
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
  pillSoft: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#f5fbf7",
    border: "1px solid #d3e7da",
    fontSize: 12,
    fontWeight: 800,
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
