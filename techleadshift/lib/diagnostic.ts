// The /work diagnostic: five single-choice questions that tell a qualified
// AI Operating Model Review or Ongoing advisory lead (PORTFOLIO-MAP row 16) from every other
// inquiry. The form renders from DIAGNOSTIC_QUESTIONS and the route validates
// against the same list, so a choice can't exist in one place and not the
// other. Everything here is pure: no fetch, no env, no clock.

export const DIAGNOSTIC_QUESTIONS = [
  {
    id: "interest",
    label: "What are you looking for?",
    options: [
      { value: "review", label: "An AI Operating Model Review" },
      { value: "speaking", label: "A keynote or workshop" },
      { value: "advisory", label: "Ongoing advisory" },
      { value: "other", label: "Something else" },
    ],
  },
  {
    id: "role",
    label: "Your role",
    options: [
      { value: "executive", label: "Executive (VP, CTO, CIO or above)" },
      { value: "director", label: "Director or head of a function" },
      { value: "manager", label: "Manager or team lead" },
      { value: "individual", label: "Individual contributor" },
      { value: "other", label: "Other, or booking for someone else" },
    ],
  },
  {
    id: "teamSize",
    label: "How many people do you lead?",
    options: [
      { value: "none", label: "None right now" },
      { value: "1-9", label: "1 to 9" },
      { value: "10-49", label: "10 to 49" },
      { value: "50-199", label: "50 to 199" },
      { value: "200+", label: "200 or more" },
    ],
  },
  {
    id: "timeline",
    label: "When do you want to start?",
    options: [
      { value: "30days", label: "In the next 30 days" },
      { value: "90days", label: "In the next 90 days" },
      { value: "later", label: "Later than that" },
      { value: "exploring", label: "Just looking for now" },
    ],
  },
  {
    id: "approval",
    label: "Who signs off on work like this?",
    options: [
      { value: "me", label: "I do" },
      { value: "shared", label: "I recommend it, someone else signs" },
      { value: "unsure", label: "Not sure yet" },
    ],
  },
] as const;

type Question = (typeof DIAGNOSTIC_QUESTIONS)[number];
export type QuestionId = Question["id"];
type ValueOf<Q extends Question> = Q["options"][number]["value"];

export type DiagnosticAnswers = {
  [Q in Question as Q["id"]]: ValueOf<Q>;
};

export type DiagnosticParse =
  | { ok: true; answers: DiagnosticAnswers }
  | { ok: false; reason: "missing" | "invalid"; field: QuestionId };

// Missing (absent or blank) and invalid (a value not on the list) are
// separate so the route can say which. Choices are compared exactly: no
// trimming, no case folding, because the form only ever sends list values.
export function parseDiagnostic(body: Record<string, unknown>): DiagnosticParse {
  const answers: Record<string, string> = {};
  for (const q of DIAGNOSTIC_QUESTIONS) {
    const raw = body[q.id];
    if (raw === undefined || raw === null || raw === "") return { ok: false, reason: "missing", field: q.id };
    const allowed: readonly string[] = q.options.map((o) => o.value);
    if (typeof raw !== "string" || !allowed.includes(raw)) return { ok: false, reason: "invalid", field: q.id };
    answers[q.id] = raw;
  }
  return { ok: true, answers: answers as DiagnosticAnswers };
}

// The qualified rule. Every line must hold. Ongoing advisory qualifies
// alongside the review (Chuck, Nov 4 2026).
export const QUALIFIED_RULE = {
  interest: ["review", "advisory"],
  role: ["executive", "director", "manager"],
  teamSize: ["10-49", "50-199", "200+"],
  timeline: ["30days", "90days"],
  approval: ["me", "shared"],
} as const satisfies { [K in QuestionId]: readonly DiagnosticAnswers[K][] };

// The questions whose answer fell outside the rule, in form order. Empty means
// qualified.
export function unmetRules(a: DiagnosticAnswers): QuestionId[] {
  return DIAGNOSTIC_QUESTIONS.map((q) => q.id).filter(
    (id) => !(QUALIFIED_RULE[id] as readonly string[]).includes(a[id])
  );
}

export function isQualified(a: DiagnosticAnswers): boolean {
  return unmetRules(a).length === 0;
}

function labelFor(id: QuestionId, value: string): string {
  const q = DIAGNOSTIC_QUESTIONS.find((x) => x.id === id)!;
  return (q.options as readonly { value: string; label: string }[]).find((o) => o.value === value)!.label;
}

const SUBJECT_KIND: Record<DiagnosticAnswers["interest"], string> = {
  review: "Diagnostic Inquiry",
  speaking: "Speaking Inquiry",
  advisory: "Advisory Inquiry",
  other: "Inquiry",
};

// "[Qualified] Diagnostic Inquiry from Dana" or "[Qualified] Advisory
// Inquiry from Dana". Only a qualified lead carries
// the tag, so a mail search for "[Qualified]" is the row 16 count.
export function inquirySubject(a: DiagnosticAnswers, name: string): string {
  return `${isQualified(a) ? "[Qualified] " : ""}${SUBJECT_KIND[a.interest]} from ${name}`;
}

// The block that goes into the notification email, one answer per line, then
// the verdict and, when not qualified, which answers missed the rule.
export function diagnosticText(a: DiagnosticAnswers): string {
  const lines = DIAGNOSTIC_QUESTIONS.map((q) => `${q.label} ${labelFor(q.id, a[q.id])}`);
  const unmet = unmetRules(a);
  const verdict = unmet.length === 0 ? "Qualified: yes" : `Qualified: no (outside the rule on: ${unmet.join(", ")})`;
  return [...lines, verdict].join("\n");
}

// Resend tags: ASCII letters, numbers, underscores and dashes only.
export function diagnosticTags(a: DiagnosticAnswers): { name: string; value: string }[] {
  return [
    { name: "form", value: "work" },
    { name: "interest", value: a.interest },
    { name: "qualified", value: isQualified(a) ? "yes" : "no" },
  ];
}
