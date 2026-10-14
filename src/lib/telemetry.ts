import { Client } from "langsmith";
import { safePreview } from "./preview";
export const telemetryClient = new Client({ autoBatchTracing: true });
export function langSmithKeyConfigured(key = process.env.LANGSMITH_API_KEY) {
  return Boolean(
    key?.trim() && !/^(?:PASTE_|YOUR_|PLACEHOLDER|<)/i.test(key.trim()),
  );
}
export const tracingEnabled =
  !safePreview &&
  process.env.LANGSMITH_TRACING === "true" &&
  langSmithKeyConfigured();
export function tokenMetrics(
  usage: { prompt_tokens: number; completion_tokens: number } | undefined,
) {
  if (!usage) return undefined;
  return {
    input_tokens: usage.prompt_tokens,
    output_tokens: usage.completion_tokens,
    total_tokens: usage.prompt_tokens + usage.completion_tokens,
  };
}
export async function flushTraces() {
  if (tracingEnabled)
    await telemetryClient.awaitPendingTraceBatches().catch(() => {
      /* A failed telemetry flush must not discard learning progress. Live verification stays separate. */
    });
}
