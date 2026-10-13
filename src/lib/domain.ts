import { z } from "zod";
export const languageSchema = z.enum(["English", "Telugu", "Hindi"]);
export const strategySchema = z.enum([
  "lesson",
  "simple",
  "example",
  "steps",
  "diagram",
  "analogy",
  "application",
  "worked",
  "test",
]);
export const requestSchema = z.object({
  topic: z.string().trim().min(2).max(200),
  language: languageSchema.default("English"),
  strategy: strategySchema.default("lesson"),
  message: z.string().max(2000).default(""),
  context: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(1000),
      }),
    )
    .max(4)
    .default([]),
  research: z.boolean().default(false),
  passages: z
    .array(
      z.object({
        resourceId: z.uuid(),
        title: z.string().max(150),
        page: z.number().int().min(1).max(20),
        text: z.string().max(1200),
      }),
    )
    .max(3)
    .optional(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
});
export type TutorRequest = z.infer<typeof requestSchema>;
export const citationSchema = z.object({
  title: z.string().max(200),
  url: z.url().refine((u) => {
    const url = new URL(u);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    );
  }),
  excerpt: z.string().max(1200),
});
export const lessonSchema = z.object({
  title: z.string().max(200),
  explanation: z.string().min(10).max(14000),
  check: z.string().max(1000),
  concepts: z.array(z.string().max(100)).max(12),
});
export type Lesson = z.infer<typeof lessonSchema>;
export type Citation = z.infer<typeof citationSchema>;
export const profileSchema = z.object({
  language: languageSchema,
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  goal: z.string().max(300),
  minutes: z.number().int().min(5).max(120),
  style: strategySchema,
  reducedMotion: z.boolean(),
});
export type Profile = z.infer<typeof profileSchema>;
export type State =
  | "INITIAL"
  | "DIAGNOSTIC"
  | "ANALYSIS"
  | "LESSON"
  | "PRACTICE"
  | "EVALUATION"
  | "MASTERED"
  | "RETEACH";
const transitions: Record<State, State[]> = {
  INITIAL: ["DIAGNOSTIC", "LESSON"],
  DIAGNOSTIC: ["ANALYSIS"],
  ANALYSIS: ["LESSON"],
  LESSON: ["PRACTICE"],
  PRACTICE: ["EVALUATION"],
  EVALUATION: ["MASTERED", "RETEACH"],
  MASTERED: ["PRACTICE"],
  RETEACH: ["LESSON"],
};
export function transition(from: State, to: State): State {
  if (!transitions[from].includes(to))
    throw new Error(`Invalid transition: ${from} → ${to}`);
  return to;
}
export type Question = {
  id: string;
  concept: string;
  prompt: string;
  options: string[];
  correct: number;
  reason: string;
};
export type Diagnosis = {
  concept: string;
  classification: "possible conceptual misunderstanding";
  evidence: string;
  recommendation: string;
  certainty: "tentative";
};
export function grade(questions: Question[], answers: number[]) {
  if (
    questions.length === 0 ||
    answers.length !== questions.length ||
    questions.some(
      (_, i) =>
        !Number.isInteger(answers[i]) ||
        answers[i] < 0 ||
        answers[i] >= questions[i].options.length,
    )
  )
    throw new Error("Answer every question");
  const correct = questions.filter((q, i) => q.correct === answers[i]).length;
  const diagnoses: Diagnosis[] = questions
    .filter((q, i) => q.correct !== answers[i])
    .map((q) => ({
      concept: q.concept,
      classification: "possible conceptual misunderstanding",
      evidence: q.prompt,
      recommendation: q.reason,
      certainty: "tentative",
    }));
  return {
    correct,
    total: questions.length,
    score: Math.round((correct / questions.length) * 100),
    diagnoses,
  };
}
export const activitySchema = z.object({
  id: z.string(),
  topic: z.string(),
  kind: z.enum(["diagnostic", "practice"]),
  score: z.number().min(0).max(100),
  weak: z.array(z.string()),
  at: z.string(),
  iterations: z.number().int().min(0),
});
export type Activity = z.infer<typeof activitySchema>;
