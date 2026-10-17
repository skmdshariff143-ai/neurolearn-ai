import { describe, it, expect } from "vitest";
import {
  GOLDEN_BENCHMARK_TOPICS,
  evaluateBenchmarkTopic,
} from "@/lib/research/golden-evaluation";
import { UniversalResearchCoordinator } from "@/lib/research/coordinator";
import { WikipediaSource } from "@/lib/research/sources/wikipedia";
import { OpenStaxOCWSource } from "@/lib/research/sources/openstax-ocw";
import { OpenAlexSource } from "@/lib/research/sources/openalex";
import { CrossrefSource } from "@/lib/research/sources/crossref";

describe("Golden Educational Evaluation Benchmark", () => {
  it("contains exactly 10 high-value benchmark topics with prerequisites and misconceptions", () => {
    expect(GOLDEN_BENCHMARK_TOPICS.length).toBe(10);
    for (const benchmark of GOLDEN_BENCHMARK_TOPICS) {
      expect(benchmark.id).toBeTruthy();
      expect(benchmark.topic.length).toBeGreaterThan(5);
      expect(benchmark.expectedSubject).toBeTruthy();
      expect(benchmark.requiredPrerequisites.length).toBeGreaterThanOrEqual(2);
      expect(benchmark.essentialTerms.length).toBeGreaterThanOrEqual(3);
      expect(benchmark.sampleQuestions.length).toBeGreaterThanOrEqual(1);
      expect(benchmark.misconceptionsToPrevent.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("covers STEM, Humanities, Languages (Telugu & Hindi), and Finance", () => {
    const subjects = GOLDEN_BENCHMARK_TOPICS.map((b) => b.expectedSubject);
    expect(subjects).toContain("Physics");
    expect(subjects).toContain("Computer Science");
    expect(subjects).toContain("Mathematics");
    expect(subjects).toContain("Biology");
    expect(subjects).toContain("Earth");
    expect(subjects).toContain("History");
    expect(subjects).toContain("Political Science");
    expect(subjects).toContain("Statistics");
    expect(subjects).toContain("Economics & Finance");
  });

  it("evaluates a benchmark topic through the research coordinator with high source verification", async () => {
    const coordinator = new UniversalResearchCoordinator([
      new OpenStaxOCWSource(),
      new WikipediaSource(),
      new OpenAlexSource(),
      new CrossrefSource(),
    ]);

    const transformerBenchmark = GOLDEN_BENCHMARK_TOPICS.find((b) => b.id === "transformer")!;
    const result = await evaluateBenchmarkTopic(transformerBenchmark, coordinator);

    expect(result.passed).toBe(true);
    expect(result.sourcesRetrieved).toBeGreaterThan(0);
    expect(result.sourcesVerified).toBe(true);
    expect(result.prerequisites.length).toBeGreaterThanOrEqual(2);
    expect(result.termMatchRate).toBeGreaterThan(0.3);
  });

  it("evaluates multilingual benchmark topics and extracts authentic prerequisites", async () => {
    const coordinator = new UniversalResearchCoordinator([
      new OpenStaxOCWSource(),
      new WikipediaSource(),
    ]);

    const teluguBenchmark = GOLDEN_BENCHMARK_TOPICS.find((b) => b.id === "telugu_telangana_history")!;
    const hindiBenchmark = GOLDEN_BENCHMARK_TOPICS.find((b) => b.id === "hindi_constitution")!;

    const teluguResult = await evaluateBenchmarkTopic(teluguBenchmark, coordinator);
    expect(teluguResult.prerequisites.length).toBeGreaterThanOrEqual(1);

    const hindiResult = await evaluateBenchmarkTopic(hindiBenchmark, coordinator);
    expect(hindiResult.prerequisites.length).toBeGreaterThanOrEqual(1);
  });
});
