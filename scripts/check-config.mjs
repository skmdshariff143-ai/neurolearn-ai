const production = process.argv.includes("--production");
const provider = process.env.AI_PROVIDER ?? "fixture";
const issues = [];
const safePreview = process.env.NEXT_PUBLIC_SAFE_PREVIEW === "true";
if (
  !["true", "false"].includes(process.env.NEXT_PUBLIC_SAFE_PREVIEW ?? "false")
)
  issues.push("NEXT_PUBLIC_SAFE_PREVIEW must be true or false");
if (safePreview) {
  if (provider !== "fixture" || process.env.ALLOW_DEMO_MODE !== "true")
    issues.push(
      "Safe preview requires fixture provider and ALLOW_DEMO_MODE=true",
    );
  if (
    (process.env.PERSISTENCE_PROVIDER ?? "browser") !== "browser" ||
    (process.env.RATE_LIMIT_BACKEND ?? "memory") !== "memory"
  )
    issues.push(
      "Safe preview must not enable hosted persistence or database quotas",
    );
  if (process.env.LANGSMITH_TRACING === "true")
    issues.push("Tracing disabled in safe preview");
  for (const name of [
    "NEBIUS_API_KEY",
    "TAVILY_API_KEY",
    "LANGSMITH_API_KEY",
    "DATABASE_URL",
    "LIVE_AI_ACCESS_CODE",
    "SESSION_SIGNING_SECRET",
  ])
    if (process.env[name]) issues.push(`${name} must be unset in safe preview`);
}
if (
  !["memory", "postgres"].includes(process.env.RATE_LIMIT_BACKEND ?? "memory")
)
  issues.push("RATE_LIMIT_BACKEND must be memory or postgres");
if (!["true", "false"].includes(process.env.LANGSMITH_TRACING ?? "false"))
  issues.push("LANGSMITH_TRACING must be true or false");
if (!["fixture", "nebius", "local"].includes(provider))
  issues.push("AI_PROVIDER must be fixture, nebius, or local");
if (
  production &&
  provider === "fixture" &&
  process.env.ALLOW_DEMO_MODE !== "true"
)
  issues.push("Production fixtures require ALLOW_DEMO_MODE=true");
if (provider === "nebius") {
  if (!process.env.NEBIUS_API_KEY) issues.push("NEBIUS_API_KEY missing");
  if (!/^nvidia\/.*nemotron/i.test(process.env.NEBIUS_MODEL ?? ""))
    issues.push(
      "Choose an exact NVIDIA Nemotron ID from the authenticated Nebius catalog",
    );
}
if (provider === "local" && !process.env.LOCAL_AI_MODEL)
  issues.push("LOCAL_AI_MODEL missing");
if (production && provider === "local")
  issues.push(
    "A loopback local model is not reachable from Vercel; use this mode only for local development",
  );
if (
  production &&
  (provider !== "fixture" ||
    process.env.TAVILY_API_KEY ||
    process.env.PERSISTENCE_PROVIDER === "postgres")
) {
  if ((process.env.SESSION_SIGNING_SECRET ?? "").length < 32)
    issues.push(
      "SESSION_SIGNING_SECRET requires at least 32 random characters",
    );
  if ((process.env.LIVE_AI_ACCESS_CODE ?? "").length < 24)
    issues.push("LIVE_AI_ACCESS_CODE requires at least 24 random characters");
  if (process.env.RATE_LIMIT_BACKEND !== "postgres")
    issues.push(
      "Production external calls require RATE_LIMIT_BACKEND=postgres",
    );
}
if (
  !["browser", "postgres"].includes(
    process.env.PERSISTENCE_PROVIDER ?? "browser",
  )
)
  issues.push("PERSISTENCE_PROVIDER must be browser or postgres");
if (
  process.env.PERSISTENCE_PROVIDER === "postgres" ||
  process.env.RATE_LIMIT_BACKEND === "postgres"
) {
  if (!process.env.DATABASE_URL) issues.push("DATABASE_URL missing");
  else
    try {
      const url = new URL(process.env.DATABASE_URL);
      if (!["postgres:", "postgresql:"].includes(url.protocol))
        issues.push("DATABASE_URL must be PostgreSQL");
      if (
        production &&
        !["localhost", "127.0.0.1"].includes(url.hostname) &&
        !["verify-full", "verify-ca"].includes(
          url.searchParams.get("sslmode") ?? "",
        )
      )
        issues.push("Hosted PostgreSQL must use verified TLS");
    } catch {
      issues.push("DATABASE_URL is invalid");
    }
}
if (
  process.env.LANGSMITH_TRACING === "true" &&
  (!process.env.LANGSMITH_API_KEY?.trim() ||
    /^(?:PASTE_|YOUR_|PLACEHOLDER|<)/i.test(
      process.env.LANGSMITH_API_KEY.trim(),
    ))
)
  issues.push("LANGSMITH_API_KEY missing or placeholder for enabled tracing");
for (const name of Object.keys(process.env))
  if (
    /^NEXT_PUBLIC_.*(API_KEY|SECRET|TOKEN|DATABASE_URL|ACCESS_CODE)$/.test(name)
  )
    issues.push(`Potential credential exposed in client variable: ${name}`);
console.log(
  JSON.stringify(
    {
      mode: production ? "production" : "development",
      provider,
      configValid: issues.length === 0,
      liveIntegrationsVerified: false,
      issues,
    },
    null,
    2,
  ),
);
process.exit(issues.length ? 1 : 0);
