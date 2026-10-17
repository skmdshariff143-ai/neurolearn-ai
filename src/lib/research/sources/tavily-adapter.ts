import type {
  ResearchSource,
  NormalizedSource,
  EducationalLevel,
  ResearchLanguage,
} from "../types";
import { searchTavily, tavilyKeyConfigured } from "../../providers";
import { isSafeExternalUrl, sanitizeUntrustedExcerpt, extractMeaningfulTerms } from "../security";

export class TavilySource implements ResearchSource {
  readonly name = "tavily";

  async search(
    topic: string,
    _educationalLevel: EducationalLevel,
    _language: ResearchLanguage,
    limit = 3,
  ): Promise<NormalizedSource[]> {
    if (!tavilyKeyConfigured()) return [];

    try {
      const response = await searchTavily(topic);
      const queryTerms = extractMeaningfulTerms(topic);

      return response.sources
        .filter((src) => isSafeExternalUrl(src.url))
        .slice(0, limit)
        .map((src, idx) => {
        const cleanExcerpt = sanitizeUntrustedExcerpt(src.excerpt, 1200);
        const words = new Set(
          `${src.title} ${cleanExcerpt}`
            .toLowerCase()
            .match(/[\p{L}\p{N}]{3,}/gu)
            ?.map((w) => w.replace(/s$/, "")) ?? [],
        );
        const matchCount = queryTerms.filter((term) => words.has(term)).length;
        const relevanceScore = Math.min(
          1,
          queryTerms.length > 0 ? matchCount / queryTerms.length : 0.6,
        );

        let domain = "Web Educational Source";
        try {
          domain = new URL(src.url).hostname.replace(/^www\./, "");
        } catch {
          // ignore
        }

        return {
          sourceId: `tavily_${idx + 1}`,
          title: src.title,
          url: src.url,
          publisher: domain,
          retrievedDate: new Date().toISOString().split("T")[0],
          excerpt: cleanExcerpt,
          contentType: "educational-web",
          license: "Educational Fair Use / Publisher Terms",
          retrievalMethod: "search",
          confidenceSignals: {
            relevanceScore: Math.round(relevanceScore * 100) / 100,
            termMatchCount: matchCount,
            authorityWeight: 0.80,
          },
        };
      });
    } catch {
      return [];
    }
  }
}
