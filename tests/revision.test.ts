import { describe, it, expect } from "vitest";
import {
  revisionQueue,
  reteachingStrategy,
  recallPrompt,
} from "../src/lib/revision";
import type { Activity } from "../src/lib/domain";
import {
  outlineToCourse,
  recordCourseAttempt,
  advance,
} from "../src/lib/courses";
import { questions } from "../src/lib/content";
const now = Date.parse("2026-10-14T12:00:00Z");
const activity = (id: string, at: string, weak: string[] = []): Activity => ({
  id,
  at,
  weak,
  topic: "Electrical transformers",
  kind: "practice",
  score: weak.length ? 50 : 100,
  iterations: 0,
});
describe("evidence-based review", () => {
  it("does not confuse a midnight boundary with spaced retrieval", () => {
    const a = [
      activity("1", "2026-10-10T23:59:00Z"),
      activity("2", "2026-10-11T00:01:00Z"),
    ];
    expect(
      revisionQueue(a, [], now).every((r) => r.consecutiveChecks === 1),
    ).toBe(true);
  });
  it.each([
    {
      topic: "Quadratic equations",
      concept: "roots",
      pre: "What does a root satisfy?",
      post: "Is 2 a root of x²−4?",
      choices: ["The equation equals zero", "The slope is always zero"],
    },
    {
      topic: "Python conditions",
      concept: "branching",
      pre: "When does an if body run?",
      post: "For if 3 > 2, does its body run?",
      choices: [
        "When the condition is true",
        "Every time regardless of the condition",
      ],
    },
    {
      topic: "Changing magnetic flux",
      concept: "induction",
      pre: "What induces voltage in a coil?",
      post: "Does settled steady DC continuously induce secondary voltage?",
      choices: ["Changing flux is needed", "Unchanging flux is sufficient"],
    },
    {
      topic: "Professional negotiation",
      concept: "clarifying-interests",
      pre: "When priorities are unclear, what information helps?",
      post: "Before proposing tradeoffs, how can you clarify priorities?",
      choices: [
        "Ask and confirm the other person's interests",
        "Assume both parties have identical priorities",
      ],
    },
  ])(
    "replays an evidence-based diagnose/reteach/retest cycle for $topic",
    ({ topic, concept, pre, post, choices }) => {
      const c = outlineToCourse(
        {
          title: topic,
          prerequisites: ["Explain your reasoning"],
          objectives: [{ conceptId: concept, description: pre }],
          units: [1, 2, 3].map((day) => ({
            day,
            topic,
            activity: "Apply and explain",
            revision: day === 3,
          })),
        },
        {
          goal: "Understand and apply",
          language: "English",
          level: "Beginner",
          minutes: 20,
          provenance: "ai-generated",
        },
      );
      const quiz = (after: boolean) => ({
        title: "Synthetic software test",
        objectives: [{ conceptId: concept, description: pre }],
        questions: [0, 1].map((i) => ({
          id: `${after ? "post" : "pre"}-${i}`,
          concept,
          prompt: after ? post : pre,
          options: choices,
          correct: 0,
          reason: "Use the stated criterion and explain the reasoning.",
        })),
      });
      let lesson = recordCourseAttempt(
        {
          ...c.modules[0].lessons[0],
          diagnostic: quiz(false),
          practice: quiz(true),
        },
        "diagnostic",
        [1, 1],
      );
      expect(lesson.attempts[0].weak).toContain(concept);
      lesson = recordCourseAttempt(
        { ...lesson, cycle: advance(lesson.cycle, "PRACTICE") },
        "practice",
        [1, 1],
      );
      expect(reteachingStrategy(lesson.cycle.retries)).toBe("simple");
      lesson = recordCourseAttempt(
        { ...lesson, cycle: advance(lesson.cycle, "PRACTICE") },
        "practice",
        [0, 0],
      );
      expect(lesson.cycle.state).toBe("COMPLETE");
      expect(lesson.attempts.map((a) => a.score)).toEqual([0, 0, 100]);
    },
  );
  it("does not invent progress or accept future/invalid evidence", () => {
    expect(revisionQueue([], [], now)).toEqual([]);
    expect(
      revisionQueue(
        [activity("x", "bad"), activity("y", "2027-01-01T00:00:00Z")],
        [],
        now,
      ),
    ).toEqual([]);
  });
  it("prioritizes a weak concept for next-day recall without assigning mastery", () => {
    const reviews = revisionQueue(
      [activity("x", "2026-10-12T12:00:00Z", ["changing-flux"])],
      [],
      now,
    );
    expect(reviews[0]).toMatchObject({
      concept: "changing-flux",
      due: true,
      consecutiveChecks: 0,
      dueAt: "2026-10-13T12:00:00.000Z",
    });
    expect(reviews[1].due).toBe(false);
  });
  it("deduplicates evidence and does not count same-day repeats as spaced success", () => {
    const a = activity("x", "2026-10-10T12:00:00Z");
    const q = revisionQueue(
      [a, a, activity("y", "2026-10-10T13:00:00Z")],
      [],
      now,
    );
    expect(
      q.every((r) => r.consecutiveChecks === 1 && r.evidenceCount === 2),
    ).toBe(true);
  });
  it("extends suggested intervals after distinct-day successes and resets on mistakes", () => {
    const a = [
      activity("1", "2026-10-01T12:00:00Z"),
      activity("2", "2026-10-05T12:00:00Z"),
    ];
    expect(revisionQueue(a, [], now)[0].dueAt).toBe("2026-10-12T12:00:00.000Z");
    a.push(activity("3", "2026-10-13T12:00:00Z", ["changing-flux"]));
    expect(revisionQueue(a, [], now)[0]).toMatchObject({
      concept: "changing-flux",
      consecutiveChecks: 0,
      due: true,
    });
  });
  it.each([
    "Quadratic equations",
    "Python loops",
    "Science of light",
    "Professional negotiation",
  ])(
    "supports original recall prompts for %s without inventing correct concept evidence",
    (topic) => {
      const a = {
        ...activity("x", "2026-10-12T12:00:00Z"),
        topic,
        weak: ["core-reasoning"],
      };
      expect(recallPrompt(topic, "core-reasoning")).toContain(
        "Without looking",
      );
      const reviews = revisionQueue([a], [], now);
      if (!/Quadratic|Python/.test(topic))
        expect(reviews.map((r) => r.concept)).toEqual(["core-reasoning"]);
    },
  );
  it("uses recorded generated-course concepts rather than a curated fallback", () => {
    const c = outlineToCourse(
      {
        title: "Negotiation",
        prerequisites: [],
        objectives: [{ conceptId: "listening", description: "Listen" }],
        units: [1, 2, 3].map((day) => ({
          day,
          topic: "Negotiation skills",
          activity: "Practice",
          revision: false,
        })),
      },
      {
        goal: "Resolve disputes",
        language: "English",
        level: "Beginner",
        minutes: 20,
        provenance: "ai-generated",
      },
    );
    const quiz = {
      title: "Check",
      objectives: [{ conceptId: "listening", description: "Listen" }],
      questions: questions("python").map((q) => ({
        ...q,
        concept: q.id === "p1" ? "listening" : "tradeoffs",
      })),
    };
    const l = recordCourseAttempt(
      { ...c.modules[0].lessons[0], diagnostic: quiz },
      "diagnostic",
      quiz.questions.map((q) => q.correct),
    );
    c.modules[0].lessons = [
      {
        ...l,
        attempts: l.attempts.map((a) => ({ ...a, at: "2026-10-12T12:00:00Z" })),
      },
    ];
    expect(
      revisionQueue([], [c], now)
        .map((r) => r.concept)
        .sort(),
    ).toEqual([...new Set(quiz.questions.map((q) => q.concept))].sort());
  });
  it("changes teaching strategy before bounded reteaching ends", () => {
    expect([0, 1, 2].map((n) => reteachingStrategy(n))).toEqual([
      "steps",
      "simple",
      "worked",
    ]);
    expect(reteachingStrategy(2, true)).toBe("simple");
    expect(() => advance({ state: "ADAPT", retries: 2 }, "TEACH")).toThrow();
  });
});
