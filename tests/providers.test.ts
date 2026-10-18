import { describe, it, expect, vi, afterEach } from "vitest";
import {
  provider,
  boundedFetch,
  research,
  teachingPrompt,
  generateLesson,
  tavilyKeyConfigured,
  searchTavily,
  validateTavilyResponse,
} from "../src/lib/providers";
import { requestSchema } from "../src/lib/domain";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("provider safety", () => {
  it("requires real research lessons to cite supplied web source IDs", async () => {
    vi.stubEnv("AI_PROVIDER", "local");
    vi.stubEnv("LOCAL_AI_MODEL", "test-model");
    vi.stubEnv("TAVILY_API_KEY", "test");
    const fetch = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          results: [
            {
              title: "Flux reference",
              url: "https://example.org/flux",
              content: "Changing flux induces voltage",
              score: 0.9,
            },
          ],
        }),
      ),
    );
    for (const citation of [
      "[source:99]",
      "[source:bogus] [source:1]",
      "[source:01]",
      "",
      "[source:1]",
    ])
      fetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    title: "Flux",
                    explanation: `Changing flux induces voltage. ${citation}`,
                    check: "Why AC?",
                    concepts: ["flux"],
                  }),
                },
              },
            ],
          }),
        ),
      );
    vi.stubGlobal("fetch", fetch);
    const input = requestSchema.parse({
      topic: "web-citation-regression",
      research: true,
    });
    for (let attempt = 0; attempt < 4; attempt++)
      await expect(generateLesson(input)).rejects.toThrow(
        "supplied source identifiers",
      );
    expect((await generateLesson(input)).lesson.explanation).toContain(
      "[source:1]",
    );
    expect(fetch).toHaveBeenCalledTimes(6);
  });
  it("accepts moderately ranked topical citations while rejecting unrelated, weak and unsafe results", () => {
    const source = {
      title: "Transformer electromagnetic induction",
      url: "https://example.org/transformers",
      content: "Alternating current changes flux in transformers.",
      score: 0.4797236,
    };
    const result = validateTavilyResponse(
      {
        results: [
          source,
          { ...source, url: `${source.url}#section` },
          {
            ...source,
            url: "https://example.org/unrelated",
            title: "Other topic",
            content: "Unrelated text",
          },
          { ...source, url: "https://example.org/weak", score: 0.13710469 },
          { ...source, url: "javascript:alert(1)" },
        ],
      },
      "electromagnetic induction transformer alternating current",
    );
    expect(result.sources).toHaveLength(1);
    expect(result.diagnostics).toMatchObject({
      httpStatus: 200,
      schemaValid: true,
      citationValidCount: 4,
      acceptedCount: 1,
      rejectedByFiltering: 4,
    });
  });
  it("distinguishes invalid schemas and empty valid searches", () => {
    expect(() =>
      validateTavilyResponse({ results: [{ score: "bad" }] }, "topic"),
    ).toThrow("invalid-schema");
    expect(
      validateTavilyResponse({ results: [] }, "topic").diagnostics
        .errorCategory,
    ).toBe("empty-results");
  });
  it.each([
    [401, "authentication"],
    [403, "permissions"],
    [429, "rate-limit-or-credits"],
    [432, "usage-limit"],
    [503, "service"],
  ])(
    "sanitizes Tavily HTTP %s without automatic retries",
    async (status, category) => {
      vi.stubEnv("TAVILY_API_KEY", "test");
      const fetch = vi.fn().mockResolvedValue(
        new Response("PRIVATE RESPONSE MUST NOT APPEAR", {
          status: Number(status),
        }),
      );
      vi.stubGlobal("fetch", fetch);
      await expect(searchTavily("topic")).rejects.toMatchObject({
        diagnostics: { httpStatus: status, errorCategory: category },
      });
      expect(fetch).toHaveBeenCalledTimes(1);
    },
  );
  it("distinguishes sanitized DNS errors", async () => {
    vi.stubEnv("TAVILY_API_KEY", "test");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockRejectedValue(
          new TypeError("private details", { cause: { code: "ENOTFOUND" } }),
        ),
    );
    await expect(searchTavily("topic")).rejects.toMatchObject({
      diagnostics: { errorCategory: "dns", httpStatus: null },
    });
  });
  it("rejects placeholder research credentials without a request", async () => {
    vi.stubEnv("TAVILY_API_KEY", "PASTE_YOUR_TAVILY_API_KEY_HERE");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect(tavilyKeyConfigured()).toBe(false);
    await expect(research("placeholder-safety")).rejects.toThrow(
      "not configured",
    );
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects invented document page identifiers and preserves supplied citations", async () => {
    vi.stubEnv("AI_PROVIDER", "local");
    vi.stubEnv("LOCAL_AI_MODEL", "test-model");
    vi.stubEnv("LOCAL_AI_BASE_URL", "http://127.0.0.1:11434/v1");
    const id = "11111111-1111-4111-8111-111111111111";
    const response = (page: number) =>
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  title: "Flux",
                  explanation: `Changing magnetic flux induces voltage. [${id}:p${page}]`,
                  check: "Why AC?",
                  concepts: ["flux"],
                }),
              },
            },
          ],
        }),
      );
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(2))
      .mockResolvedValueOnce(response(1));
    vi.stubGlobal("fetch", fetch);
    const input = requestSchema.parse({
      topic: "Transformers",
      passages: [
        {
          resourceId: id,
          title: "My notes",
          page: 1,
          text: "Changing flux induces voltage.",
        },
      ],
    });
    await expect(generateLesson(input)).rejects.toThrow(/page identifiers/);
    expect((await generateLesson(input)).lesson.explanation).toContain(
      `:${"p1"}`,
    );
  });
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
  it("rejects missing NVIDIA keys without falling back", () => {
    vi.stubEnv("AI_PROVIDER", "nvidia");
    vi.stubEnv("NVIDIA_API_KEY", "");
    expect(() => provider()).toThrow("NVIDIA is not configured");
  });
  it("initializes NVIDIA provider with default Nemotron model and server-side credentials", () => {
    vi.stubEnv("AI_PROVIDER", "nvidia");
    vi.stubEnv("NVIDIA_API_KEY", "nvapi-test-dummy-key");
    const p = provider();
    expect(p.kind).toBe("nvidia");
  });
  it("NVIDIA provider completes structured lesson with mocked response", async () => {
    vi.stubEnv("AI_PROVIDER", "nvidia");
    vi.stubEnv("NVIDIA_API_KEY", "nvapi-test-dummy-key");
    const mockLesson = {
      title: "Understanding Electromagnetic Induction",
      explanation: "A changing magnetic flux induces an electromotive force (EMF).",
      check: "Why is alternating current required?",
      concepts: ["Magnetic Flux", "Faraday's Law"],
    };
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify(mockLesson),
              },
            },
          ],
          usage: { prompt_tokens: 120, completion_tokens: 80 },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", mockFetch);

    const p = provider();
    const lesson = await p.generate(
      requestSchema.parse({
        topic: "Electrical transformers",
        language: "English",
        strategy: "lesson",
      }),
      [],
    );

    expect(lesson.title).toBe(mockLesson.title);
    expect(lesson.explanation).toContain("changing magnetic flux");
    expect(lesson.concepts).toContain("Magnetic Flux");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer nvapi-test-dummy-key",
        }),
      }),
    );
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
