import { z } from "zod";
import { citationSchema } from "../domain";

export const educationalLevelSchema = z.enum([
  "Beginner",
  "Intermediate",
  "Advanced",
]);
export type EducationalLevel = z.infer<typeof educationalLevelSchema>;

export const researchLanguageSchema = z.enum(["English", "Telugu", "Hindi"]);
export type ResearchLanguage = z.infer<typeof researchLanguageSchema>;

export const contentTypeSchema = z.enum([
  "encyclopedic",
  "scholarly",
  "textbook",
  "educational-web",
]);
export type ContentType = z.infer<typeof contentTypeSchema>;

export const normalizedSourceSchema = z.object({
  sourceId: z.string().min(1).max(80),
  title: z.string().min(1).max(300),
  url: z.string().url(),
  publisher: z.string().min(1).max(200),
  author: z.string().max(200).optional(),
  publicationDate: z.string().max(50).optional(),
  retrievedDate: z.string().max(50),
  excerpt: z.string().min(10).max(2000),
  contentType: contentTypeSchema,
  license: z.string().min(1).max(200),
  retrievalMethod: z.enum(["api", "curated", "search"]),
  confidenceSignals: z.object({
    relevanceScore: z.number().min(0).max(1),
    termMatchCount: z.number().int().min(0),
    authorityWeight: z.number().min(0).max(1),
  }),
});
export type NormalizedSource = z.infer<typeof normalizedSourceSchema>;

export interface ResearchSource {
  readonly name: string;
  search(
    topic: string,
    educationalLevel: EducationalLevel,
    language: ResearchLanguage,
    limit?: number,
  ): Promise<NormalizedSource[]>;
}

export const researchPlanSchema = z.object({
  topic: z.string().min(2).max(200),
  subject: z.string().min(2).max(100),
  prerequisites: z.array(z.string().max(100)).max(6),
  searchQueries: z.array(z.string().max(150)).min(1).max(5),
  level: educationalLevelSchema,
  language: researchLanguageSchema,
});
export type ResearchPlan = z.infer<typeof researchPlanSchema>;

export interface ResearchResult {
  plan: ResearchPlan;
  sources: NormalizedSource[];
  citations: z.infer<typeof citationSchema>[];
  diagnostics: {
    totalFound: number;
    acceptedCount: number;
    rejectedByFilter: number;
    sourcesByProvider: Record<string, number>;
  };
}
