import { useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Notification() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const mentee = JSON.parse(localStorage.getItem("mentorme_mentee") || "{}");
  const menteeEmail = mentee.email || "";
  const menteeName = mentee.name || "";

  const [refresh, setRefresh] = useState(0);

  const notifications = useMemo(() => {
    try {
      const all = JSON.parse(
        localStorage.getItem("mentorme_notifications") || "[]",
      );
      // Show only notifications meant for this mentee (match by email first, fallback to name)
      return all.filter(
        (n) =>
          (menteeEmail && n.menteeEmail === menteeEmail) ||
          (!menteeEmail && menteeName && n.menteeName === menteeName),
      );
    } catch {
      return [];
    }
  }, [refresh, menteeEmail, menteeName]);

  const markAllRead = () => {
    const all = JSON.parse(
      localStorage.getItem("mentorme_notifications") || "[]",
    );
    const updated = all.map((n) => {
      const mine =
        (menteeEmail && n.menteeEmail === menteeEmail) ||
        (!menteeEmail && menteeName && n.menteeName === menteeName);

      return mine ? { ...n, read: true } : n;
    });

    localStorage.setItem("mentorme_notifications", JSON.stringify(updated));
    setRefresh((x) => x + 1);
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.topRow}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button style={styles.readBtn} onClick={markAllRead}>
          Mark all read
        </button>
      </div>

      <h2 style={styles.h2}>Notifications</h2>

      {notifications.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontWeight: 950 }}>No notifications yet</div>
          <div style={{ marginTop: 6, opacity: 0.75 }}>
            When a mentor accepts your request, it will show up here.
          </div>
          <Link to="/swipe" style={styles.primaryLink}>
            Go swipe mentors →
          </Link>
        </div>
      ) : (
        <div style={styles.list}>
          {notifications.slice(0, 10).map((n) => (
            <div key={n.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.icon}>🔔</div>
                <div style={{ flex: 1 }}>
                  <p style={styles.tag}>{n.read ? "Update" : "New"}</p>
                  <p style={styles.cardTitle}>Mentor Match Confirmed</p>
                </div>
                {!n.read && <div style={styles.dot} />}
              </div>

              <p style={styles.message}>
                <span style={styles.mentorName}>{n.mentorName}</span>{" "}
                {n.mentorCompany ? `(${n.mentorCompany}) ` : ""}
                has accepted your invitation to be your mentor.
              </p>
            </div>
          ))}
        </div>
      )}

      {/* optional bottom nav to match your app */}
      <div style={styles.bottomNav}>
        <Link
          to="/roadmap"
          style={{
            ...styles.navItem,
            ...(isActive("/roadmap") && styles.active),
          }}
        >
          🏠 <span style={styles.navLabel}>Home</span>
        </Link>

        <Link
          to="/swipe"
          style={{
            ...styles.navItem,
            ...(isActive("/swipe") && styles.active),
          }}
        >
          🔍 <span style={styles.navLabel}>Swipe</span>
        </Link>

        <Link
          to="/community"
          style={{
            ...styles.navItem,
            ...(isActive("/community") && styles.active),
          }}
        >
          👥 <span style={styles.navLabel}>Community</span>
        </Link>

        <Link
          to="/goals"
          style={{
            ...styles.navItem,
            ...(isActive("/goals") && styles.active),
          }}
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
    gap: 14,
    alignContent: "start",
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
    fontFamily:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },

  backBtn: {
    border: "none",
    color: "#ffffff",
    background: "#1f5f3a",
    padding: "8px 14px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },

  readBtn: {
    border: "1px solid #d3e7da",
    background: "#ffffff",
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 900,
    color: "#023047",
  },

  h2: {
    marginTop: 6,
    marginBottom: 0,
    fontSize: 30,
    letterSpacing: "0.01em",
  },

  list: { display: "grid", gap: 12 },

  card: {
    border: "1px solid #cfe3d7",
    borderRadius: 18,
    background: "#ffffff",
    padding: 16,
    color: "#244e62",
    boxShadow: "0 10px 22px rgba(2, 48, 71, 0.08)",
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  icon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "#e8f3ec",
    fontSize: 20,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
    background: "#1f5f3a",
  },

  tag: {
    margin: 0,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#3d6a57",
  },

  cardTitle: {
    margin: "2px 0 0",
    fontSize: 17,
    fontWeight: 900,
    color: "#023047",
  },

  message: {
    margin: 0,
    lineHeight: 1.45,
    fontSize: 15,
    color: "#244e62",
  },

  mentorName: {
    fontWeight: 900,
    color: "#1f5f3a",
  },

  empty: {
    padding: 16,
    borderRadius: 18,
    border: "1px solid #d3e7da",
    background: "#ffffff",
    textAlign: "center",
  },

  primaryLink: {
    display: "inline-block",
    marginTop: 12,
    textDecoration: "none",
    fontWeight: 900,
    color: "#ffffff",
    background: "#1f5f3a",
    padding: "10px 14px",
    borderRadius: 14,
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
