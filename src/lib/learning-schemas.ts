import { z } from "zod";
import { languageSchema } from "./domain";
export const objectiveSchema = z.object({
  conceptId: z.string().max(100),
  description: z.string().max(400),
});
export const rubricSchema = z.object({
  conceptId: z.string().max(100),
  criterion: z.string().min(5).max(500),
  points: z.number().int().min(1).max(5),
});
export const generatedQuestionSchema = z
  .object({
    id: z.string().max(100),
    concept: z.string().max(100),
    prompt: z.string().max(1000),
    options: z.array(z.string().max(300)).min(2).max(4),
    correct: z.number().int().min(0),
    reason: z.string().max(1000),
  })
  .refine(
    (q) => q.correct < q.options.length,
    "Correct answer must reference an option",
  );
export const diagnosticSchema = z.object({
  title: z.string().max(200),
  objectives: z.array(objectiveSchema).min(1).max(6),
  questions: z.array(generatedQuestionSchema).length(2),
});
export const roadmapSchema = z.object({
  title: z.string().max(200),
  prerequisites: z.array(z.string().max(200)).max(8),
  objectives: z.array(objectiveSchema).min(1).max(8),
  units: z
    .array(
      z.object({
        day: z.number().int().min(1).max(30),
        topic: z.string().max(200),
        activity: z.string().max(500),
        revision: z.boolean(),
      }),
    )
    .min(3)
    .max(30),
});
export const writtenEvaluationSchema = z
  .object({
    criteria: z
      .array(
        z.object({
          conceptId: z.string().max(100),
          earned: z.number().int().min(0).max(5),
          possible: z.number().int().min(1).max(5),
          reason: z.string().max(500),
        }),
      )
      .min(1)
      .max(5),
    misconceptions: z
      .array(
        z.object({
          conceptId: z.string().max(100),
          classification: z.enum([
            "conceptual misunderstanding",
            "missing prerequisite",
            "calculation error",
            "incorrect assumption",
            "related-concept confusion",
            "unclear reasoning",
          ]),
          evidence: z.string().max(500),
          confidence: z.enum(["low", "medium"]),
          recommendation: z.string().max(500),
        }),
      )
      .max(5),
    feedback: z.string().max(1500),
  })
  .refine(
    (r) => r.criteria.every((c) => c.earned <= c.possible),
    "Earned points cannot exceed possible points",
  );
export const workflowRequestSchema = z.discriminatedUnion("task", [
  z.object({
    task: z.literal("diagnostic"),
    topic: z.string().min(2).max(200),
    language: languageSchema,
    post: z.boolean().default(false),
  }),
  z.object({
    task: z.literal("roadmap"),
    topic: z.string().min(2).max(200),
    language: languageSchema,
    days: z.number().int().min(3).max(30),
    goal: z.string().min(2).max(300).optional(),
    level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    minutes: z.number().int().min(5).max(120).optional(),
  }),
  z.object({
    task: z.literal("evaluate"),
    topic: z.string().min(2).max(200),
    language: languageSchema,
    question: z.string().min(5).max(1000),
    answer: z.string().min(1).max(2000),
    rubric: z.array(rubricSchema).min(1).max(5),
  }),
]);
export type WorkflowRequest = z.infer<typeof workflowRequestSchema>;
