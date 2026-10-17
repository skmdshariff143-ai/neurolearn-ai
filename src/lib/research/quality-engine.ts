import type { NormalizedSource } from "./types";
import { isSafeExternalUrl, extractMeaningfulTerms } from "./security";

export interface QualityAssessment {
  accepted: NormalizedSource[];
  rejectedCount: number;
  rejectionReasons: Record<string, number>;
  corroborationDegree: "single-source" | "multi-source" | "cross-validated";
}

function canonicalizeUrl(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    u.hash = "";
    // Remove tracking query parameters
    const searchParams = new URLSearchParams(u.search);
    for (const key of Array.from(searchParams.keys())) {
      if (
        key.startsWith("utm_") ||
        ["fbclid", "gclid", "ref", "source", "ref_src"].includes(key.toLowerCase())
      ) {
        searchParams.delete(key);
      }
    }
    u.search = searchParams.toString();
    return u.href;
  } catch {
    return null;
  }
}

export function evaluateAndFilterSources(
  sources: NormalizedSource[],
  topic: string,
  minAcceptableScore = 0.25,
): QualityAssessment {
  const queryTerms = extractMeaningfulTerms(topic);
  const seenCanonicalUrls = new Set<string>();
  const seenPublishers = new Set<string>();
  const accepted: NormalizedSource[] = [];
  const rejectionReasons: Record<string, number> = {
    "unsafe-url": 0,
    "missing-metadata": 0,
    "duplicate-url": 0,
    "insufficient-excerpt": 0,
    "low-relevance": 0,
  };

  for (const src of sources) {
    if (!src.url || !isSafeExternalUrl(src.url)) {
      rejectionReasons["unsafe-url"]++;
      continue;
    }

    const canonical = canonicalizeUrl(src.url);
    if (!canonical) {
      rejectionReasons["unsafe-url"]++;
      continue;
    }

    if (seenCanonicalUrls.has(canonical)) {
      rejectionReasons["duplicate-url"]++;
      continue;
    }

    if (!src.title?.trim() || !src.publisher?.trim()) {
      rejectionReasons["missing-metadata"]++;
      continue;
    }

    if (!src.excerpt || src.excerpt.trim().length < 25) {
      rejectionReasons["insufficient-excerpt"]++;
      continue;
    }

    const words = new Set(
      `${src.title} ${src.excerpt}`
        .toLowerCase()
        .match(/[\p{L}\p{N}]{3,}/gu)
        ?.map((w) => w.replace(/s$/, "")) ?? [],
    );
    const matches = queryTerms.filter((term) => words.has(term)).length;

    // If the query has terms and the document matches none, reject as irrelevant
    if (queryTerms.length > 0 && matches === 0) {
      rejectionReasons["low-relevance"]++;
      continue;
    }

    const termRatio = queryTerms.length > 0 ? matches / queryTerms.length : 0.5;
    const finalScore =
      0.6 * termRatio + 0.4 * src.confidenceSignals.authorityWeight;

    if (finalScore < minAcceptableScore) {
      rejectionReasons["low-relevance"]++;
      continue;
    }

    seenCanonicalUrls.add(canonical);
    seenPublishers.add(src.publisher.toLowerCase());

    accepted.push({
      ...src,
      url: canonical,
      confidenceSignals: {
        relevanceScore: Math.round(finalScore * 100) / 100,
        termMatchCount: matches,
        authorityWeight: src.confidenceSignals.authorityWeight,
      },
    });
  }

  // Sort by composite ranking (relevance * authority)
  accepted.sort((a, b) => {
    const scoreA =
      a.confidenceSignals.relevanceScore * 0.7 +
      a.confidenceSignals.authorityWeight * 0.3;
    const scoreB =
      b.confidenceSignals.relevanceScore * 0.7 +
      b.confidenceSignals.authorityWeight * 0.3;
    return scoreB - scoreA;
  });

  const totalRejected = Object.values(rejectionReasons).reduce(
    (sum, count) => sum + count,
    0,
  );

  const corroborationDegree =
    seenPublishers.size >= 3
      ? "cross-validated"
      : seenPublishers.size >= 2
        ? "multi-source"
        : "single-source";

  return {
    accepted,
    rejectedCount: totalRejected,
    rejectionReasons,
    corroborationDegree,
  };
}
