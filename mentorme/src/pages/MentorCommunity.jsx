import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { buildSmartReply } from "../utils/chatResponder.js";

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

function getMentorUser() {
  const mentor = safeRead("mentorme_mentor", {});
  const fallbackName =
    mentor.name || `${mentor.firstName || ""} ${mentor.lastName || ""}`.trim() || "Mentor";

  return {
    name: fallbackName,
    firstName: mentor.firstName || fallbackName.split(" ")[0] || "Mentor",
  };
}

function getCurrentMentee(currentMentorName) {
  const mentorProfile = safeRead("mentorme_mentor", {});
  const requests = safeRead("mentor_requests", []);
  const mentorName =
    mentorProfile.name ||
    `${mentorProfile.firstName || ""} ${mentorProfile.lastName || ""}`.trim() ||
    currentMentorName;

  const accepted = requests.find((request) => {
    if (request?.status !== "accepted") return false;
    if (mentorProfile.id && request.mentorId === mentorProfile.id) return true;
    return mentorName && request.mentorName === mentorName;
  });

  if (accepted) {
    return {
      name: accepted?.mentee?.name || "Your Mentee",
      title: accepted?.mentee?.targetRole || "Mentee",
    };
  }

  return {
    name: "Your Mentee",
    title: "Mentee",
  };
}

function detectMenteeTopic(text) {
  const input = String(text || "").toLowerCase();

  if (input.includes("cv") || input.includes("resume") || input.includes("portfolio")) {
    return "cv";
  }

  if (input.includes("interview") || input.includes("mock") || input.includes("question")) {
    return "interview";
  }

  if (input.includes("goal") || input.includes("plan") || input.includes("roadmap")) {
    return "goals";
  }

  if (
    input.includes("apply") ||
    input.includes("application") ||
    input.includes("job") ||
    input.includes("intern")
  ) {
    return "applications";
  }

  if (input.includes("meeting") || input.includes("check") || input.includes("session")) {
    return "checkins";
  }

  if (input.includes("stuck") || input.includes("hard") || input.includes("difficult")) {
    return "concern";
  }

  return "general";
}

function inferRecentMenteeTopic(messages, mentorName, menteeName) {
  const recent = (Array.isArray(messages) ? messages : []).slice(-8).reverse();
  for (const message of recent) {
    if (!message?.text) continue;
    if (message.name !== mentorName && message.name !== menteeName) continue;
    const topic = detectMenteeTopic(message.text);
    if (topic !== "general") return topic;
  }

  return "general";
}

function detectMentorGroupTopic(text) {
  const input = String(text || "").toLowerCase();

  if (input.includes("check") || input.includes("session") || input.includes("cadence")) {
    return "checkins";
  }

  if (input.includes("goal") || input.includes("plan") || input.includes("milestone")) {
    return "goals";
  }

  if (input.includes("cv") || input.includes("resume") || input.includes("portfolio")) {
    return "cv";
  }

  if (input.includes("template") || input.includes("resource") || input.includes("guide")) {
    return "resources";
  }

  if (input.includes("interview") || input.includes("question") || input.includes("mock")) {
    return "interview";
  }

  if (input.includes("pm") || input.includes("case") || input.includes("product")) {
    return "cases";
  }

  if (
    input.includes("stuck") ||
    input.includes("hard") ||
    input.includes("difficult") ||
    input.includes("struggle")
  ) {
    return "concern";
  }

  return "general";
}

function inferRecentMentorGroupTopic(messages, mentorName) {
  const recent = (Array.isArray(messages) ? messages : []).slice(-8).reverse();
  for (const message of recent) {
    if (!message?.text) continue;
    if (!message?.name || message.name === mentorName) continue;
    const topic = detectMentorGroupTopic(message.text);
    if (topic !== "general") return topic;
  }
  return "general";
}

function normalizeBrokenReplies(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return messages;

  let changed = false;
  const next = messages.map((message) => {
    const text = String(message?.text || "");
    const cleaned = text.replace(/\sIf you want, we can focus on\s[^.?!,]+,?\s*$/i, "");
    const legacyCleaned = cleaned.replace(/\sOn\s[^.?!,]+,\s*$/i, "");

    if (legacyCleaned !== text) {
      changed = true;
      return { ...message, text: legacyCleaned.trim() };
    }

    return message;
  });

  return changed ? next : messages;
}

function getMenteeReply(messageText, messages, mentorName, menteeName) {
  const normalizedMessage = String(messageText || "").toLowerCase();
  const recentReplyTexts = (Array.isArray(messages) ? messages : [])
    .filter((message) => message?.name && message.name !== mentorName)
    .slice(-6)
    .map((message) => String(message.text || ""));

  const isGreeting = /\b(hi|hello|hey|yo|hii|heyy)\b/i.test(normalizedMessage);
  const isThanks = /\b(thanks|thank you|appreciate)\b/i.test(normalizedMessage);
  const isQuestion = normalizedMessage.includes("?");
  const isAffirmation = /^(yes|yeah|yep|sure|ok|okay|sounds good|lets|let's)\b/i.test(
    normalizedMessage.trim(),
  );

  const explicitTopic = detectMenteeTopic(normalizedMessage);
  const recentTopic = inferRecentMenteeTopic(messages, mentorName, menteeName);
  const topic = explicitTopic !== "general" ? explicitTopic : isAffirmation ? recentTopic : "general";

  if (isGreeting) {
    return {
      name: menteeName,
      text: pickNonRepeating(
        [
          "Hey! I’m glad we’re chatting. I’d really like help with my next career steps.",
          "Hi! Thanks for checking in, I’ve got a few things I want to work on this week.",
          "Hello! I’m keen to make progress and would love your guidance.",
        ],
        recentReplyTexts,
      ),
    };
  }

  if (isThanks) {
    return {
      name: menteeName,
      text: pickNonRepeating(
        [
          "Thank you, that really helps. I’ll work on it and share an update soon.",
          "Thanks so much. I’ll apply that and come back with progress.",
          "Appreciate it! I feel clearer about what to do next now.",
        ],
        recentReplyTexts,
      ),
    };
  }

  if (topic === "cv") {
    return {
      name: menteeName,
      text: pickNonRepeating(
        [
          "Yes please, I really want to improve my CV. Can we start with my summary and bullet points?",
          "I’d love CV feedback. I can send my latest version today if that works.",
          "My CV definitely needs work. Could you help me make it stronger for the roles I want?",
        ],
        recentReplyTexts,
      ),
    };
  }

  if (topic === "interview") {
    return {
      name: menteeName,
      text: pickNonRepeating(
        [
          "Interview prep would help me a lot. Could we do a quick mock soon?",
          "I’m preparing for interviews now, especially behavioural questions.",
          "Can we practice interview questions together? I want to feel more confident.",
        ],
        recentReplyTexts,
      ),
    };
  }

  if (topic === "goals") {
    return {
      name: menteeName,
      text: pickNonRepeating(
        [
          "I’d really like a clearer plan for this month. Could we set 2-3 goals together?",
          "Yes, a simple roadmap would help me stay consistent.",
          "I want to focus better. Can we break my goals into weekly actions?",
        ],
        recentReplyTexts,
      ),
    };
  }

  if (topic === "applications") {
    return {
      name: menteeName,
      text: pickNonRepeating(
        [
          "I’m applying this week and could use help tailoring my applications.",
          "I want to apply for more roles, but I’m unsure which ones to prioritize.",
          "Could we review my application approach before I submit more roles?",
        ],
        recentReplyTexts,
      ),
    };
  }

  if (topic === "checkins") {
    return {
      name: menteeName,
      text: pickNonRepeating(
        [
          "A weekly check-in would really help me stay accountable.",
          "Could we keep one regular session time each week?",
          "I’d like more structured check-ins so I can track my progress better.",
        ],
        recentReplyTexts,
      ),
    };
  }

  if (topic === "concern") {
    return {
      name: menteeName,
      text: pickNonRepeating(
        [
          "I’ve been feeling a bit stuck lately, so I’d appreciate a simple plan to follow.",
          "Honestly I’m finding this hard, but I’m ready to work through it step by step.",
          "I’m struggling a bit and could use your help prioritizing what to do first.",
        ],
        recentReplyTexts,
      ),
    };
  }

  if (isQuestion) {
    return {
      name: menteeName,
      text: pickNonRepeating(
        [
          "That sounds good to me. What should I do first this week?",
          "I like that idea. Which step do you want me to start with?",
          "I’m happy to do that. Do you want me to send an update by Friday?",
        ],
        recentReplyTexts,
      ),
    };
  }

  return {
    name: menteeName,
    text: pickNonRepeating(
      [
        "That makes sense. I’m ready to work on it and share progress.",
        "Got it — I’ll start on that and update you after I make progress.",
        "Sounds good. I can focus on that first and report back soon.",
      ],
      recentReplyTexts,
    ),
  };
}

function getMentorAutoReply(activeGroupId, messageText, messages, mentorName) {
  const normalizedMessage = String(messageText || "").toLowerCase();
  const recentReplyTexts = (Array.isArray(messages) ? messages : [])
    .filter((message) => message?.name && message.name !== mentorName)
    .slice(-6)
    .map((message) => String(message.text || ""));

  const isGreeting = /\b(hi|hello|hey|hii|heyy|yo)\b/i.test(normalizedMessage);
  const isThanks = /\b(thanks|thank you|appreciate)\b/i.test(normalizedMessage);
  const isQuestion = normalizedMessage.includes("?");
  const isAffirmation = /^(yes|yeah|yep|sure|ok|okay|sounds good|lets|let's)\b/i.test(
    normalizedMessage.trim(),
  );

  const explicitTopic = detectMentorGroupTopic(normalizedMessage);
  const recentTopic = inferRecentMentorGroupTopic(messages, mentorName);
  const topic = explicitTopic !== "general" ? explicitTopic : isAffirmation ? recentTopic : "general";

  if (activeGroupId === "mentor_group_strategy") {
    if (isGreeting) {
      return {
        name: pickOne(["Mentor Ella", "Mentor Priya", "Mentor David"]),
        text: pickNonRepeating(
          [
            "Hey! Great to see this discussion—happy to share what’s worked with my mentees.",
            "Hi all, glad this topic came up. I’ve tested a few approaches here.",
            "Hey team, I can share what improved consistency in my mentoring sessions.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (isThanks) {
      return {
        name: pickOne(["Mentor Ella", "Mentor David"]),
        text: pickNonRepeating(
          [
            "Anytime—glad it helped. Keep us posted on how it goes.",
            "You’re welcome. Would love to hear your results next week.",
            "Happy to help. Share an update once you test it.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "checkins") {
      return {
        name: pickOne(["Mentor Ella", "Mentor David"]),
        text: pickNonRepeating(
          [
            "I do one structured check-in every two weeks plus a short async update weekly.",
            "Weekly quick check-ins + one deeper session has worked best for me.",
            "A fixed cadence made my mentees much more accountable.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "goals") {
      return {
        name: pickOne(["Mentor David", "Mentor Ella"]),
        text: pickNonRepeating(
          [
            "A 30-day plan with weekly milestones has worked really well for my mentees.",
            "I align each mentee to one monthly objective and review progress weekly.",
            "Goal plans land better when each step has a clear owner and deadline.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "concern") {
      return {
        name: pickOne(["Mentor Priya", "Mentor Ella"]),
        text: pickNonRepeating(
          [
            "Totally get it. I narrow scope first, then focus on one measurable outcome.",
            "I’ve been there too. A smaller weekly target helped me regain momentum.",
            "That’s a common challenge—I’d simplify the plan and rebuild consistency.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (isQuestion) {
      return {
        name: pickOne(["Mentor Ella", "Mentor David"]),
        text: pickNonRepeating(
          [
            "Great question. I’d start with cadence first, then layer in goal tracking.",
            "Good ask—I’d prioritize one process change and test it for 2 weeks.",
            "I’d begin with a simple structure, then add complexity only if needed.",
          ],
          recentReplyTexts,
        ),
      };
    }

    return {
      name: pickOne(["Mentor Ella", "Mentor David", "Mentor Priya"]),
      text: pickNonRepeating(
        [
          "Good point—I align mentee goals to one key outcome each month.",
          "I keep a short action list after every session to maintain momentum.",
          "I send session summaries after calls so mentees stay on track.",
          "Consistency improved once we agreed a fixed mentoring rhythm.",
        ],
        recentReplyTexts,
      ),
    };
  }

  if (activeGroupId === "mentor_group_resources") {
    if (isGreeting) {
      return {
        name: pickOne(["Mentor Nina", "Mentor Amir", "Mentor Zoe"]),
        text: pickNonRepeating(
          [
            "Hey! Happy to share resources—this thread has been useful for me too.",
            "Hi all, great topic. I can drop a few templates that worked well.",
            "Hey team, I’ve got docs I can share if helpful.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "cv") {
      return {
        name: pickOne(["Mentor Nina", "Mentor Amir"]),
        text: pickNonRepeating(
          [
            "I can share my CV review checklist template in this thread.",
            "I use a resume scoring rubric for fast feedback cycles—happy to share.",
            "I can post the portfolio review framework I use with mentees.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "resources") {
      return {
        name: pickOne(["Mentor Amir", "Mentor Nina"]),
        text: pickNonRepeating(
          [
            "Great idea—I have a first-session guide I use with new mentees.",
            "I’ll share my kickoff template and recurring agenda structure.",
            "I keep a simple mentoring guide that new mentors can reuse.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (isQuestion) {
      return {
        name: pickOne(["Mentor Nina", "Mentor Amir"]),
        text: pickNonRepeating(
          [
            "Good question. I’d start with one reusable template and iterate from there.",
            "I’d begin with a lightweight guide, then expand as patterns emerge.",
            "I can share a minimal starter set that covers most use cases.",
          ],
          recentReplyTexts,
        ),
      };
    }

    return {
      name: pickOne(["Mentor Nina", "Mentor Amir", "Mentor Zoe"]),
      text: pickNonRepeating(
        [
          "Thanks for sharing—I’ll drop my mentoring resources doc here too.",
          "Useful note. I can add interview prep worksheets in this chat.",
          "I’ll upload my session prep checklist for everyone to reuse.",
          "Nice resource. Let’s keep a single shared thread of templates.",
        ],
        recentReplyTexts,
      ),
    };
  }

  if (activeGroupId === "mentor_group_cases") {
    if (isGreeting) {
      return {
        name: pickOne(["Mentor Leo", "Mentor Zara", "Mentor Ian"]),
        text: pickNonRepeating(
          [
            "Hey! Great to have you here—happy to compare case coaching approaches.",
            "Hi all, love this topic. I can share what has worked in my sessions.",
            "Hey team, I’ve tested a few mock-case formats and can post examples.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "cases") {
      return {
        name: pickOne(["Mentor Leo", "Mentor Zara"]),
        text: pickNonRepeating(
          [
            "For PM cases, I start with product sense before metrics and trade-offs.",
            "I ask mentees to frame user, problem, and success metric before solutions.",
            "Case structure improved once we practiced hypothesis-first answers.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "interview") {
      return {
        name: pickOne(["Mentor Zara", "Mentor Leo"]),
        text: pickNonRepeating(
          [
            "I use a bank of layered interview questions. I’ll share a few examples now.",
            "I rotate foundational and stretch questions to calibrate candidate depth.",
            "I’ll share scenario-based interview prompts that worked well this term.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "concern") {
      return {
        name: pickOne(["Mentor Ian", "Mentor Leo"]),
        text: pickNonRepeating(
          [
            "I hear you. I simplified my case format and mentee confidence improved quickly.",
            "That’s fair—when mentees struggle, I reduce scope and focus on one framework first.",
            "Been there. Short, focused drills worked better than long sessions for me.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (isQuestion) {
      return {
        name: pickOne(["Mentor Zara", "Mentor Leo"]),
        text: pickNonRepeating(
          [
            "Great question. I’d start with structure clarity before depth.",
            "I’d begin with timed drills, then add feedback loops.",
            "Good ask—first optimize communication, then complexity.",
          ],
          recentReplyTexts,
        ),
      };
    }

    return {
      name: pickOne(["Mentor Leo", "Mentor Zara", "Mentor Ian"]),
      text: pickNonRepeating(
        [
          "Good point — mock case drills weekly have improved mentee confidence a lot.",
          "I recommend timed case walkthroughs followed by targeted feedback.",
          "I focus on communication clarity first, then depth and trade-offs.",
          "Practicing concise frameworks helped my mentees answer under pressure.",
        ],
        recentReplyTexts,
      ),
    };
  }

  return {
    name: "Mentor Community",
    text: "Thanks for sharing.",
  };
}

export default function MentorCommunity() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const mentor = useMemo(() => getMentorUser(), []);
  const currentMentee = useMemo(() => getCurrentMentee(mentor.name), [mentor.name]);

  const mentorGroups = useMemo(
    () => [
      {
        id: "mentor_group_strategy",
        title: "Mentor Strategy",
        subtitle: "Check-ins, accountability, mentoring flow",
        icon: "🧭",
      },
      {
        id: "mentor_group_resources",
        title: "Mentor Resources",
        subtitle: "CV reviews, templates, and guidance packs",
        icon: "📚",
      },
      {
        id: "mentor_group_cases",
        title: "Mentor Case Room",
        subtitle: "Case prep and interview coaching tactics",
        icon: "🧠",
      },
    ],
    [],
  );

  const [activeMode, setActiveMode] = useState("groups");
  const [activeGroupId, setActiveGroupId] = useState(mentorGroups[0].id);
  const [hoveredGroupId, setHoveredGroupId] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const activeThreadIdRef = useRef("");

  const activeGroup = mentorGroups.find((group) => group.id === activeGroupId) || mentorGroups[0];
  const activeThread =
    activeMode === "groups"
      ? { ...activeGroup, type: "group" }
      : {
          id: `mentor_mentee_${String(currentMentee.name).replace(/\s+/g, "_")}`,
          title: "My Mentee",
          subtitle: `${currentMentee.name} • ${currentMentee.title}`,
          icon: "💬",
          type: "direct",
        };

  const storageKey = useMemo(
    () => `mentorme_mentor_community_${activeThread.id}`,
    [activeThread.id],
  );

  useEffect(() => {
    activeThreadIdRef.current = activeThread.id;
  }, [activeThread.id]);

  useEffect(() => {
    const existing = safeRead(storageKey, null);
    if (existing && Array.isArray(existing)) {
      const normalized = normalizeBrokenReplies(existing);
      setMessages(normalized);
      if (normalized !== existing) {
        localStorage.setItem(storageKey, JSON.stringify(normalized));
      }
      return;
    }

    setMessages([]);
    localStorage.setItem(storageKey, JSON.stringify([]));
  }, [storageKey]);

  function send() {
    const trimmed = text.trim();
    if (!trimmed) return;

    const next = [
      ...messages,
      {
        id: createMessageId(),
        name: mentor.name,
        text: trimmed,
        at: new Date().toISOString(),
      },
    ];

    setMessages(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setText("");

    const replyDraft = buildSmartReply({
      message: trimmed,
      persona: activeThread.type === "direct" ? "mentee-direct" : "mentor-peer",
      threadId: activeThread.id,
      recentMessages: next,
      myName: mentor.name,
      fallbackName: activeThread.type === "direct" ? currentMentee.name : undefined,
    });
    const replyStorageKey = storageKey;
    const replyThreadId = activeThread.id;

    window.setTimeout(() => {
      const contextualText = replyDraft.text;
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
      <p style={styles.sub}>Mentors only. Share strategies, resources, and coaching tips.</p>

      <div style={styles.modeTabs}>
        <button
          onClick={() => setActiveMode("groups")}
          style={{
            ...styles.modeTab,
            ...(activeMode === "groups" ? styles.modeTabActive : {}),
          }}
        >
          Mentor Groups
        </button>
        <button
          onClick={() => setActiveMode("direct")}
          style={{
            ...styles.modeTab,
            ...(activeMode === "direct" ? styles.modeTabActive : {}),
          }}
        >
          Contact My Mentee
        </button>
      </div>

      {activeMode === "groups" ? (
        <>
          <div style={styles.groupLabel}>Mentors Only Group Chats</div>
          <div style={styles.groupIconsRow}>
            {mentorGroups.map((group) => (
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
        </>
      ) : (
        <button style={{ ...styles.threadBtn, ...styles.threadActive }}>
          <div style={styles.threadIcon}>{activeThread.icon}</div>
          <div style={{ textAlign: "left" }}>
            <div style={styles.threadTitle}>{activeThread.title}</div>
            <div style={styles.threadSubtitle}>{activeThread.subtitle}</div>
          </div>
          <span style={styles.openHint}>DIRECT</span>
        </button>
      )}

      <div style={styles.chatWindow}>
        {messages.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No messages yet.</div>
        ) : (
          messages.map((message) => {
            const mine = message.name === mentor.name;
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

  groupLabel: {
    fontSize: 12,
    fontWeight: 900,
    color: "#1f5f3a",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    margin: "12px 0 4px",
    textAlign: "center",
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

  inputRow: {
    display: "flex",
    gap: 8,
  },

  input: {
    flex: 1,
    borderRadius: 12,
    border: "1px solid #cfe3d7",
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    background: "#ffffff",
  },

  send: {
    border: "none",
    borderRadius: 12,
    background: "#1f5f3a",
    color: "#ffffff",
    fontWeight: 800,
    padding: "10px 14px",
    cursor: "pointer",
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
