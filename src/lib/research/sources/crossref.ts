import type {
  ResearchSource,
  NormalizedSource,
  EducationalLevel,
  ResearchLanguage,
} from "../types";
import { isSafeExternalUrl, sanitizeUntrustedExcerpt, extractMeaningfulTerms } from "../security";

export class CrossrefSource implements ResearchSource {
  readonly name = "crossref";

  async search(
    topic: string,
    _educationalLevel: EducationalLevel,
    _language: ResearchLanguage,
    limit = 3,
  ): Promise<NormalizedSource[]> {
    const url = `https://api.crossref.org/works?query=${encodeURIComponent(
      topic,
    )}&rows=${Math.min(limit, 5)}&mailto=neurolearn@example.com`;

    if (!isSafeExternalUrl(url)) return [];

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "NeuroLearn-AI/1.0 (mailto:neurolearn@example.com)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) return [];

      const data = (await response.json()) as {
        message?: {
          items?: Array<{
            DOI?: string;
            title?: string[];
            URL?: string;
            publisher?: string;
            author?: Array<{ given?: string; family?: string }>;
            abstract?: string;
            published?: { "date-parts"?: number[][] };
          }>;
        };
      };

      if (!data.message?.items || !Array.isArray(data.message.items)) return [];

      const queryTerms = extractMeaningfulTerms(topic);
      const sources: NormalizedSource[] = [];

      for (const item of data.message.items) {
        const title = item.title?.[0];
        if (!title || !item.URL || !isSafeExternalUrl(item.URL)) continue;

        const rawExcerpt = item.abstract
          ? item.abstract.replace(/<[^>]+>/g, " ")
          : title;
        const cleanExcerpt = sanitizeUntrustedExcerpt(rawExcerpt, 1200);

        const words = new Set(
          `${title} ${cleanExcerpt}`
            .toLowerCase()
            .match(/[\p{L}\p{N}]{3,}/gu)
            ?.map((w) => w.replace(/s$/, "")) ?? [],
        );
        const matchCount = queryTerms.filter((term) => words.has(term)).length;
        const relevanceScore = Math.min(
          1,
          queryTerms.length > 0 ? matchCount / queryTerms.length : 0.5,
        );

        const authorObj = item.author?.[0];
        const author = authorObj
          ? [authorObj.given, authorObj.family].filter(Boolean).join(" ")
          : undefined;

        const year = item.published?.["date-parts"]?.[0]?.[0];

        sources.push({
          sourceId: `crossref_${item.DOI ? item.DOI.replace(/[^a-zA-Z0-9_-]/g, "_") : Math.random().toString(36).substring(2)}`,
          title,
          url: item.URL,
          publisher: item.publisher ?? "Crossref Academic Publisher",
          author,
          publicationDate: year ? String(year) : undefined,
          retrievedDate: new Date().toISOString().split("T")[0],
          excerpt: cleanExcerpt,
          contentType: "scholarly",
          license: "Scholarly Open Metadata / Publisher Terms",
          retrievalMethod: "api",
          confidenceSignals: {
            relevanceScore: Math.round(relevanceScore * 100) / 100,
            termMatchCount: matchCount,
            authorityWeight: 0.89,
          },
        });
      }

      return sources;
    } catch {
      return [];
    }
  }
}
