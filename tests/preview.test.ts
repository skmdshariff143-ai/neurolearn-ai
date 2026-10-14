import { afterEach, expect, it, vi } from "vitest";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});
it("safe preview ignores browser persistence and forces fixtures despite a live setting", async () => {
  vi.stubEnv("NEXT_PUBLIC_SAFE_PREVIEW", "true");
  vi.stubEnv("AI_PROVIDER", "nebius");
  vi.stubEnv("LANGSMITH_TRACING", "true");
  vi.stubEnv("LANGSMITH_API_KEY", "test-only");
  vi.resetModules();
  const local = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };
  vi.stubGlobal("localStorage", local);
  const { guestStorage } = await import("../src/lib/preview");
  guestStorage.setItem("nl-topic", "Python");
  expect(guestStorage.getItem("nl-topic")).toBe("Python");
  guestStorage.removeItem("nl-topic");
  expect(guestStorage.getItem("nl-topic")).toBeNull();
  expect(local.getItem).not.toHaveBeenCalled();
  expect(local.setItem).not.toHaveBeenCalled();
  const { provider, research } = await import("../src/lib/providers");
  expect(provider().kind).toBe("fixture");
  vi.stubEnv("TAVILY_API_KEY", "test-only");
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  await expect(research("Transformers")).rejects.toThrow(
    "Safe preview disables",
  );
  expect(fetch).not.toHaveBeenCalled();
  const { tracingEnabled } = await import("../src/lib/telemetry");
  expect(tracingEnabled).toBe(false);
  const { databasePool } = await import("../src/lib/postgres");
  expect(() => databasePool()).toThrow("disabled in safe preview");
  const { extractPDF } = await import("../src/lib/resources");
  await expect(extractPDF(new File(["%PDF-"], "test.pdf"))).rejects.toThrow(
    /disabled/,
  );
});
