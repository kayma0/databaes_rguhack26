import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mentors as seedMentors } from "../data/mentors.js";

function createMessageId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function safeRead(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function getCurrentUser() {
  const base = safeRead("mentorme_user", {});
  const mentee = safeRead("mentorme_mentee", {});
  const mentor = safeRead("mentorme_mentor", {});

  if (base.userType === "mentor") {
    return {
      role: "mentor",
      name:
        mentor.name ||
        `${mentor.firstName || ""} ${mentor.lastName || ""}`.trim() ||
        "Mentor",
      email: mentor.email || "",
    };
  }

  if (base.userType === "mentee") {
    return {
      role: "mentee",
      name:
        mentee.name ||
        `${mentee.firstName || ""} ${mentee.lastName || ""}`.trim() ||
        "Mentee",
      email: mentee.email || "",
    };
  }

  if (mentee.email || mentee.name || mentee.firstName || mentee.lastName) {
    return {
      role: "mentee",
      name:
        mentee.name ||
        `${mentee.firstName || ""} ${mentee.lastName || ""}`.trim() ||
        "Mentee",
      email: mentee.email || "",
    };
  }

  if (mentor.email || mentor.name || mentor.firstName || mentor.lastName) {
    return {
      role: "mentor",
      name:
        mentor.name ||
        `${mentor.firstName || ""} ${mentor.lastName || ""}`.trim() ||
        "Mentor",
      email: mentor.email || "",
    };
  }

  return {
    role: "mentee",
    name:
      mentee.name ||
      `${mentee.firstName || ""} ${mentee.lastName || ""}`.trim() ||
      "Mentee",
    email: mentee.email || "",
  };
}

function pickRandomMentorName() {
  const dynamicMentors = safeRead("mentorme_mentors", []);
  const pool = [...dynamicMentors, ...seedMentors].filter((m) => m?.name);
  if (!pool.length) return "Your Mentor";
  const index = Math.floor(Math.random() * pool.length);
  return pool[index].name;
}

function resolveMentorNameForMentee(acceptedRequest, fallbackMentorName, currentUserName) {
  const dynamicMentors = safeRead("mentorme_mentors", []);
  const mentorPool = [...dynamicMentors, ...seedMentors]
    .filter(
      (mentor) =>
        mentor &&
        mentor.name &&
        (mentor.title || mentor.industry || mentor.company || seedMentors.includes(mentor)),
    )
    .map((mentor) => mentor.name)
    .filter((name) => name !== currentUserName)
    .filter(Boolean);

  const acceptedMentorName = acceptedRequest?.mentorName;
  if (
    acceptedMentorName &&
    acceptedMentorName !== currentUserName &&
    mentorPool.includes(acceptedMentorName)
  ) {
    return acceptedMentorName;
  }

  if (mentorPool.length > 0) {
    return mentorPool[0];
  }

  if (fallbackMentorName && fallbackMentorName !== currentUserName) {
    return fallbackMentorName;
  }

  return "Your Mentor";
}

function getDirectChatPartner(user, fallbackMentorName) {
  const requests = safeRead("mentor_requests", []);

  if (user.role === "mentee") {
    const accepted = requests.find((request) => {
      if (request.status !== "accepted") return false;
      return (
        (user.email && request?.mentee?.email === user.email) ||
        (!user.email && request?.mentee?.name === user.name)
      );
    });

    const resolvedMentorName = resolveMentorNameForMentee(
      accepted,
      fallbackMentorName,
      user.name,
    );

    return {
      id: `dm_${String(resolvedMentorName).replace(/\s+/g, "_")}`,
      title: "Current Mentor",
      subtitle: resolvedMentorName,
      icon: "💬",
    };
  }

  const myMentor = safeRead("mentorme_mentor", {});
  const acceptedForMentor = requests.find((request) => {
    if (request.status !== "accepted") return false;
    if (myMentor.id && request.mentorId === myMentor.id) return true;
    return request.mentorName && request.mentorName === myMentor.name;
  });

  if (acceptedForMentor) {
    const menteeName = acceptedForMentor?.mentee?.name || "Your Mentee";
    return {
      id: `dm_${String(acceptedForMentor.id || menteeName).replace(/\s+/g, "_")}`,
      title: "Current Mentee",
      subtitle: menteeName,
      icon: "💬",
    };
  }

  return {
    id: "dm_mentee",
    title: "Current Mentee",
    subtitle: "Direct mentee chat",
    icon: "💬",
  };
}

function initialMessagesForThread(threadId, user, directPartnerName) {
  const userFirstName = (user.name || "there").trim().split(" ")[0] || "there";

  if (threadId === "mentee_group_checkins") {
    return [];
  }

  if (threadId === "mentee_group_opportunities") {
    return [];
  }

  if (threadId === "mentee_group_interviews") {
    return [];
  }

  if (threadId === "mentor_group_strategy") {
    return [
      {
        id: createMessageId(),
        name: "Mentor 1",
        text: "How often are you all checking in with mentees?",
        at: new Date().toISOString(),
      },
      {
        id: createMessageId(),
        name: "Mentor 2",
        text: "Bi-weekly check-ins worked best for consistency.",
        at: new Date().toISOString(),
      },
    ];
  }

  if (threadId === "mentor_group_resources") {
    return [
      {
        id: createMessageId(),
        name: "Mentor 3",
        text: "Uploaded a first-session template for new mentees.",
        at: new Date().toISOString(),
      },
      {
        id: createMessageId(),
        name: "Mentor 4",
        text: "Great, also adding a CV feedback checklist.",
        at: new Date().toISOString(),
      },
    ];
  }

  if (threadId === "mentor_group_cases") {
    return [
      {
        id: createMessageId(),
        name: "Mentor 5",
        text: "Any good PM case resources for mentees this cycle?",
        at: new Date().toISOString(),
      },
      {
        id: createMessageId(),
        name: "Mentor 6",
        text: "I’ll share my case prep deck shortly.",
        at: new Date().toISOString(),
      },
    ];
  }

  return [
    {
      id: createMessageId(),
      name: directPartnerName,
      text:
        user.role === "mentee"
          ? `Hi ${userFirstName}, what should we focus on this week?`
          : "Hi mentor, thank you for accepting my request!",
      at: new Date().toISOString(),
    },
  ];
}

function normalizeDirectGreeting(messages, activeThreadId, user, directPartnerName) {
  if (!Array.isArray(messages) || messages.length === 0) return messages;
  if (!String(activeThreadId).startsWith("dm_")) return messages;
  if (user.role !== "mentee") return messages;

  const userFirstName = (user.name || "there").trim().split(" ")[0] || "there";
  const expectedText = `Hi ${userFirstName}, what should we focus on this week?`;

  let changed = false;
  const next = messages.map((message, index) => {
    if (index !== 0) return message;
    if (message?.name !== directPartnerName) return message;

    const currentText = String(message?.text || "");
    const looksLikeOldGreeting = /^Hi\s.+,\swhat should we focus on this week\?$/i.test(
      currentText,
    );

    if (!looksLikeOldGreeting || currentText === expectedText) {
      return message;
    }

    changed = true;
    return {
      ...message,
      text: expectedText,
    };
  });

  return changed ? next : messages;
}

function normalizeGroupMessages(messages, activeThreadId, user) {
  if (!Array.isArray(messages) || messages.length === 0) return messages;
  const isMenteeGroup =
    activeThreadId === "mentee_group_checkins" ||
    activeThreadId === "mentee_group_opportunities" ||
    activeThreadId === "mentee_group_interviews";

  if (!isMenteeGroup || user.role !== "mentee") {
    return messages;
  }

  const mineOnly = messages.filter((message) => message?.name === user.name);
  return mineOnly.length === messages.length ? messages : mineOnly;
}

function pickOne(items) {
  if (!Array.isArray(items) || items.length === 0) return "Sounds good.";
  return items[Math.floor(Math.random() * items.length)];
}

function pickNonRepeating(options, recentTexts) {
  if (!Array.isArray(options) || options.length === 0) return "Sounds good.";
  const filtered = options.filter((option) => !recentTexts.includes(option));
  return pickOne(filtered.length ? filtered : options);
}

function buildContextualReply(baseText, userMessage) {
  const cleaned = String(userMessage || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return baseText;

  const lower = cleaned.toLowerCase();

  const isQuestion = cleaned.includes("?");
  const isThankYou = /\b(thanks|thank you|appreciate)\b/i.test(lower);
  const isGreeting = /\b(hi|hello|hey|yo|hii|heyy)\b/i.test(lower);
  const isConcern = /\b(stuck|confused|hard|difficult|worried|stress|overwhelm)\b/i.test(
    lower,
  );

  const leadIns = {
    greeting: [
      "Hey! Great to hear from you.",
      "Hi! Thanks for reaching out.",
      "Hey — happy to chat about this.",
    ],
    question: [
      "Great question.",
      "Good question — here’s what I’d do.",
      "That makes sense to ask.",
    ],
    thanks: [
      "You’re welcome.",
      "Anytime — happy to help.",
      "Glad that helped.",
    ],
    concern: [
      "I get why that feels tough.",
      "That’s completely understandable.",
      "You’re not alone in that.",
    ],
    neutral: [
      "Makes sense.",
      "Got it.",
      "That sounds good.",
    ],
  };

  let lead = pickOne(leadIns.neutral);
  if (isGreeting) {
    lead = pickOne(leadIns.greeting);
  } else if (isThankYou) {
    lead = pickOne(leadIns.thanks);
  } else if (isConcern) {
    lead = pickOne(leadIns.concern);
  } else if (isQuestion) {
    lead = pickOne(leadIns.question);
  }

  return `${lead} ${baseText}`;
}

function getAutoReplyForThread(activeThread, user, directPartnerName, messageText, messages) {
  const normalizedMessage = String(messageText || "").toLowerCase();
  const recentReplyTexts = (Array.isArray(messages) ? messages : [])
    .filter((message) => message?.name && message.name !== user.name)
    .slice(-6)
    .map((message) => String(message.text || ""));

  if (activeThread.type === "direct") {
    if (normalizedMessage.includes("cv") || normalizedMessage.includes("resume")) {
      return {
        name: directPartnerName,
        text: pickNonRepeating(
          [
            "Absolutely — send your CV and I’ll give you focused feedback today.",
            "Great, share the latest CV draft and I’ll mark key improvements for impact.",
            "Perfect, I’ll review your CV line-by-line and suggest concise edits.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (normalizedMessage.includes("interview")) {
      return {
        name: directPartnerName,
        text: pickNonRepeating(
          [
            "Great, let’s do interview prep. I’ll send a few mock questions to start.",
            "Nice focus — we can run a mock interview and review your answers right after.",
            "Good call. Let’s practice behavioural and technical questions this week.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (normalizedMessage.includes("goal") || normalizedMessage.includes("plan")) {
      return {
        name: directPartnerName,
        text: pickNonRepeating(
          [
            "Let’s set one weekly goal and one measurable outcome so progress is clear.",
            "Good idea — we can break your plan into small weekly milestones.",
            "I like that. Let’s prioritize the top two goals for this week first.",
          ],
          recentReplyTexts,
        ),
      };
    }

    return {
      name: directPartnerName,
      text: pickNonRepeating(
        [
          "Great point — let’s break that into 2 clear actions for this week.",
          "Love that idea. Want to set a deadline for it by Friday?",
          "That sounds good. I can help you prioritize the next steps.",
          "Perfect, let’s focus on that first and review progress in our next check-in.",
          "Makes sense — I’ll help you turn that into a practical action plan.",
        ],
        recentReplyTexts,
      ),
    };
  }

  if (activeThread.id === "mentee_group_checkins") {
    if (normalizedMessage.includes("mentor") && normalizedMessage.includes("reply")) {
      return {
        name: pickOne(["Mentee 2", "Mentee 3"]),
        text: pickNonRepeating(
          [
            "I had this too — one weekly check-in message got much faster replies.",
            "When I shared a short progress update, my mentor replied quicker.",
            "A fixed check-in day made responses much more reliable for me.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (normalizedMessage.includes("meeting") || normalizedMessage.includes("call")) {
      return {
        name: pickOne(["Mentee 3", "Mentee 1"]),
        text: pickNonRepeating(
          [
            "Try locking one recurring 20-minute slot each week. It really helps.",
            "We set a fixed weekly call and the momentum improved a lot.",
            "Recurring calendar invites helped us stay consistent.",
          ],
          recentReplyTexts,
        ),
      };
    }

    return {
      name: pickOne(["Mentee 1", "Mentee 2", "Mentee 3"]),
      text: pickNonRepeating(
        [
          "I relate — setting a fixed check-in day improved consistency.",
          "A short Friday progress update worked well for me.",
          "Agree — sharing blockers early helped keep my mentor engaged.",
          "I ask one clear question per update and get better responses.",
        ],
        recentReplyTexts,
      ),
    };
  }

  if (activeThread.id === "mentee_group_opportunities") {
    if (
      normalizedMessage.includes("intern") ||
      normalizedMessage.includes("job") ||
      normalizedMessage.includes("role")
    ) {
      return {
        name: pickOne(["Mentee 4", "Mentee 5"]),
        text: pickNonRepeating(
          [
            "Great share — please post the link here and I’ll apply too.",
            "Nice one, can you add the deadline and location for this role?",
            "This is relevant for me too — I’ll apply and share my update here.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (normalizedMessage.includes("referral")) {
      return {
        name: pickOne(["Mentee 4", "Mentee 5"]),
        text: pickNonRepeating(
          [
            "Thanks! I can refer for one open role at my company if it matches.",
            "Happy to refer where I can — share your CV and target role.",
            "I may have a referral path too; I’ll confirm and update this chat.",
          ],
          recentReplyTexts,
        ),
      };
    }

    return {
      name: pickOne(["Mentee 4", "Mentee 5", "Mentee 6"]),
      text: pickNonRepeating(
        [
          "Nice one — I’ll add two more opportunities in a moment.",
          "Super helpful, thank you for sharing this.",
          "Great post — I’ll also share grad roles I bookmarked today.",
          "This thread is useful, let’s keep all role links in one place.",
        ],
        recentReplyTexts,
      ),
    };
  }

  if (activeThread.id === "mentee_group_interviews") {
    if (normalizedMessage.includes("mock") || normalizedMessage.includes("practice")) {
      return {
        name: pickOne(["Mentee 6", "Mentee 7"]),
        text: pickNonRepeating(
          [
            "I’m in — let’s run a 30-minute mock round tonight.",
            "Count me in. We can do one interviewer/one candidate practice round.",
            "Yes please — I can practice with you after 7pm.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (
      normalizedMessage.includes("star") ||
      normalizedMessage.includes("question") ||
      normalizedMessage.includes("behaviour")
    ) {
      return {
        name: pickOne(["Mentee 6", "Mentee 7"]),
        text: pickNonRepeating(
          [
            "I’ve got a STAR answer sheet, happy to share it in this chat.",
            "I can share behaviour question prompts and sample STAR structures.",
            "I made a doc of common interview questions — I’ll drop it here.",
          ],
          recentReplyTexts,
        ),
      };
    }

    return {
      name: pickOne(["Mentee 6", "Mentee 7", "Mentee 8"]),
      text: pickNonRepeating(
        [
          "Great topic — confidence improved a lot once I practiced out loud.",
          "Let’s collect common interview questions here and rehearse together.",
          "Practicing concise answers helped me stay calm in interviews.",
          "I found timed mock rounds really useful before final interviews.",
        ],
        recentReplyTexts,
      ),
    };
  }

  return {
    name: "Community",
    text: "Thanks for sharing.",
  };
}

export default function Community() {
  const navigate = useNavigate();
  const user = useMemo(() => getCurrentUser(), []);
  const randomMentorName = useMemo(() => pickRandomMentorName(), []);
  const directPartner = useMemo(
    () => getDirectChatPartner(user, randomMentorName),
    [user, randomMentorName],
  );

  const circleGroups = useMemo(() => {
    if (user.role === "mentor") return [];

    return [
      {
        id: "mentee_group_checkins",
        title: "Mentee Check-ins",
        subtitle: "Discussing mentor response and support",
        icon: "🤝",
      },
      {
        id: "mentee_group_opportunities",
        title: "Mentee Opportunities",
        subtitle: "Internships, jobs, referrals",
        icon: "💼",
      },
      {
        id: "mentee_group_interviews",
        title: "Mock It Till We Make It",
        subtitle: "Interview practice, confidence, and feedback",
        icon: "🎤",
      },
    ];
  }, [user.role]);

  const [activeMode, setActiveMode] = useState(
    user.role === "mentor" ? "direct" : "circle",
  );
  const [activeGroupId, setActiveGroupId] = useState(circleGroups[0]?.id || "");
  const [hoveredGroupId, setHoveredGroupId] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const activeThreadIdRef = useRef("");

  const activeGroup =
    circleGroups.find((group) => group.id === activeGroupId) || circleGroups[0];

  const activeThread =
    activeMode === "circle"
      ? { ...activeGroup, type: "circle" }
      : { ...directPartner, type: "direct" };

  useEffect(() => {
    if (user.role === "mentor") {
      setActiveMode("direct");
    }
  }, [user.role]);

  const storageKey = useMemo(() => `mentorme_chat_${activeThread.id}`, [activeThread.id]);

  useEffect(() => {
    activeThreadIdRef.current = activeThread.id;
  }, [activeThread.id]);

  useEffect(() => {
    const existing = safeRead(storageKey, null);
    if (existing && Array.isArray(existing) && existing.length) {
      const directNormalized = normalizeDirectGreeting(
        existing,
        activeThread.id,
        user,
        directPartner.subtitle,
      );
      const normalized = normalizeGroupMessages(directNormalized, activeThread.id, user);
      setMessages(normalized);
      if (normalized !== existing) {
        localStorage.setItem(storageKey, JSON.stringify(normalized));
      }
      return;
    }

    const seeded = initialMessagesForThread(activeThread.id, user, directPartner.subtitle);
    setMessages(seeded);
    localStorage.setItem(storageKey, JSON.stringify(seeded));
  }, [activeThread.id, storageKey, user, directPartner.subtitle]);

  function send() {
    const trimmed = text.trim();
    if (!trimmed) return;

    const next = [
      ...messages,
      {
        id: createMessageId(),
        name: user.name,
        text: trimmed,
        at: new Date().toISOString(),
      },
    ];

    setMessages(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setText("");

    const replyDraft = getAutoReplyForThread(
      activeThread,
      user,
      directPartner.subtitle,
      trimmed,
      next,
    );
    const replyStorageKey = storageKey;
    const replyThreadId = activeThread.id;

    window.setTimeout(() => {
      const contextualText = buildContextualReply(replyDraft.text, trimmed);
      const replyMessage = {
        id: createMessageId(),
        name: replyDraft.name,
        text: contextualText,
        at: new Date().toISOString(),
      };

      const existingForThread = safeRead(replyStorageKey, []);
      const existingList = Array.isArray(existingForThread) ? existingForThread : [];
      const nextWithReply = [...existingList, replyMessage];

      localStorage.setItem(replyStorageKey, JSON.stringify(nextWithReply));

      if (activeThreadIdRef.current === replyThreadId) {
        setMessages(nextWithReply);
      }
    }, 850);
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.topRow}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <h1 style={styles.pageTitle}>Community</h1>
      <p style={styles.sub}>
        {user.role === "mentor"
          ? "Chat directly with your current mentee."
          : "Join mentee group chats or chat directly with your current mentor."}
      </p>

      <div style={styles.modeTabs}>
        {user.role !== "mentor" && (
          <button
            onClick={() => setActiveMode("circle")}
            style={{
              ...styles.modeTab,
              ...(activeMode === "circle" ? styles.modeTabActive : {}),
            }}
          >
            Mentee Circle
          </button>
        )}
        <button
          onClick={() => setActiveMode("direct")}
          style={{
            ...styles.modeTab,
            ...(activeMode === "direct" ? styles.modeTabActive : {}),
            ...(user.role === "mentor" ? styles.modeTabFull : {}),
          }}
        >
          {user.role === "mentor" ? "Current Mentee" : "Current Mentor"}
        </button>
      </div>

      {activeMode === "circle" && (
        <div style={styles.threadList}>
          <div style={styles.groupLabel}>Mentees Only Group Chats</div>
          <div style={styles.groupIconsRow}>
            {circleGroups.map((group) => (
              <button
                key={group.id}
                aria-label={`${group.title}. ${group.subtitle}`}
                onClick={() => setActiveGroupId(group.id)}
                onMouseEnter={() => setHoveredGroupId(group.id)}
                onMouseLeave={() => setHoveredGroupId("")}
                onFocus={() => setHoveredGroupId(group.id)}
                onBlur={() => setHoveredGroupId("")}
                style={{
                  ...styles.groupIconBtn,
                  ...(activeGroupId === group.id ? styles.groupIconBtnActive : {}),
                }}
              >
                <span style={styles.groupIconTopic}>{group.icon}</span>
                {hoveredGroupId === group.id && (
                  <div style={styles.hoverCard}>
                    <div style={styles.hoverTitle}>{group.title}</div>
                    <div style={styles.hoverSub}>{group.subtitle}</div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeMode === "direct" && (
        <button style={{ ...styles.threadBtn, ...styles.threadActive }}>
          <div style={styles.threadIcon}>{directPartner.icon}</div>
          <div style={{ textAlign: "left" }}>
            <div style={styles.threadTitle}>
              {user.role === "mentor" ? "Current Mentee" : "Current Mentor"}
            </div>
            <div style={styles.threadSubtitle}>{directPartner.subtitle}</div>
          </div>
          <span style={styles.openHint}>DIRECT</span>
        </button>
      )}

      <div style={styles.chatWindow}>
        {messages.length === 0 ? (
          <div style={{ opacity: 0.7 }}>
            {activeThread.type === "circle"
              ? "No messages yet."
              : "No messages yet. Start the chat."}
          </div>
        ) : (
          messages.map((message) => {
            const mine = message.name === user.name;
            return (
              <div
                key={message.id}
                style={{
                  ...styles.messageRow,
                  justifyContent: mine ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    ...styles.bubble,
                    ...(mine ? styles.myBubble : styles.theirBubble),
                  }}
                >
                  {!mine && <div style={styles.senderName}>{message.name}</div>}
                  <div>{message.text}</div>
                  <div style={styles.timeText}>
                    {new Date(message.at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={`Message ${activeThread.title}...`}
          onKeyDown={(event) => {
            if (event.key === "Enter") send();
          }}
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
    gap: 10,
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
  },

  pageTitle: {
    margin: "2px 0 0",
    fontSize: 34,
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: -0.4,
    color: "#023047",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },

  backBtn: {
    border: "none",
    color: "#ffffff",
    background: "#1f5f3a",
    padding: "8px 14px",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },

  sub: { margin: 0, opacity: 0.78, fontWeight: 600, fontSize: 13 },

  modeTabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },

  modeTab: {
    border: "1px solid #d3e7da",
    borderRadius: 12,
    background: "#ffffff",
    color: "#023047",
    fontWeight: 900,
    padding: "10px 8px",
    cursor: "pointer",
    fontSize: 13,
  },

  modeTabActive: {
    border: "1px solid #1f5f3a",
    background: "#e8f3ec",
    color: "#1f5f3a",
  },

  modeTabFull: {
    gridColumn: "1 / -1",
  },

  groupLabel: {
    fontSize: 12,
    fontWeight: 900,
    color: "#1f5f3a",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    margin: "12px 0 4px",
    textAlign: "center",
  },

  threadList: {
    display: "grid",
    gap: 8,
  },

  groupIconsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    marginTop: 2,
  },

  groupIconBtn: {
    border: "1px solid #d3e7da",
    borderRadius: 14,
    background: "#ffffff",
    padding: "12px 10px",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    minHeight: 54,
    position: "relative",
    overflow: "visible",
  },

  groupIconBtnActive: {
    border: "1px solid #1f5f3a",
    background: "#e8f3ec",
    boxShadow: "0 4px 10px rgba(31,95,58,0.12)",
  },

  groupIconTopic: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "grid",
    placeItems: "center",
    fontSize: 18,
    fontWeight: 700,
    color: "#ffffff",
    background: "linear-gradient(135deg, #244e62 0%, #1f5f3a 100%)",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 3px 8px rgba(2,48,71,0.2)",
  },

  hoverCard: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: "50%",
    transform: "translateX(-50%)",
    width: 190,
    background: "#023047",
    color: "#ffffff",
    borderRadius: 10,
    padding: "10px 10px",
    zIndex: 20,
    boxShadow: "0 8px 18px rgba(2, 48, 71, 0.35)",
    border: "1px solid #1f5f3a",
    pointerEvents: "none",
  },

  hoverTitle: {
    fontWeight: 900,
    fontSize: 13,
    marginBottom: 4,
  },

  hoverSub: {
    fontSize: 12,
    lineHeight: 1.35,
    opacity: 0.96,
  },

  directThreadRow: {
    width: "100%",
    padding: "4px 2px 2px",
    display: "flex",
    alignItems: "center",
    gap: 9,
  },

  threadBtn: {
    width: "100%",
    border: "1px solid #d3e7da",
    borderRadius: 12,
    background: "#ffffff",
    padding: "9px 10px",
    display: "flex",
    alignItems: "center",
    gap: 9,
    cursor: "pointer",
    marginTop: 2,
  },

  threadActive: {
    border: "1px solid #1f5f3a",
    background: "#e8f3ec",
  },

  threadIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    background: "#f2f7f4",
    display: "grid",
    placeItems: "center",
    fontSize: 16,
  },

  threadTitle: { fontWeight: 900, fontSize: 13.5 },
  threadSubtitle: { fontSize: 11.5, opacity: 0.72 },

  openHint: {
    marginLeft: "auto",
    fontSize: 11,
    fontWeight: 800,
    color: "#1f5f3a",
  },

  groupBadge: {
    marginLeft: "auto",
    fontSize: 10,
    fontWeight: 900,
    color: "#1f5f3a",
    border: "1px solid #1f5f3a",
    borderRadius: 999,
    padding: "2px 7px",
    background: "#eef8f1",
  },

  chatWindow: {
    border: "1px solid #d3e7da",
    borderRadius: 14,
    padding: 10,
    overflowY: "auto",
    background: "#ffffff",
    minHeight: "32vh",
    maxHeight: "38vh",
    marginTop: 2,
  },

  messageRow: {
    display: "flex",
    marginBottom: 6,
  },

  bubble: {
    maxWidth: "80%",
    padding: "7px 9px",
    borderRadius: 10,
    fontSize: 13,
    lineHeight: 1.35,
  },

  myBubble: {
    background: "#dcf8c6",
    border: "1px solid #cbe8b3",
  },

  theirBubble: {
    background: "#f6f7f8",
    border: "1px solid #e4eaee",
  },

  senderName: {
    fontWeight: 800,
    fontSize: 11,
    color: "#1f5f3a",
    marginBottom: 2,
  },

  timeText: {
    marginTop: 4,
    fontSize: 11,
    opacity: 0.6,
    textAlign: "right",
  },

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
    border: "1px solid #1a4f31",
    background: "#1f5f3a",
    color: "#ffffff",
    fontWeight: 800,
  },
};
