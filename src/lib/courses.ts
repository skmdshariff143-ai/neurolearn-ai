import { guestStorage } from "@/lib/preview";
import { z } from "zod";
import { languageSchema, lessonSchema, grade, type Question } from "./domain";
import { diagnosticSchema, roadmapSchema } from "./learning-schemas";

export const cycleSchema = z.object({
  state: z.enum([
    "ASSESS",
    "DIAGNOSE",
    "PLAN",
    "TEACH",
    "PRACTICE",
    "EVALUATE",
    "ADAPT",
    "COMPLETE",
    "REVIEW",
  ]),
  retries: z.number().int().min(0).max(2),
});
export type Cycle = z.infer<typeof cycleSchema>;
const edges: Record<Cycle["state"], Cycle["state"][]> = {
  ASSESS: ["DIAGNOSE"],
  DIAGNOSE: ["PLAN"],
  PLAN: ["TEACH"],
  TEACH: ["PRACTICE"],
  PRACTICE: ["EVALUATE"],
  EVALUATE: ["ADAPT"],
  ADAPT: ["TEACH", "COMPLETE", "REVIEW"],
  COMPLETE: [],
  REVIEW: [],
};
export function advance(input: Cycle, next: Cycle["state"]): Cycle {
  const current = cycleSchema.parse(input);
  if (!edges[current.state].includes(next))
    throw new Error("Invalid learning transition");
  if (current.state === "ADAPT" && next === "TEACH" && current.retries >= 2)
    throw new Error(
      "Two reteaching rounds reached. Review prerequisites with a teacher.",
    );
  return {
    state: next,
    retries:
      current.retries + Number(current.state === "ADAPT" && next === "TEACH"),
  };
}
const attemptSchema = z.object({
  id: z.uuid(),
  kind: z.enum(["diagnostic", "practice"]),
  answers: z.array(z.number().int().min(0).max(3)).length(2),
  score: z.number().min(0).max(100),
  weak: z.array(z.string()),
  at: z.iso.datetime(),
});
export const courseLessonSchema = z.object({
  id: z.uuid(),
  topic: z.string().min(2).max(200),
  activity: z.string().max(500),
  revision: z.boolean(),
  cycle: cycleSchema,
  lesson: lessonSchema.nullable(),
  lessonMode: z.enum(["fixture", "live"]).nullable().default(null),
  diagnostic: diagnosticSchema.nullable(),
  practice: diagnosticSchema.nullable(),
  attempts: z.array(attemptSchema).max(4),
});
export const courseSchema = z
  .object({
    id: z.uuid(),
    title: z.string().max(200),
    goal: z.string().min(2).max(300),
    language: languageSchema,
    level: z.enum(["Beginner", "Intermediate", "Advanced"]),
    minutes: z.number().int().min(5).max(120),
    provenance: z.enum(["curated-demo", "ai-generated"]),
    prerequisites: z.array(z.string().max(200)).max(8),
    modules: z
      .array(
        z.object({
          id: z.uuid(),
          title: z.string().max(200),
          lessons: z.array(courseLessonSchema).min(1).max(5),
        }),
      )
      .min(1)
      .max(30),
    activeLessonId: z.uuid(),
    createdAt: z.iso.datetime(),
  })
  .superRefine((c, ctx) => {
    const lessons = c.modules.flatMap((m) => m.lessons);
    if (
      new Set(lessons.map((l) => l.id)).size !== lessons.length ||
      !lessons.some((l) => l.id === c.activeLessonId)
    )
      ctx.addIssue({
        code: "custom",
        message: "Invalid course lesson identifiers",
      });
    for (const l of lessons) {
      let expected: Cycle = { state: "ASSESS", retries: 0 };
      for (const a of l.attempts) {
        const quiz = a.kind === "diagnostic" ? l.diagnostic : l.practice;
        const evaluated = quiz ? grade(quiz.questions, a.answers) : null;
        if (
          !evaluated ||
          evaluated.score !== a.score ||
          JSON.stringify(evaluated.diagnoses.map((d) => d.concept)) !==
            JSON.stringify(a.weak)
        )
          ctx.addIssue({
            code: "custom",
            message: "Attempt score does not match recorded answers",
          });
        if (a.kind === "diagnostic" && expected.state === "ASSESS")
          expected = { state: "TEACH", retries: 0 };
        else if (a.kind === "practice" && expected.state === "TEACH")
          expected =
            a.score === 100
              ? { ...expected, state: "COMPLETE" }
              : expected.retries < 2
                ? { state: "TEACH", retries: expected.retries + 1 }
                : { ...expected, state: "REVIEW" };
        else
          ctx.addIssue({ code: "custom", message: "Invalid attempt sequence" });
      }
      if (
        l.cycle.retries !== expected.retries ||
        !(
          l.cycle.state === expected.state ||
          (expected.state === "TEACH" &&
            l.cycle.state === "PRACTICE" &&
            l.lesson)
        )
      )
        ctx.addIssue({
          code: "custom",
          message: "Workflow state does not match recorded attempts",
        });
      if (
        l.cycle.state === "COMPLETE" &&
        !l.attempts.some((a) => a.kind === "practice" && a.score === 100)
      )
        ctx.addIssue({
          code: "custom",
          message: "Completion requires a recorded successful assessment",
        });
    }
  });
export type Course = z.infer<typeof courseSchema>;
export type CourseLesson = z.infer<typeof courseLessonSchema>;
export function outlineToCourse(
  plan: unknown,
  preferences: Pick<
    Course,
    "goal" | "language" | "level" | "minutes" | "provenance"
  >,
): Course {
  const outline = roadmapSchema.parse(plan);
  if (outline.units.some((u, i) => u.day !== i + 1))
    throw new Error("Invalid lesson dependency order");
  const lessons = outline.units.map((u) => ({
    id: crypto.randomUUID(),
    topic: u.topic,
    activity: u.activity,
    revision: u.revision,
    cycle: { state: "ASSESS" as const, retries: 0 },
    lesson: null,
    diagnostic: null,
    practice: null,
    attempts: [],
  }));
  return courseSchema.parse({
    id: crypto.randomUUID(),
    title: outline.title,
    ...preferences,
    prerequisites: outline.prerequisites,
    modules: lessons.map((l, i) => ({
      id: crypto.randomUUID(),
      title: `Module ${i + 1}`,
      lessons: [l],
    })),
    activeLessonId: lessons[0].id,
    createdAt: new Date().toISOString(),
  });
}
export function recordCourseAttempt(
  lesson: CourseLesson,
  kind: "diagnostic" | "practice",
  answers: number[],
): CourseLesson {
  if (lesson.cycle.state !== (kind === "diagnostic" ? "ASSESS" : "PRACTICE"))
    throw new Error("Assessment unavailable at this learning stage");
  const quiz = kind === "diagnostic" ? lesson.diagnostic : lesson.practice;
  if (!quiz) throw new Error("Load questions first");
  const result = grade(quiz.questions as Question[], answers);
  let cycle = lesson.cycle;
  if (kind === "diagnostic") {
    cycle = advance(advance(advance(cycle, "DIAGNOSE"), "PLAN"), "TEACH");
  } else {
    cycle = advance(advance(cycle, "EVALUATE"), "ADAPT");
    cycle = advance(
      cycle,
      result.score === 100
        ? "COMPLETE"
        : cycle.retries < 2
          ? "TEACH"
          : "REVIEW",
    );
  }
  return {
    ...lesson,
    cycle,
    attempts: [
      ...lesson.attempts,
      {
        id: crypto.randomUUID(),
        kind,
        answers,
        score: result.score,
        weak: result.diagnoses.map((d) => d.concept),
        at: new Date().toISOString(),
      },
    ],
  };
}
export const courseRepository = {
  load(): Course[] {
    try {
      return z
        .array(courseSchema)
        .max(10)
        .parse(JSON.parse(guestStorage.getItem("nl-courses") ?? "[]"));
    } catch {
      return [];
    }
  },
  save(course: Course) {
    const valid = courseSchema.parse(course);
    const all = this.load();
    if (!all.some((c) => c.id === valid.id) && all.length >= 10)
      throw new Error(
        "Ten course limit reached. Export and clear old courses in Settings.",
      );
    guestStorage.setItem(
      "nl-courses",
      JSON.stringify([...all.filter((c) => c.id !== valid.id), valid]),
    );
  },
};
