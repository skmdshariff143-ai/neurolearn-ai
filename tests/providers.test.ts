import { describe, it, expect, vi, afterEach } from "vitest";
import {
  provider,
  boundedFetch,
  research,
  teachingPrompt,
  generateLesson,
} from "../src/lib/providers";
import { requestSchema } from "../src/lib/domain";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("provider safety", () => {
  it("does not spend research credits on a fixture lesson", async () => {
    vi.stubEnv("AI_PROVIDER", "fixture");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(
      generateLesson(
        requestSchema.parse({ topic: "Transformers", research: true }),
      ),
    ).rejects.toThrow("fixture lessons cannot");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("deduplicates concurrent research with equivalent topic keys", async () => {
    vi.stubEnv("TAVILY_API_KEY", "test");
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              title: "Reference",
              url: "https://example.org/concurrent",
              content: "Educational context",
              score: 0.9,
            },
          ],
        }),
      ),
    );
    vi.stubGlobal("fetch", fetch);
    const results = await Promise.all([
      research("Concurrent Test"),
      research(" concurrent test "),
    ]);
    expect(results[0]).toEqual(results[1]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("rejects missing Nebius keys without falling back", () => {
    vi.stubEnv("AI_PROVIDER", "nebius");
    vi.stubEnv("NEBIUS_API_KEY", "");
    expect(() => provider()).toThrow("not configured");
  });
  it("requires explicit demo opt-in in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AI_PROVIDER", "fixture");
    vi.stubEnv("ALLOW_DEMO_MODE", "");
    expect(() => provider()).toThrow("explicitly");
  });
  it("rejects remote addresses for local inference", () => {
    vi.stubEnv("AI_PROVIDER", "local");
    vi.stubEnv("LOCAL_AI_BASE_URL", "https://example.com/v1");
    expect(() => provider()).toThrow("loopback");
  });
  it("does not retry unauthorized responses", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response("", { status: 401 }));
    vi.stubGlobal("fetch", fetch);
    await expect(boundedFetch("https://example.com", {})).rejects.toThrow(
      "401",
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("retries a temporary failure only once", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response("", { status: 503 }));
    vi.stubGlobal("fetch", fetch);
    await expect(boundedFetch("https://example.com", {})).rejects.toThrow(
      "503",
    );
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("validates model output and makes a real adapter request under mock transport", async () => {
    vi.stubEnv("AI_PROVIDER", "nebius");
    vi.stubEnv("NEBIUS_API_KEY", "test-key");
    vi.stubEnv("NEBIUS_MODEL", "nvidia/test-nemotron");
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content:
                  '{"title":"Test","explanation":"A changing flux induces voltage.","check":"Why AC?","concepts":["flux"]}',
              },
            },
          ],
        }),
      ),
    );
    vi.stubGlobal("fetch", fetch);
    const lesson = await provider().generate(
      requestSchema.parse({ topic: "transformers" }),
      [],
    );
    expect(lesson.concepts).toEqual(["flux"]);
    expect(fetch.mock.calls[0][0]).toBe(
      "https://api.tokenfactory.nebius.com/v1/chat/completions",
    );
  });
  it("surfaces malformed model JSON", async () => {
    vi.stubEnv("AI_PROVIDER", "nebius");
    vi.stubEnv("NEBIUS_API_KEY", "test");
    vi.stubEnv("NEBIUS_MODEL", "test");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ choices: [{ message: { content: "not json" } }] }),
          ),
        ),
    );
    await expect(
      provider().generate(requestSchema.parse({ topic: "python" }), []),
    ).rejects.toThrow("validation");
  });
  it("fails research clearly without a key", async () => {
    vi.stubEnv("TAVILY_API_KEY", "");
    await expect(research("topic")).rejects.toThrow("not configured");
  });
  it("deduplicates, filters unsafe URLs, and caches retrieved sources", async () => {
    vi.stubEnv("TAVILY_API_KEY", "test");
    const source = {
      title: "Reference",
      url: "https://example.org/learn",
      content: "Educational material",
      score: 0.9,
    };
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            source,
            source,
            { ...source, url: "javascript:alert(1)" },
            { ...source, url: "https://example.org/low", score: 0.1 },
          ],
        }),
      ),
    );
    vi.stubGlobal("fetch", fetch);
    expect(await research("cache-test")).toHaveLength(1);
    expect(await research("cache-test")).toHaveLength(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("changes model teaching instructions with language and strategy", () => {
    expect(
      teachingPrompt(
        requestSchema.parse({
          topic: "python",
          strategy: "analogy",
          language: "Telugu",
        }),
        [],
      ),
    ).toContain("where the analogy breaks down");
    expect(
      teachingPrompt(
        requestSchema.parse({ topic: "python", language: "Telugu" }),
        [],
      ),
    ).toContain("Telugu");
  });
});
