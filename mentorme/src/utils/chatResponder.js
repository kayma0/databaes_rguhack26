import nlp from "compromise";

const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "for",
  "of",
  "in",
  "on",
  "at",
  "with",
  "is",
  "it",
  "this",
  "that",
  "i",
  "im",
  "i'm",
  "we",
  "you",
  "my",
  "our",
  "your",
  "me",
  "us",
  "be",
  "am",
  "are",
  "was",
  "were",
  "do",
  "did",
  "does",
  "can",
  "could",
  "should",
  "would",
  "what",
  "when",
  "where",
  "which",
  "who",
  "how",
  "why",
  "hello",
  "hi",
  "hey",
  "yeah",
  "yep",
  "ok",
  "okay",
  "yes",
]);

function pickOne(items) {
  if (!Array.isArray(items) || items.length === 0) return "Sounds good.";
  return items[Math.floor(Math.random() * items.length)];
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function cleanToken(token) {
  return String(token || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/gi, "")
    .trim();
}

function extractTopics(message) {
  const text = String(message || "").trim();
  if (!text) return [];

  const doc = nlp(text);
  const nounPhrases = doc.nouns().out("array").map(cleanToken);
  const topics = doc.topics().out("array").map(cleanToken);
  const terms = doc
    .terms()
    .out("array")
    .map(cleanToken)
    .filter((term) => term && term.length > 2 && !STOPWORDS.has(term));

  return unique([...nounPhrases, ...topics, ...terms]).slice(0, 3);
}

function detectIntent(message) {
  const text = String(message || "").toLowerCase();

  if (/\b(thanks|thank you|appreciate)\b/.test(text)) return "thanks";
  if (/\b(hi|hello|hey|yo|hii|heyy)\b/.test(text)) return "greeting";
  if (/\?/.test(text)) return "question";
  if (/\b(stuck|confused|hard|difficult|worried|overwhelmed|stress)\b/.test(text)) {
    return "concern";
  }

  return "statement";
}

function detectTopicGroup(message, threadId = "") {
  const text = String(message || "").toLowerCase();
  const id = String(threadId || "");

  if (id.includes("opportunities") || /\b(job|intern|role|application|apply|referral)\b/.test(text)) {
    return "opportunities";
  }

  if (id.includes("interviews") || /\b(interview|mock|star|behavio?r|question)\b/.test(text)) {
    return "interview";
  }

  if (id.includes("checkins") || /\b(check|meeting|call|reply|ghost|mentor)\b/.test(text)) {
    return "checkins";
  }

  if (/\b(cv|resume|portfolio)\b/.test(text)) return "cv";
  if (/\b(goal|plan|roadmap|milestone)\b/.test(text)) return "goals";

  if (id.includes("resources") || /\b(template|resource|guide|rubric)\b/.test(text)) {
    return "resources";
  }

  if (id.includes("cases") || /\b(case|pm|product)\b/.test(text)) {
    return "cases";
  }

  if (id.includes("strategy") || /\b(cadence|accountability|session)\b/.test(text)) {
    return "strategy";
  }

  return "general";
}

function pickNonRepeating(options, recentTexts) {
  const filtered = options.filter((option) => !recentTexts.includes(option));
  if (filtered.length > 0) return pickOne(filtered);

  const last = recentTexts[recentTexts.length - 1];
  const notLast = options.filter((option) => option !== last);
  if (notLast.length > 0) {
    const idx = recentTexts.length % notLast.length;
    return notLast[idx];
  }

  return options[recentTexts.length % Math.max(options.length, 1)] || "Sounds good.";
}

function getRecentReplyTexts(messages, myName) {
  return (Array.isArray(messages) ? messages : [])
    .filter((message) => message?.name && message.name !== myName)
    .slice(-8)
    .map((message) => String(message?.text || ""));
}

function buildOpening(intent) {
  if (intent === "greeting") return pickOne(["Hey!", "Hi!", "Hello!"]);
  if (intent === "thanks") return pickOne(["Anytime!", "You’re welcome!", "Happy to help!"]);
  if (intent === "question") return pickOne(["Great question.", "Good question.", "That’s a good ask."]);
  if (intent === "concern") return pickOne(["I hear you.", "That’s understandable.", "You’re not alone in that."]);
  return pickOne(["Makes sense.", "Got it.", "Yeah, that tracks."]);
}

function formatTopicLabel(topicGroup, topics) {
  const directTopic = (topics || []).find((topic) => topic && topic.length > 2);
  if (directTopic) return directTopic;

  const map = {
    opportunities: "applications",
    interview: "interview prep",
    checkins: "check-ins",
    cv: "your CV",
    goals: "your goals",
    resources: "resources",
    cases: "case prep",
    strategy: "mentoring strategy",
    concern: "this challenge",
  };

  return map[topicGroup] || "this";
}

function buildAnchorOptions({ intent, topicGroup, topics, persona }) {
  const topicLabel = formatTopicLabel(topicGroup, topics);

  if (intent === "greeting") {
    return [
      `Tell me what part of ${topicLabel} you want to tackle first.`,
      `If you want, we can start with ${topicLabel}.`,
      `Let’s focus on ${topicLabel} first and build from there.`,
    ];
  }

  if (intent === "thanks") {
    return [
      `When you’re ready, send your next update on ${topicLabel}.`,
      `Keep me posted on how ${topicLabel} goes this week.`,
      `Share your progress on ${topicLabel} and we’ll refine it together.`,
    ];
  }

  if (intent === "question") {
    return [
      `For ${topicLabel}, I’d start with one practical step today.`,
      `On ${topicLabel}, begin with the highest-impact action first.`,
      `If your question is about ${topicLabel}, we can break it into two simple steps.`,
    ];
  }

  if (intent === "concern") {
    return [
      `We can make ${topicLabel} feel manageable by doing one step at a time.`,
      `Let’s simplify ${topicLabel} and focus on one clear win first.`,
      `You don’t need to solve all of ${topicLabel} at once; we can pace it.`,
    ];
  }

  const personaHint =
    persona === "mentor-peer"
      ? "from mentor experience"
      : persona === "mentee-peer"
        ? "as fellow mentees"
        : "together";

  return [
    `Since you mentioned ${topicLabel}, let’s focus on that first ${personaHint}.`,
    `Based on your message, ${topicLabel} seems most important right now.`,
    `We can turn ${topicLabel} into a clear next action this week.`,
  ];
}

function getOpeningOptions(intent) {
  if (intent === "greeting") return ["Hey!", "Hi!", "Hello!"];
  if (intent === "thanks") return ["Anytime!", "You’re welcome!", "Happy to help!"];
  if (intent === "question") return ["Great question.", "Good question.", "That’s a good ask."];
  if (intent === "concern") return ["I hear you.", "That’s understandable.", "You’re not alone in that."];
  return ["Makes sense.", "Got it.", "Yeah, that tracks."];
}

function forceDifferentText(baseText, recentTexts) {
  const recentWindow = recentTexts.slice(-4);
  if (!recentWindow.includes(baseText)) return baseText;

  const tails = [
    "Let’s start with one practical step and build from there.",
    "If helpful, I can break this into two quick actions.",
    "We can keep it simple and focus on what matters most first.",
    "Want me to suggest a concrete first step right now?",
    "Happy to go deeper on this if you want more detail.",
  ];

  const candidates = tails
    .map((tail) => `${baseText} ${tail}`)
    .filter((candidate) => !recentWindow.includes(candidate));

  if (candidates.length > 0) {
    return candidates[recentTexts.length % candidates.length];
  }

  return `${baseText} Let’s keep going and refine this together.`;
}

function withTopic(base, topics) {
  const top = topics[0];
  if (!top) return base;
  return `${base} If you want, we can focus on ${top} first.`;
}

function buildMenteePeerReply({ topicGroup, topics }) {
  if (topicGroup === "opportunities") {
    return withTopic(
      pickOne([
        "I saw a similar posting yesterday and I’ll drop the link here.",
        "I can share a couple more roles in this thread too.",
        "I’m applying to similar roles this week, let’s compare notes.",
      ]),
      topics,
    );
  }

  if (topicGroup === "interview") {
    return withTopic(
      pickOne([
        "I can practice this with you later today if you want.",
        "We should do a quick mock round and share feedback after.",
        "I’ve got a prep doc for this and can post it here.",
      ]),
      topics,
    );
  }

  if (topicGroup === "checkins") {
    return withTopic(
      pickOne([
        "A weekly progress message helped my mentor reply faster.",
        "Setting one fixed check-in day made this easier for me.",
        "I started sending one clear question per update and got better responses.",
      ]),
      topics,
    );
  }

  return withTopic(
    pickOne([
      "That’s useful, I’m dealing with something similar too.",
      "Good point — I’ll share what worked for me in this chat.",
      "I’m in the same boat, happy to collaborate on this.",
    ]),
    topics,
  );
}

function buildMentorDirectReply({ topicGroup, topics }) {
  if (topicGroup === "cv") {
    return withTopic(
      pickOne([
        "send your latest CV and I’ll give line-by-line feedback.",
        "let’s tighten your CV bullets and impact statements first.",
        "we can do a focused CV review and prioritize top fixes.",
      ]),
      topics,
    );
  }

  if (topicGroup === "interview") {
    return withTopic(
      pickOne([
        "let’s run a mock interview and review your answers right after.",
        "I’ll send a set of mock questions and we can practice together.",
        "we can prep behavioural and technical answers step by step.",
      ]),
      topics,
    );
  }

  if (topicGroup === "goals") {
    return withTopic(
      pickOne([
        "let’s set one clear weekly goal and one measurable outcome.",
        "we can break this into smaller milestones for this month.",
        "I’ll help you prioritize the highest-impact goal first.",
      ]),
      topics,
    );
  }

  if (topicGroup === "opportunities") {
    return withTopic(
      pickOne([
        "share the roles you’re targeting and I’ll help prioritize them.",
        "let’s shortlist the best-fit opportunities and tailor your approach.",
        "send the listings and I’ll help refine your application strategy.",
      ]),
      topics,
    );
  }

  return withTopic(
    pickOne([
      "let’s turn this into a practical action plan for this week.",
      "we can break this into two clear next steps.",
      "I can help you prioritize what to do first.",
    ]),
    topics,
  );
}

function buildMentorPeerReply({ topicGroup, topics }) {
  if (topicGroup === "strategy" || topicGroup === "checkins") {
    return withTopic(
      pickOne([
        "I use a fixed cadence with weekly async updates and a deeper bi-weekly check-in.",
        "what improved for me was a clear session structure plus follow-up actions.",
        "consistent check-ins and brief recaps made the biggest difference.",
      ]),
      topics,
    );
  }

  if (topicGroup === "resources" || topicGroup === "cv") {
    return withTopic(
      pickOne([
        "I can share my mentoring templates and review checklist in this thread.",
        "I’ve got a compact starter guide that might help here.",
        "I use a simple rubric for CV/portfolio feedback and can post it.",
      ]),
      topics,
    );
  }

  if (topicGroup === "cases" || topicGroup === "interview") {
    return withTopic(
      pickOne([
        "I start with framework clarity, then drill with timed practice.",
        "scenario-based prompts worked best for my mentees this cycle.",
        "I found concise framework practice improved candidate confidence fast.",
      ]),
      topics,
    );
  }

  if (topicGroup === "goals") {
    return withTopic(
      pickOne([
        "I align mentees to one monthly objective with weekly checkpoints.",
        "goal quality improved when we used milestone-based tracking.",
        "clear ownership and deadlines made goal plans actually stick.",
      ]),
      topics,
    );
  }

  return withTopic(
    pickOne([
      "good point — I’ve seen similar patterns in my mentoring sessions.",
      "I’d test one change first, then iterate based on outcomes.",
      "that’s a useful take; I can share what worked in my context too.",
    ]),
    topics,
  );
}

function buildMenteeDirectReply({ topicGroup, topics }) {
  if (topicGroup === "cv") {
    return withTopic(
      pickOne([
        "I really want to improve my CV — can we start with the summary and bullet points?",
        "I can send my latest CV today if you can review it.",
        "my CV needs work; I’d appreciate specific feedback on what to fix first.",
      ]),
      topics,
    );
  }

  if (topicGroup === "interview") {
    return withTopic(
      pickOne([
        "can we do a mock interview soon? I want to build confidence.",
        "I’m preparing for interviews now and could use structured practice.",
        "I’d like to practice behavioural questions together this week.",
      ]),
      topics,
    );
  }

  if (topicGroup === "goals") {
    return withTopic(
      pickOne([
        "I’d love help turning this into weekly goals I can actually follow.",
        "can we set 2-3 clear goals for this month?",
        "a simple roadmap would help me stay consistent.",
      ]),
      topics,
    );
  }

  if (topicGroup === "opportunities") {
    return withTopic(
      pickOne([
        "I’m applying this week and could use help prioritizing roles.",
        "could we review my application strategy before I submit more?",
        "I’m unsure which opportunities to focus on first — can you help me choose?",
      ]),
      topics,
    );
  }

  if (topicGroup === "checkins") {
    return withTopic(
      pickOne([
        "a weekly check-in would help me stay accountable.",
        "can we keep one regular session slot each week?",
        "structured check-ins would really help my progress.",
      ]),
      topics,
    );
  }

  if (topicGroup === "concern") {
    return withTopic(
      pickOne([
        "I’m feeling a bit stuck, so I’d appreciate a simple next-step plan.",
        "I’m finding this hard right now; can we break it down together?",
        "I could use help prioritizing what to do first.",
      ]),
      topics,
    );
  }

  return withTopic(
    pickOne([
      "that makes sense — I can start on it and share an update soon.",
      "got it, I’ll work on this and report back.",
      "sounds good, I’m ready to take the next step.",
    ]),
    topics,
  );
}

function getNameForPersona(persona, threadId, fallbackName) {
  if (persona === "mentor-direct") return fallbackName || "Mentor";
  if (persona === "mentee-direct") return fallbackName || "Your Mentee";

  if (persona === "mentee-peer") {
    if (threadId?.includes("checkins")) return pickOne(["Mentee 1", "Mentee 2", "Mentee 3"]);
    if (threadId?.includes("opportunities")) return pickOne(["Mentee 4", "Mentee 5", "Mentee 6"]);
    if (threadId?.includes("interviews")) return pickOne(["Mentee 6", "Mentee 7", "Mentee 8"]);
    return pickOne(["Mentee 2", "Mentee 4", "Mentee 6"]);
  }

  if (persona === "mentor-peer") {
    if (threadId?.includes("strategy")) return pickOne(["Mentor Ella", "Mentor David", "Mentor Priya"]);
    if (threadId?.includes("resources")) return pickOne(["Mentor Nina", "Mentor Amir", "Mentor Zoe"]);
    if (threadId?.includes("cases")) return pickOne(["Mentor Leo", "Mentor Zara", "Mentor Ian"]);
    return pickOne(["Mentor Ella", "Mentor Nina", "Mentor Leo"]);
  }

  return fallbackName || "Community";
}

export function buildSmartReply({
  message,
  persona,
  threadId,
  recentMessages,
  myName,
  fallbackName,
}) {
  const intent = detectIntent(message);
  const topics = extractTopics(message);
  const topicGroup = detectTopicGroup(message, threadId);
  const recentTexts = getRecentReplyTexts(recentMessages, myName);

  const buildBody = () => {
    if (persona === "mentor-direct") {
      return buildMentorDirectReply({ topicGroup, topics });
    }
    if (persona === "mentee-peer") {
      return buildMenteePeerReply({ topicGroup, topics });
    }
    if (persona === "mentor-peer") {
      return buildMentorPeerReply({ topicGroup, topics });
    }
    return buildMenteeDirectReply({ topicGroup, topics });
  };

  const openingOptions = getOpeningOptions(intent);
  const bodyOptions = unique(Array.from({ length: 14 }, () => buildBody()));
  const anchorOptions = buildAnchorOptions({ intent, topicGroup, topics, persona });
  const candidates = unique(
    openingOptions.flatMap((opening) =>
      bodyOptions.flatMap((body) =>
        anchorOptions.map((anchor) => `${opening} ${body} ${anchor}`.trim()),
      ),
    ),
  );
  const selected = pickNonRepeating(candidates, recentTexts);
  const text = forceDifferentText(selected, recentTexts);

  return {
    name: getNameForPersona(persona, threadId, fallbackName),
    text,
  };
}
