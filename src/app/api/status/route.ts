import { NextResponse } from "next/server";
import { safePreview } from "@/lib/preview";
export function GET() {
  return NextResponse.json(
    {
      provider: safePreview
        ? "fixture"
        : (process.env.AI_PROVIDER ?? "fixture"),
      safePreview,
      integrationPolicy: safePreview
        ? "Disabled: live inference, research, tracing, uploads and hosted storage"
        : "Configuration dependent; live verification required",
      nebiusConfigured: Boolean(
        process.env.NEBIUS_API_KEY && process.env.NEBIUS_MODEL,
      ),
      nvidiaConfigured: Boolean(process.env.NVIDIA_API_KEY),
      liveVerification:
        "Not established by configuration; run smoke tests and inspect evidence.",
      researchConfigured: Boolean(process.env.TAVILY_API_KEY),
      tracingConfigured: Boolean(
        process.env.LANGSMITH_API_KEY &&
        process.env.LANGSMITH_TRACING === "true",
      ),
      persistence: safePreview
        ? "Transient memory only; cleared on reload; existing stored data is not read"
        : process.env.PERSISTENCE_PROVIDER === "postgres"
          ? "PostgreSQL guest storage configured (hosted verification required)"
          : "browser-local guest data",
      authentication: safePreview
        ? "Hosted deployment protection required; no named accounts or hosted guest records"
        : "Private guest cookie; organizer gate for production external calls. No named accounts.",
      rateLimitBackend: process.env.RATE_LIMIT_BACKEND ?? "memory",
      liveAccessGateConfigured: Boolean(
        process.env.LIVE_AI_ACCESS_CODE && process.env.SESSION_SIGNING_SECRET,
      ),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
