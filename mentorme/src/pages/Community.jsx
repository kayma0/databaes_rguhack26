import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mentors as seedMentors } from "../data/mentors.js";
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

function detectCommunityTopic(text) {
  const input = String(text || "").toLowerCase();

  if (input.includes("cv") || input.includes("resume") || input.includes("portfolio")) {
    return "cv";
  }

  if (
    input.includes("interview") ||
    input.includes("mock") ||
    input.includes("star") ||
    input.includes("behaviour") ||
    input.includes("question")
  ) {
    return "interview";
  }

  if (input.includes("goal") || input.includes("plan") || input.includes("roadmap")) {
    return "goals";
  }

  if (
    input.includes("intern") ||
    input.includes("job") ||
    input.includes("role") ||
    input.includes("apply") ||
    input.includes("application") ||
    input.includes("referral")
  ) {
    return "opportunities";
  }

  if (
    input.includes("check") ||
    input.includes("meeting") ||
    input.includes("call") ||
    input.includes("reply") ||
    input.includes("ghost") ||
    input.includes("mentor")
  ) {
    return "checkins";
  }

  if (
    input.includes("stuck") ||
    input.includes("confused") ||
    input.includes("hard") ||
    input.includes("difficult") ||
    input.includes("worried")
  ) {
    return "concern";
  }

  return "general";
}

function inferRecentCommunityTopic(messages, userName) {
  const recent = (Array.isArray(messages) ? messages : []).slice(-8).reverse();
  for (const message of recent) {
    if (!message?.text) continue;
    if (!message?.name || message.name === userName) continue;
    const topic = detectCommunityTopic(message.text);
    if (topic !== "general") return topic;
  }
  return "general";
}

function getAutoReplyForThread(activeThread, user, directPartnerName, messageText, messages) {
  const normalizedMessage = String(messageText || "").toLowerCase();
  const recentReplyTexts = (Array.isArray(messages) ? messages : [])
    .filter((message) => message?.name && message.name !== user.name)
    .slice(-6)
    .map((message) => String(message.text || ""));

  const isGreeting = /\b(hi|hello|hey|hii|heyy|yo)\b/i.test(normalizedMessage);
  const isThanks = /\b(thanks|thank you|appreciate)\b/i.test(normalizedMessage);
  const isQuestion = normalizedMessage.includes("?");
  const isAffirmation = /^(yes|yeah|yep|sure|ok|okay|sounds good|lets|let's)\b/i.test(
    normalizedMessage.trim(),
  );

  const explicitTopic = detectCommunityTopic(normalizedMessage);
  const recentTopic = inferRecentCommunityTopic(messages, user.name);
  const topic = explicitTopic !== "general" ? explicitTopic : isAffirmation ? recentTopic : "general";

  if (activeThread.type === "direct") {
    if (isGreeting) {
      return {
        name: directPartnerName,
        text: pickNonRepeating(
          [
            "Hey! Great to hear from you. What do you want us to focus on first this week?",
            "Hi! Glad you messaged. Tell me what you need most help with right now.",
            "Hey, good to connect. I’m here—what should we tackle together today?",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (isThanks) {
      return {
        name: directPartnerName,
        text: pickNonRepeating(
          [
            "Anytime—happy to help. Send your next update and we’ll keep building momentum.",
            "You’re welcome. Keep going and share progress when you’re ready.",
            "No worries at all. I’m glad it helped—let’s keep moving.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "cv") {
      return {
        name: directPartnerName,
        text: pickNonRepeating(
          [
            "Perfect, send your CV and I’ll give specific edits you can apply today.",
            "Great call. Share the latest version and I’ll highlight what to improve first.",
            "Yes—let’s work on your CV. I can help tighten your bullets and results language.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "interview") {
      return {
        name: directPartnerName,
        text: pickNonRepeating(
          [
            "Great, let’s do interview prep. I’ll send mock questions and feedback after each answer.",
            "Nice focus—we can run a mock interview and review what to improve immediately.",
            "Good plan. Let’s practice behavioural and technical questions step by step.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "goals") {
      return {
        name: directPartnerName,
        text: pickNonRepeating(
          [
            "Love that—let’s set one clear goal for this week and one measurable outcome.",
            "Good idea. We can break your plan into smaller weekly milestones.",
            "I like that direction. Let’s prioritize your top two goals first.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "opportunities") {
      return {
        name: directPartnerName,
        text: pickNonRepeating(
          [
            "Great—send me the roles you’re targeting and I’ll help you prioritize them.",
            "Nice, let’s narrow this to the best opportunities for your profile.",
            "Good move. Share the listings and I’ll help tailor your approach.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "concern") {
      return {
        name: directPartnerName,
        text: pickNonRepeating(
          [
            "I hear you. Let’s simplify this and focus on one step you can complete this week.",
            "That’s normal—you’re not behind. We’ll tackle it one piece at a time.",
            "Thanks for sharing that. Let’s make a small action plan so this feels manageable.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (isQuestion) {
      return {
        name: directPartnerName,
        text: pickNonRepeating(
          [
            "Great question. I’d start with the highest-impact step, then we’ll build from there.",
            "Good question—let’s do this in a simple sequence so it’s easier to execute.",
            "That’s a smart ask. I’ll suggest a practical first step right now.",
          ],
          recentReplyTexts,
        ),
      };
    }

    return {
      name: directPartnerName,
      text: pickNonRepeating(
        [
          "Makes sense. Let’s break that into two clear actions for this week.",
          "I like that direction. Want to set a deadline so we stay accountable?",
          "That sounds good. I’ll help you prioritize the next step first.",
          "Perfect—let’s focus on that and review progress in our next check-in.",
          "Great, we can turn that into a practical plan you can follow.",
        ],
        recentReplyTexts,
      ),
    };
  }

  if (activeThread.id === "mentee_group_checkins") {
    if (isGreeting) {
      return {
        name: pickOne(["Mentee 1", "Mentee 2", "Mentee 3"]),
        text: pickNonRepeating(
          [
            "Hey! Glad you posted—this group is super helpful for check-in ideas.",
            "Hi! Good to have you here. Happy to share what worked for me.",
            "Hey, welcome! Let’s figure this out together.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "checkins") {
      return {
        name: pickOne(["Mentee 2", "Mentee 3"]),
        text: pickNonRepeating(
          [
            "I had this too—one weekly check-in message got much faster replies.",
            "When I sent short progress updates, my mentor started replying quicker.",
            "A fixed check-in day made responses way more reliable for me.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "concern") {
      return {
        name: pickOne(["Mentee 1", "Mentee 2"]),
        text: pickNonRepeating(
          [
            "I totally get that—I felt the same before we agreed one consistent weekly touchpoint.",
            "You’re not alone. A short recurring check-in made things feel much less stressful for me.",
            "That’s valid. It got better once I started sharing a weekly summary + one clear ask.",
          ],
          recentReplyTexts,
        ),
      };
    }

    return {
      name: pickOne(["Mentee 1", "Mentee 2", "Mentee 3"]),
      text: pickNonRepeating(
        [
          "I relate—setting a fixed check-in day improved consistency for me.",
          "A short Friday progress update worked really well on my side.",
          "Sharing blockers early helped keep my mentor engaged.",
          "I send one clear question each update and usually get a better response.",
        ],
        recentReplyTexts,
      ),
    };
  }

  if (activeThread.id === "mentee_group_opportunities") {
    if (isGreeting) {
      return {
        name: pickOne(["Mentee 4", "Mentee 5", "Mentee 6"]),
        text: pickNonRepeating(
          [
            "Hey! Nice to see you here—drop roles you find and we’ll all help each other.",
            "Hi! Welcome to the opportunities thread 🙌",
            "Hey! This is a great place to share internships and referrals.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "opportunities") {
      return {
        name: pickOne(["Mentee 4", "Mentee 5"]),
        text: pickNonRepeating(
          [
            "Great find—please post the link and I’ll apply too.",
            "Nice one, can you add deadline and location details?",
            "This matches what I’m looking for too. I’ll apply and update here.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "cv") {
      return {
        name: pickOne(["Mentee 4", "Mentee 5"]),
        text: pickNonRepeating(
          [
            "If you want, I can quickly review your CV before you apply.",
            "Happy to swap CV feedback too—mine improved a lot after peer edits.",
            "Let’s do CV checks here before submissions so we can improve hit rate.",
          ],
          recentReplyTexts,
        ),
      };
    }

    return {
      name: pickOne(["Mentee 4", "Mentee 5", "Mentee 6"]),
      text: pickNonRepeating(
        [
          "Nice one—I’ll add two more opportunities in a bit.",
          "Super helpful, thanks for sharing.",
          "Great post. I’ll share grad roles I bookmarked today as well.",
          "Let’s keep all role links in this thread so it’s easy to track.",
        ],
        recentReplyTexts,
      ),
    };
  }

  if (activeThread.id === "mentee_group_interviews") {
    if (isGreeting) {
      return {
        name: pickOne(["Mentee 6", "Mentee 7", "Mentee 8"]),
        text: pickNonRepeating(
          [
            "Hey! Welcome—this chat is great for mock practice and feedback.",
            "Hi! Jump in anytime, we run mock rounds pretty often here.",
            "Hey there! Happy to practice together if you want.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "interview") {
      return {
        name: pickOne(["Mentee 6", "Mentee 7"]),
        text: pickNonRepeating(
          [
            "I’m in—let’s run a 30-minute mock round tonight.",
            "Count me in. We can do interviewer/candidate practice rounds.",
            "Yes please, I can practice after 7pm if that works.",
          ],
          recentReplyTexts,
        ),
      };
    }

    if (topic === "concern") {
      return {
        name: pickOne(["Mentee 6", "Mentee 7"]),
        text: pickNonRepeating(
          [
            "I get that—interviews stressed me out too. Mocking with others helped a lot.",
            "Totally normal to feel that way. Practice made me way more confident.",
            "You’re not alone. We can do low-pressure practice first and build up.",
          ],
          recentReplyTexts,
        ),
      };
    }

    return {
      name: pickOne(["Mentee 6", "Mentee 7", "Mentee 8"]),
      text: pickNonRepeating(
        [
          "Great topic—confidence improved for me once I practiced out loud.",
          "Let’s collect common interview questions here and rehearse together.",
          "Practicing concise answers helped me stay calm in interviews.",
          "Timed mock rounds were really useful before my final interviews.",
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
      const groupNormalized = normalizeGroupMessages(directNormalized, activeThread.id, user);
      const normalized = normalizeBrokenReplies(groupNormalized);
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

    const replyDraft = buildSmartReply({
      message: trimmed,
      persona: activeThread.type === "direct" ? "mentor-direct" : "mentee-peer",
      threadId: activeThread.id,
      recentMessages: next,
      myName: user.name,
      fallbackName: directPartner.subtitle,
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
