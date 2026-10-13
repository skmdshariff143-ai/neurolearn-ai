import { it, expect } from "vitest";
import { tokenMetrics } from "../src/lib/telemetry";
it("normalizes actual token usage and leaves unavailable usage unknown", () => {
  expect(tokenMetrics(undefined)).toBeUndefined();
  expect(tokenMetrics({ prompt_tokens: 12, completion_tokens: 8 })).toEqual({
    input_tokens: 12,
    output_tokens: 8,
    total_tokens: 20,
  });
});
