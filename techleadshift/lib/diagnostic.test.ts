import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DIAGNOSTIC_QUESTIONS,
  diagnosticTags,
  diagnosticText,
  inquirySubject,
  isQualified,
  parseDiagnostic,
  unmetRules,
  type DiagnosticAnswers,
} from "./diagnostic";

const qualified: DiagnosticAnswers = {
  interest: "review",
  role: "director",
  teamSize: "50-199",
  timeline: "90days",
  approval: "shared",
};

describe("parseDiagnostic", () => {
  it("accepts every listed value for every question", () => {
    for (const q of DIAGNOSTIC_QUESTIONS) {
      for (const o of q.options) {
        const r = parseDiagnostic({ ...qualified, [q.id]: o.value });
        assert.equal(r.ok, true, `${q.id}=${o.value}`);
      }
    }
  });

  it("missing or blank answers are 'missing', naming the first one", () => {
    assert.deepEqual(parseDiagnostic({}), { ok: false, reason: "missing", field: "interest" });
    assert.deepEqual(parseDiagnostic({ ...qualified, timeline: "" }), { ok: false, reason: "missing", field: "timeline" });
    assert.deepEqual(parseDiagnostic({ ...qualified, approval: null }), { ok: false, reason: "missing", field: "approval" });
  });

  it("rejects anything not exactly on the list", () => {
    for (const bad of ["Review", " review", "review ", "consulting", 1, true, ["review"], { v: "review" }]) {
      assert.deepEqual(parseDiagnostic({ ...qualified, interest: bad }), { ok: false, reason: "invalid", field: "interest" }, JSON.stringify(bad));
    }
    assert.deepEqual(parseDiagnostic({ ...qualified, teamSize: "1000" }), { ok: false, reason: "invalid", field: "teamSize" });
  });

  it("drops extra keys from the answers", () => {
    const r = parseDiagnostic({ ...qualified, name: "x", extra: "y" });
    assert.ok(r.ok);
    assert.deepEqual(r.answers, qualified);
  });
});

describe("isQualified", () => {
  it("qualifies a review lead who leads 10+, starts within 90 days and can get it signed", () => {
    assert.equal(isQualified(qualified), true);
    assert.deepEqual(unmetRules(qualified), []);
  });

  it("every single answer outside the rule disqualifies on its own", () => {
    const misses: Array<[keyof DiagnosticAnswers, string]> = [
      ["interest", "speaking"], ["interest", "advisory"], ["interest", "other"],
      ["role", "individual"], ["role", "other"],
      ["teamSize", "none"], ["teamSize", "1-9"],
      ["timeline", "later"], ["timeline", "exploring"],
      ["approval", "unsure"],
    ];
    for (const [id, value] of misses) {
      const a = { ...qualified, [id]: value } as DiagnosticAnswers;
      assert.equal(isQualified(a), false, `${id}=${value}`);
      assert.deepEqual(unmetRules(a), [id]);
    }
  });

  it("counts every qualifying combination: 1 x 3 x 3 x 2 x 2 = 36", () => {
    let n = 0;
    const walk = (i: number, acc: Record<string, string>) => {
      if (i === DIAGNOSTIC_QUESTIONS.length) { if (isQualified(acc as DiagnosticAnswers)) n++; return; }
      for (const o of DIAGNOSTIC_QUESTIONS[i].options) walk(i + 1, { ...acc, [DIAGNOSTIC_QUESTIONS[i].id]: o.value });
    };
    walk(0, {});
    assert.equal(n, 36);
  });
});

describe("notification email", () => {
  it("subject carries [Qualified] only for a qualified lead, and the kind of inquiry", () => {
    assert.equal(inquirySubject(qualified, "Dana"), "[Qualified] Diagnostic Inquiry from Dana");
    assert.equal(inquirySubject({ ...qualified, timeline: "later" }, "Dana"), "Diagnostic Inquiry from Dana");
    assert.equal(inquirySubject({ ...qualified, interest: "speaking" }, "Dana"), "Speaking Inquiry from Dana");
    assert.equal(inquirySubject({ ...qualified, interest: "advisory" }, "Dana"), "Advisory Inquiry from Dana");
    assert.equal(inquirySubject({ ...qualified, interest: "other" }, "Dana"), "Inquiry from Dana");
  });

  it("body block reads as the visitor answered, then the verdict", () => {
    assert.equal(
      diagnosticText(qualified),
      [
        "What are you looking for? An AI Operating Model Review",
        "Your role Director or head of a function",
        "How many people do you lead? 50 to 199",
        "When do you want to start? In the next 90 days",
        "Who signs off on work like this? I recommend it, someone else signs",
        "Qualified: yes",
      ].join("\n")
    );
    assert.match(
      diagnosticText({ ...qualified, interest: "speaking", approval: "unsure" }),
      /\nQualified: no \(outside the rule on: interest, approval\)$/
    );
  });

  it("Resend tags use only letters, numbers, underscores and dashes", () => {
    assert.deepEqual(diagnosticTags(qualified), [
      { name: "form", value: "work" },
      { name: "interest", value: "review" },
      { name: "qualified", value: "yes" },
    ]);
    for (const q of DIAGNOSTIC_QUESTIONS[0].options) {
      for (const t of diagnosticTags({ ...qualified, interest: q.value })) {
        assert.match(t.name + t.value, /^[A-Za-z0-9_-]+$/);
      }
    }
  });
});

describe("diagnostic copy", () => {
  it("has no em or en dashes and no empty labels", () => {
    for (const q of DIAGNOSTIC_QUESTIONS) {
      for (const text of [q.label, ...q.options.map((o) => o.label)]) {
        assert.doesNotMatch(text, /[\u2013\u2014]/, text);
        assert.ok(text.trim().length > 0);
      }
    }
  });
});
