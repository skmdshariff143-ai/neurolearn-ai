import {
  type EducationalLevel,
  type ResearchLanguage,
  type NormalizedSource,
  type ResearchPlan,
  type ResearchResult,
  type ResearchSource,
} from "./types";
import { WikipediaSource } from "./sources/wikipedia";
import { OpenAlexSource } from "./sources/openalex";
import { CrossrefSource } from "./sources/crossref";
import { OpenStaxOCWSource } from "./sources/openstax-ocw";
import { TavilySource } from "./sources/tavily-adapter";
import { evaluateAndFilterSources } from "./quality-engine";
import { citationSchema, type Citation } from "../domain";

interface CachedResearch {
  result: ResearchResult;
  timestamp: number;
}

const RESEARCH_CACHE = new Map<string, CachedResearch>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache TTL for public research
const MAX_CACHE_ENTRIES = 150;

export function classifyTopicAndSubject(topic: string): {
  subject: string;
  prerequisites: string[];
} {
  const lower = topic.toLowerCase();

  if (/transformer|induction|electromagnet|flux|faraday|current|circuit|voltage/i.test(lower)) {
    return {
      subject: "Physics (Electromagnetism)",
      prerequisites: ["Electric Current", "Magnetic Fields", "Conservation of Energy"],
    };
  }
  if (/python|loop|loops|algorithm|variable|recursion|function|data structure|tree|graph/i.test(lower)) {
    return {
      subject: "Computer Science",
      prerequisites: ["Basic Programming Syntax", "Boolean Logic", "Variables"],
    };
  }
  if (/quadratic|equation|algebra|polynomial|parabola|root|calculus|derivative|integral/i.test(lower)) {
    return {
      subject: "Mathematics",
      prerequisites: ["Linear Equations", "Factoring", "Coordinate Plane"],
    };
  }
  if (/photosynthesis|cell|respiration|dna|genetics|enzyme|mitochondria/i.test(lower)) {
    return {
      subject: "Biology",
      prerequisites: ["Cell Structure", "Chemical Reactions", "Solar Energy"],
    };
  }
  if (/climate|greenhouse|carbon|atmosphere|warming|emission|weather/i.test(lower)) {
    return {
      subject: "Earth & Climate Science",
      prerequisites: ["Solar Radiation", "Atmospheric Layers", "Carbon Cycle"],
    };
  }
  if (/quantum|mechanics|wave|particle|photoelectric|schrodinger|relativity/i.test(lower)) {
    return {
      subject: "Advanced Physics",
      prerequisites: ["Classical Mechanics", "Electromagnetism", "Calculus"],
    };
  }
  if (/statistic|statistics|probability|distribution|mean|variance|hypothesis|regression/i.test(lower)) {
    return {
      subject: "Statistics",
      prerequisites: ["Basic Algebra", "Probability Foundations", "Data Representation"],
    };
  }
  if (/interest|inflation|finance|economic|financial|money|investment|market/i.test(lower)) {
    return {
      subject: "Economics & Finance",
      prerequisites: ["Percentages", "Exponential Growth", "Basic Arithmetic"],
    };
  }
  if (/revolution|history|war|dynasty|empire|civilization|కాకతీయ|చరిత్ర/i.test(lower)) {
    return {
      subject: "History",
      prerequisites: ["Chronological Timelines", "Agrarian & Social Structures"],
    };
  }
  if (/constitution|rights|संविधान|प्रस्तावना|अधिकार|government|politics/i.test(lower)) {
    return {
      subject: "Political Science",
      prerequisites: ["Foundations of Governance", "Civil Liberties"],
    };
  }

  return {
    subject: "General Sciences & Humanities",
    prerequisites: ["Foundational Concepts", "Scientific Inquiry"],
  };
}

export function buildResearchPlan(
  topic: string,
  level: EducationalLevel = "Beginner",
  language: ResearchLanguage = "English",
): ResearchPlan {
  const { subject, prerequisites } = classifyTopicAndSubject(topic);
  const searchQueries = [
    topic,
    `${topic} fundamentals explanation`,
    `${topic} principles overview`,
  ];

  return {
    topic,
    subject,
    prerequisites,
    searchQueries,
    level,
    language,
  };
}

export class UniversalResearchCoordinator {
  private sources: ResearchSource[];

  constructor(customSources?: ResearchSource[]) {
    this.sources = customSources ?? [
      new OpenStaxOCWSource(),
      new WikipediaSource(),
      new OpenAlexSource(),
      new CrossrefSource(),
      new TavilySource(),
    ];
  }

  async coordinateResearch(
    topic: string,
    level: EducationalLevel = "Beginner",
    language: ResearchLanguage = "English",
    maxResults = 4,
  ): Promise<ResearchResult> {
    const cacheKey = `${topic.trim().toLowerCase()}::${level}::${language}`;
    const cached = RESEARCH_CACHE.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.result;
    }

    const plan = buildResearchPlan(topic, level, language);

    // Parallel search across configured sources with timeout and graceful recovery
    const searchPromises = this.sources.map(async (source) => {
      try {
        const found = await source.search(topic, level, language, 3);
        return { name: source.name, sources: found };
      } catch {
        return { name: source.name, sources: [] };
      }
    });

    const results = await Promise.all(searchPromises);
    const sourcesByProvider: Record<string, number> = {};
    const allFound: NormalizedSource[] = [];

    for (const r of results) {
      sourcesByProvider[r.name] = r.sources.length;
      allFound.push(...r.sources);
    }

    // Pass through quality engine
    const quality = evaluateAndFilterSources(allFound, topic);
    const topSources = quality.accepted.slice(0, maxResults);

    // Map top sources to standard Citation format
    const citations: Citation[] = topSources.flatMap((src) => {
      const parsed = citationSchema.safeParse({
        title: src.title.slice(0, 200),
        url: src.url,
        excerpt: src.excerpt.slice(0, 1200),
      });
      return parsed.success ? [parsed.data] : [];
    });

    const researchResult: ResearchResult = {
      plan,
      sources: topSources,
      citations,
      diagnostics: {
        totalFound: allFound.length,
        acceptedCount: topSources.length,
        rejectedByFilter: quality.rejectedCount,
        sourcesByProvider,
      },
    };

    // Store in cache (clean up oldest if reaching capacity)
    if (RESEARCH_CACHE.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = RESEARCH_CACHE.keys().next().value;
      if (oldestKey) RESEARCH_CACHE.delete(oldestKey);
    }
    RESEARCH_CACHE.set(cacheKey, {
      result: researchResult,
      timestamp: Date.now(),
    });

    return researchResult;
  }
}

export const defaultResearchCoordinator = new UniversalResearchCoordinator();
