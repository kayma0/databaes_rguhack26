import { Link } from "react-router-dom";

export default function Chat() {
  const swipes = JSON.parse(localStorage.getItem("mentorme_swipes") || "[]");
  const liked = swipes.filter((s) => s.decision === "right");

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 18,
        maxWidth: 420,
        margin: "0 auto",
      }}
    >
      <h2 style={{ marginTop: 8 }}>Requests</h2>
      <p style={{ opacity: 0.8 }}>
        Demo page: show mentors you requested (swiped right).
      </p>

      {liked.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No requests yet. Go swipe mentors.</p>
      ) : (
        <ul>
          {liked.map((x) => (
            <li key={x.at}>{x.mentorId} — requested</li>
          ))}
        </ul>
      )}

      <Link to="/swipe" style={{ textDecoration: "none", fontWeight: 800 }}>
        ← Back to swipe
      </Link>
    </div>
  );
}
