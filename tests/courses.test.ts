import { describe, it, expect } from "vitest";
import {
  advance,
  outlineToCourse,
  recordCourseAttempt,
  courseSchema,
  type CourseLesson,
} from "../src/lib/courses";
import { questions } from "../src/lib/content";
const preferences = {
  goal: "Understand transformers",
  language: "English" as const,
  level: "Beginner" as const,
  minutes: 20,
  provenance: "curated-demo" as const,
};
function course() {
  return outlineToCourse(
    {
      title: "Transformers",
      prerequisites: [],
      objectives: [{ conceptId: "flux", description: "Understand flux" }],
      units: [1, 2, 3].map((day) => ({
        day,
        topic: "transformers",
        activity: "Practice and explain",
        revision: false,
      })),
    },
    preferences,
  );
}
function quiz(post = false) {
  return {
    title: "Check",
    objectives: [{ conceptId: "flux", description: "Understand flux" }],
    questions: questions("transformers", post),
  };
}
describe("resumable bounded courses", () => {
  it("rejects invalid transitions and limits reteaching", () => {
    expect(() =>
      advance({ state: "ASSESS", retries: 0 }, "COMPLETE"),
    ).toThrow();
    expect(() => advance({ state: "ADAPT", retries: 2 }, "TEACH")).toThrow(
      /Two reteaching/,
    );
  });
  it("records diagnostic and post answers and permits completion only from real attempts", () => {
    const c = course();
    let l: CourseLesson = {
      ...c.modules[0].lessons[0],
      diagnostic: quiz(),
      practice: quiz(true),
    };
    l = recordCourseAttempt(l, "diagnostic", [0, 2]);
    expect(l.cycle.state).toBe("TEACH");
    expect(l.attempts[0].weak).toContain("changing-flux");
    l = { ...l, cycle: advance(l.cycle, "PRACTICE") };
    l = recordCourseAttempt(l, "practice", [1, 0]);
    expect(l.cycle.state).toBe("COMPLETE");
    expect(() =>
      courseSchema.parse({
        ...c,
        modules: [{ ...c.modules[0], lessons: [{ ...l, attempts: [] }] }],
      }),
    ).toThrow();
  });
  it("stops after three failed practice assessments without discarding prior attempts", () => {
    let l: CourseLesson = {
      ...course().modules[0].lessons[0],
      diagnostic: quiz(),
      practice: quiz(true),
    };
    l = recordCourseAttempt(l, "diagnostic", [0, 2]);
    for (let i = 0; i < 3; i++) {
      l = { ...l, cycle: advance(l.cycle, "PRACTICE") };
      l = recordCourseAttempt(l, "practice", [0, 1]);
    }
    expect(l.cycle.state).toBe("REVIEW");
    expect(l.attempts).toHaveLength(4);
    expect(() => recordCourseAttempt(l, "practice", [0, 1])).toThrow();
  });
  it("rejects out-of-order dependency sequences and altered scores", () => {
    const c = course();
    const l = recordCourseAttempt(
      { ...c.modules[0].lessons[0], diagnostic: quiz() },
      "diagnostic",
      [0, 2],
    );
    expect(() =>
      courseSchema.parse({
        ...c,
        modules: [
          {
            ...c.modules[0],
            lessons: [
              { ...l, attempts: l.attempts.map((a) => ({ ...a, score: 100 })) },
            ],
          },
        ],
      }),
    ).toThrow();
    expect(() =>
      outlineToCourse(
        {
          title: "X",
          prerequisites: [],
          objectives: [{ conceptId: "x", description: "X" }],
          units: [3, 2, 1].map((day) => ({
            day,
            topic: "Python",
            activity: "Read",
            revision: false,
          })),
        },
        preferences,
      ),
    ).toThrow(/dependency/);
  });
});
