import { NextResponse } from "next/server";
export function GET() {
  return NextResponse.json(
    {
      provider: process.env.AI_PROVIDER ?? "fixture",
      nebiusConfigured: Boolean(
        process.env.NEBIUS_API_KEY && process.env.NEBIUS_MODEL,
      ),
      nebiusLiveVerified: false,
      researchConfigured: Boolean(process.env.TAVILY_API_KEY),
      tracingConfigured: Boolean(
        process.env.LANGSMITH_API_KEY &&
        process.env.LANGSMITH_TRACING === "true",
      ),
      persistence: "browser-local guest data",
      authentication: "not configured",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
