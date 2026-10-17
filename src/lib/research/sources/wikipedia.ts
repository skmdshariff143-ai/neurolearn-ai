import type {
  ResearchSource,
  NormalizedSource,
  EducationalLevel,
  ResearchLanguage,
} from "../types";
import { isSafeExternalUrl, sanitizeUntrustedExcerpt, extractMeaningfulTerms } from "../security";

export class WikipediaSource implements ResearchSource {
  readonly name = "wikipedia";

  private getSubdomain(language: ResearchLanguage): string {
    switch (language) {
      case "Telugu":
        return "te";
      case "Hindi":
        return "hi";
      case "English":
      default:
        return "en";
    }
  }

  async search(
    topic: string,
    _educationalLevel: EducationalLevel,
    language: ResearchLanguage,
    limit = 3,
  ): Promise<NormalizedSource[]> {
    const subdomain = this.getSubdomain(language);
    const searchUrl = `https://${subdomain}.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(
      topic,
    )}&limit=${Math.min(limit, 5)}`;

    if (!isSafeExternalUrl(searchUrl)) return [];

    try {
      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent": "NeuroLearn-AI-Research/1.0 (educational research engine; https://github.com/skmdshariff143-ai/neurolearn-ai)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) return [];

      const data = (await response.json()) as {
        pages?: Array<{
          id: number;
          key: string;
          title: string;
          excerpt?: string;
          description?: string;
        }>;
      };

      if (!data.pages || !Array.isArray(data.pages)) return [];

      const queryTerms = extractMeaningfulTerms(topic);
      const results: NormalizedSource[] = [];

      for (const page of data.pages) {
        const rawExcerpt = page.description
          ? `${page.description}. ${page.excerpt ?? ""}`
          : page.excerpt ?? page.title;
        const cleanExcerpt = sanitizeUntrustedExcerpt(
          rawExcerpt.replace(/<[^>]+>/g, " "),
          1200,
        );

        const pageUrl = `https://${subdomain}.wikipedia.org/wiki/${encodeURIComponent(page.key)}`;
        if (!isSafeExternalUrl(pageUrl)) continue;

        const excerptWords = new Set(
          cleanExcerpt
            .toLowerCase()
            .match(/[\p{L}\p{N}]{3,}/gu)
            ?.map((w) => w.replace(/s$/, "")) ?? [],
        );
        const matchCount = queryTerms.filter((term) => excerptWords.has(term)).length;
        const relevanceScore = Math.min(
          1,
          queryTerms.length > 0 ? matchCount / queryTerms.length : 0.5,
        );

        results.push({
          sourceId: `wiki_${page.id}`,
          title: page.title,
          url: pageUrl,
          publisher: "Wikipedia / Wikimedia Foundation",
          retrievedDate: new Date().toISOString().split("T")[0],
          excerpt: cleanExcerpt,
          contentType: "encyclopedic",
          license: "Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)",
          retrievalMethod: "api",
          confidenceSignals: {
            relevanceScore: Math.round(relevanceScore * 100) / 100,
            termMatchCount: matchCount,
            authorityWeight: 0.88,
          },
        });
      }

      return results;
    } catch {
      return [];
    }
  }
}
