import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function createMessageId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const channels = [
  { id: "mentees", label: "Mentees Lounge" },
  { id: "mentors", label: "Mentor Circle" },
];

export default function Community() {
  const navigate = useNavigate();

  const [channel, setChannel] = useState("mentees");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  const key = useMemo(() => `mentorme_comm_${channel}`, [channel]);

  useEffect(() => {
    setMessages(JSON.parse(localStorage.getItem(key) || "[]"));
  }, [key]);

  function send() {
    if (!text.trim()) return;
    const user = JSON.parse(localStorage.getItem("mentorme_mentee") || "{}");
    const msg = {
      id: createMessageId(),
      name: user.name || "Guest",
      text: text.trim(),
      at: new Date().toISOString(),
    };
    const next = [...messages, msg];
    setMessages(next);
    localStorage.setItem(key, JSON.stringify(next));
    setText("");
  }

  return (
    <div style={styles.wrap}>
      <button style={styles.backBtn} onClick={() => navigate(-1)}>
      ← Back
      </button>

      <h2 style={{ margin: "8px 0 0" }}>Community</h2>

      <div style={styles.tabs}>
        {channels.map((c) => (
          <button
            key={c.id}
            onClick={() => setChannel(c.id)}
            style={{
              ...styles.tab,
              background: channel === c.id ? "#94c3a3" : "white",
              color: "#023047",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div style={styles.feed}>
        {messages.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No messages yet. Be the first.</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} style={styles.msg}>
              <div style={styles.msgTop}>
                <span style={{ fontWeight: 800 }}>{m.name}</span>
                <span style={{ fontSize: 12, opacity: 0.6 }}>
                  {new Date(m.at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div style={{ opacity: 0.9 }}>{m.text}</div>
            </div>
          ))
        )}
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
        />
        <button style={styles.send} onClick={send}>
          Send
        </button>
      </div>
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
    position: "relative",
    gap: 12,
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
  },
  tabs: { display: "flex", gap: 10 },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    border: "1px solid #d3e7da",
    fontWeight: 800,
  },
  feed: {
    border: "1px solid #d3e7da",
    borderRadius: 16,
    padding: 12,
    height: "60vh",
    overflowY: "auto",
    background: "#ffffff",
  },
  msg: {
    background: "white",
    border: "1px solid #d3e7da",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  msgTop: { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  inputRow: { display: "flex", gap: 10 },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    border: "1px solid #d3e7da",
    color: "#023047",
    background: "#ffffff",
  },
  send: {
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #7fb491",
    background: "#94c3a3",
    color: "#023047",
    fontWeight: 800,
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
