import type {
  ResearchSource,
  NormalizedSource,
  EducationalLevel,
  ResearchLanguage,
} from "../types";
import { isSafeExternalUrl, sanitizeUntrustedExcerpt, extractMeaningfulTerms } from "../security";

export class OpenAlexSource implements ResearchSource {
  readonly name = "openalex";

  async search(
    topic: string,
    _educationalLevel: EducationalLevel,
    _language: ResearchLanguage,
    limit = 3,
  ): Promise<NormalizedSource[]> {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(
      topic,
    )}&per-page=${Math.min(limit, 5)}&filter=is_oa:true&mailto=neurolearn@example.com`;

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
        results?: Array<{
          id: string;
          title?: string;
          publication_year?: number;
          primary_location?: {
            landing_page_url?: string;
            source?: {
              display_name?: string;
            };
          };
          authorships?: Array<{
            author?: { display_name?: string };
          }>;
          abstract_inverted_index?: Record<string, number[]>;
          relevance_score?: number;
        }>;
      };

      if (!data.results || !Array.isArray(data.results)) return [];

      const queryTerms = extractMeaningfulTerms(topic);
      const sources: NormalizedSource[] = [];

      for (const item of data.results) {
        if (!item.title) continue;

        let abstract = "";
        if (item.abstract_inverted_index) {
          const wordsWithPositions: Array<{ word: string; pos: number }> = [];
          for (const [word, positions] of Object.entries(item.abstract_inverted_index)) {
            for (const pos of positions) {
              wordsWithPositions.push({ word, pos });
            }
          }
          wordsWithPositions.sort((a, b) => a.pos - b.pos);
          abstract = wordsWithPositions.map((wp) => wp.word).join(" ");
        }

        const excerpt = sanitizeUntrustedExcerpt(
          abstract.length > 30 ? abstract : item.title,
          1200,
        );

        const articleUrl = item.primary_location?.landing_page_url ?? `https://openalex.org/${item.id.replace("https://openalex.org/", "")}`;
        if (!isSafeExternalUrl(articleUrl)) continue;

        const publisher =
          item.primary_location?.source?.display_name ??
          "OpenAlex Open-Access Repository";
        const author = item.authorships?.[0]?.author?.display_name;

        const words = new Set(
          `${item.title} ${excerpt}`
            .toLowerCase()
            .match(/[\p{L}\p{N}]{3,}/gu)
            ?.map((w) => w.replace(/s$/, "")) ?? [],
        );
        const matchCount = queryTerms.filter((term) => words.has(term)).length;
        const relevanceScore = Math.min(
          1,
          queryTerms.length > 0 ? matchCount / queryTerms.length : 0.5,
        );

        sources.push({
          sourceId: `openalex_${item.id.replace(/[^a-zA-Z0-9_-]/g, "_")}`,
          title: item.title,
          url: articleUrl,
          publisher,
          author,
          publicationDate: item.publication_year ? String(item.publication_year) : undefined,
          retrievedDate: new Date().toISOString().split("T")[0],
          excerpt,
          contentType: "scholarly",
          license: "Open Access / CC-BY or OpenAlex CC0 Metadata",
          retrievalMethod: "api",
          confidenceSignals: {
            relevanceScore: Math.round(relevanceScore * 100) / 100,
            termMatchCount: matchCount,
            authorityWeight: 0.92,
          },
        });
      }

      return sources;
    } catch {
      return [];
    }
  }
}
