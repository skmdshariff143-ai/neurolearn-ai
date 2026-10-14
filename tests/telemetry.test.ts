import { it, expect } from "vitest";
import { tokenMetrics, langSmithKeyConfigured } from "../src/lib/telemetry";
it("does not enable tracing with an empty or placeholder key", () => {
  expect(langSmithKeyConfigured("")).toBe(false);
  expect(langSmithKeyConfigured("PASTE_YOUR_LANGSMITH_API_KEY_HERE")).toBe(
    false,
  );
  expect(langSmithKeyConfigured("  PLACEHOLDER  ")).toBe(false);
  expect(langSmithKeyConfigured("synthetic-test-value")).toBe(true);
});
it("normalizes actual token usage and leaves unavailable usage unknown", () => {
  expect(tokenMetrics(undefined)).toBeUndefined();
  expect(tokenMetrics({ prompt_tokens: 12, completion_tokens: 8 })).toEqual({
    input_tokens: 12,
    output_tokens: 8,
    total_tokens: 20,
  });
});
