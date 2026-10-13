import { NextResponse } from "next/server";
export function GET() {
  return NextResponse.json(
    {
      provider: process.env.AI_PROVIDER ?? "fixture",
      nebiusConfigured: Boolean(
        process.env.NEBIUS_API_KEY && process.env.NEBIUS_MODEL,
      ),
      liveVerification:
        "Not established by configuration; run smoke tests and inspect evidence.",
      researchConfigured: Boolean(process.env.TAVILY_API_KEY),
      tracingConfigured: Boolean(
        process.env.LANGSMITH_API_KEY &&
        process.env.LANGSMITH_TRACING === "true",
      ),
      persistence:
        process.env.PERSISTENCE_PROVIDER === "postgres"
          ? "PostgreSQL guest storage configured (hosted verification required)"
          : "browser-local guest data",
      authentication:
        "Private guest cookie; organizer gate for production external calls. No named accounts.",
      rateLimitBackend: process.env.RATE_LIMIT_BACKEND ?? "memory",
      liveAccessGateConfigured: Boolean(
        process.env.LIVE_AI_ACCESS_CODE && process.env.SESSION_SIGNING_SECRET,
      ),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
