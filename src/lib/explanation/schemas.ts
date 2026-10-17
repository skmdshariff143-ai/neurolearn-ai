import { z } from "zod";
import { lessonSchema, type Lesson } from "../domain";

export const researchedDefinitionSchema = z.object({
  term: z.string().min(1).max(100),
  definition: z.string().min(5).max(500),
});

export const researchedPracticeQuestionSchema = z.object({
  id: z.string().min(1).max(50),
  concept: z.string().min(1).max(100),
  prompt: z.string().min(5).max(1000),
  options: z.array(z.string().min(1).max(300)).min(2).max(4),
  correct: z.number().int().min(0).max(3),
  reason: z.string().min(5).max(1000),
});

export const researchedSourceReferenceSchema = z.object({
  sourceId: z.string().max(80),
  title: z.string().max(250),
  url: z.string().url(),
  publisher: z.string().max(150),
  excerpt: z.string().max(1200),
  license: z.string().max(150),
});

export const researchedLessonSchema = z.object({
  title: z.string().min(2).max(200),
  learningObjectives: z.array(z.string().min(3).max(300)).min(1).max(6),
  prerequisites: z.array(z.string().min(2).max(200)).max(6),
  simpleExplanation: z.string().min(10).max(3000),
  detailedExplanation: z.string().min(20).max(7000),
  analogy: z.string().min(10).max(2000),
  realWorldExample: z.string().min(10).max(2000),
  definitions: z.array(researchedDefinitionSchema).max(8),
  equationsOrTechnicalDetails: z.array(z.string().max(500)).max(6).optional().default([]),
  commonMisconceptions: z.array(z.string().min(5).max(400)).min(1).max(5),
  summary: z.string().min(10).max(1500),
  practiceQuestions: z.array(researchedPracticeQuestionSchema).min(1).max(4),
  sourceReferences: z.array(researchedSourceReferenceSchema).optional().default([]),
  recommendedNextTopic: z.string().min(2).max(200),
});
export type ResearchedLesson = z.infer<typeof researchedLessonSchema>;

/**
 * Maps a full ResearchedLesson into the standard Lesson shape
 * required by existing downstream components, history, and tests.
 */
export function researchedLessonToDomainLesson(rl: ResearchedLesson): Lesson {
  const definitionsText = rl.definitions.length > 0
    ? `\n\nKey Definitions:\n${rl.definitions.map((d) => `• ${d.term}: ${d.definition}`).join("\n")}`
    : "";

  const technicalText = rl.equationsOrTechnicalDetails && rl.equationsOrTechnicalDetails.length > 0
    ? `\n\nTechnical & Mathematical Principles:\n${rl.equationsOrTechnicalDetails.map((eq) => `• ${eq}`).join("\n")}`
    : "";

  const misconceptionsText = rl.commonMisconceptions.length > 0
    ? `\n\nCommon Misconceptions:\n${rl.commonMisconceptions.map((m) => `• ${m}`).join("\n")}`
    : "";

  const analogyAndExample = `\n\nIntuitive Analogy:\n${rl.analogy}\n\nReal-World Application:\n${rl.realWorldExample}`;

  const explanation = `${rl.simpleExplanation}\n\n${rl.detailedExplanation}${analogyAndExample}${definitionsText}${technicalText}${misconceptionsText}\n\nSummary:\n${rl.summary}`.slice(0, 13500);

  const check = rl.practiceQuestions[0]
    ? `${rl.practiceQuestions[0].prompt} Hint: ${rl.practiceQuestions[0].reason}`
    : rl.summary.slice(0, 500);

  const concepts = Array.from(
    new Set([
      ...rl.prerequisites,
      ...rl.definitions.map((d) => d.term),
      ...rl.practiceQuestions.map((q) => q.concept),
    ]),
  ).slice(0, 10);

  return lessonSchema.parse({
    title: rl.title,
    explanation,
    check: check.slice(0, 950),
    concepts: concepts.length > 0 ? concepts : ["core-principles"],
  });
}
