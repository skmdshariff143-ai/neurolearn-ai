import { describe, it, expect } from "vitest";
import { grade, transition, requestSchema } from "../src/lib/domain";
import { fixture, questions } from "../src/lib/content";
import { allowRequest } from "../src/lib/rate-limit";
describe("adaptive learning", () => {
  it("distinguishes pre and post checks while preserving concepts", () => {
    for (const topic of ["transformers", "python", "quadratics"]) {
      const pre = questions(topic),
        post = questions(topic, true);
      expect(pre.map((q) => q.id)).not.toEqual(post.map((q) => q.id));
      expect(pre.map((q) => q.concept)).toEqual(post.map((q) => q.concept));
    }
  });
  it("grades deterministically and records tentative gaps", () => {
    const result = grade(questions("transformers"), [0, 2]);
    expect(result.score).toBe(50);
    expect(result.diagnoses[0].concept).toBe("changing-flux");
    expect(result.diagnoses[0].certainty).toBe("tentative");
    expect(grade(questions("transformers"), [1, 2]).score).toBe(100);
  });
  it("rejects missing or out-of-range answers", () => {
    expect(() => grade(questions("python"), [1])).toThrow();
    expect(() => grade(questions("python"), [8, 1])).toThrow();
  });
  it("rejects jumping from initial directly to mastery", () => {
    expect(() => transition("INITIAL", "MASTERED")).toThrow();
    expect(transition("EVALUATION", "RETEACH")).toBe("RETEACH");
    expect(transition("RETEACH", "LESSON")).toBe("LESSON");
  });
  it("validates input boundaries", () => {
    expect(requestSchema.safeParse({ topic: "x" }).success).toBe(false);
    expect(
      requestSchema.safeParse({ topic: "Python", language: "French" }).success,
    ).toBe(false);
    expect(
      requestSchema.safeParse({ topic: "Python", message: "x".repeat(2001) })
        .success,
    ).toBe(false);
  });
  it("changes fixture teaching strategies", () => {
    const base = requestSchema.parse({ topic: "transformers" });
    expect(fixture({ ...base, strategy: "steps" }).explanation).toContain(
      "1. Apply AC",
    );
    expect(fixture({ ...base, strategy: "worked" }).explanation).toContain(
      "20 V",
    );
    expect(fixture({ ...base, strategy: "analogy" }).explanation).toContain(
      "analogy",
    );
  });
  it("contains actual Telugu and Hindi for every path", () => {
    for (const topic of ["transformers", "python", "quadratics"]) {
      const r = requestSchema.parse({ topic });
      expect(fixture({ ...r, language: "Telugu" }).explanation).toMatch(
        /[\u0C00-\u0C7F]/,
      );
      expect(fixture({ ...r, language: "Hindi" }).explanation).toMatch(
        /[\u0900-\u097F]/,
      );
    }
  });
  it("does not fabricate unfamiliar topic content", () => {
    expect(
      fixture(requestSchema.parse({ topic: "Particle astrophysics" }))
        .explanation,
    ).toContain("no answer has been generated");
  });
  it("bounds request volume and resets window", () => {
    const key = "test";
    for (let i = 0; i < 12; i++) expect(allowRequest(key, 100)).toBe(true);
    expect(allowRequest(key, 100)).toBe(false);
    expect(allowRequest(key, 60101)).toBe(true);
  });
});
