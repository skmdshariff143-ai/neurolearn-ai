# NeuroLearn AI

Learn Anything. Understand Deeply. Grow Continuously.

An adaptive educational workspace built with Next.js, React, strict TypeScript, Tailwind, Radix-based UI primitives, Zod, Recharts, and KaTeX. Three curated learning paths demonstrate diagnosis, explanation switching, multilingual teaching, interactive labs, assessment, and recorded progress.

**Development preview.** Fixture tutoring is deterministic and labelled; it is not live AI. Nebius/NVIDIA hackathon runtime compliance is **BLOCKED** until genuine inference succeeds. Nothing has been publicly deployed or pushed by this build.

## Run locally

Node 24 is recommended. Exact resolved versions are in package-lock.json.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. Choose Learn → Electrical transformers → classroom. Take a diagnostic, explore explanations and a lab, complete post-lesson practice, and review Progress. No account or personal details are required. Guest records live in the browser.

## Providers

- `AI_PROVIDER=fixture`: curated demonstrations of transformers, Python loops, and quadratics. Production requires `ALLOW_DEMO_MODE=true` and retains labels.
- `AI_PROVIDER=nebius`: set server-side `NEBIUS_API_KEY` and the exact `NEBIUS_MODEL` ID available in your Token Factory account. Use an NVIDIA Nemotron model for the intended track. No silent fallback.
- `AI_PROVIDER=local`: use a loopback OpenAI-compatible inference server, e.g. Ollama's `/v1` endpoint, with `LOCAL_AI_MODEL` set to an installed model. Hardware/model availability has not been verified.

Research is opt-in and requires `TAVILY_API_KEY`. Tracing is opt-in using `LANGSMITH_API_KEY` and `LANGSMITH_TRACING=true`. Inputs and outputs are redacted from tracing. None of these keys are needed for ordinary demo development.

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
# Only with usable inference credentials in the environment:
npm run smoke:nebius
```

Browser tests start the production server; run `npm run build` first. They exercise desktop and mobile classroom journeys, Telugu/Hindi switching, diagnosis/reteaching, persistence, labs, keyboard navigation, API errors, and axe scans on all ten pages.

Phase 10 smoke commands load the ignored `.env.local` automatically. `npm run models:nebius` retrieves your authenticated Nemotron catalog without inference. After selecting an exact available JSON-capable model, run `npm run smoke:nebius -- --confirm-live` to verify the actual app adapter with one teaching request (at most one transient retry). Equivalent commands are `smoke:tavily`, `smoke:langsmith`, and `smoke:postgres`. Evidence goes into ignored `.integration-evidence/`; absent credentials report BLOCKED without an external call. Only run confirmed live checks with authorized credits/accounts.

## Honest limits

Browser guest storage remains the default. An opt-in PostgreSQL guest repository is implemented with a restricted runtime role, forced row-level security, private guest cookies, server-graded assessments, and deletion. Migration/repository isolation tests run against embedded PostgreSQL; **hosted persistence is not verified**. The deployable migration is `db/migrations/002_guest_postgres.sql`; the old Supabase account design is retained under `db/proposals`, not applied. No named accounts are exposed.

Production external calls and hosted storage require an organizer access code, signed one-hour access cookie, and shared PostgreSQL request budgets. Configure these in server environment variables; learners unlock access in Settings without entering API keys. Open public fixtures need none of those credentials. Live-provider failure never switches to fixtures. See [deployment steps](docs/DEPLOYMENT.md) and run `npm run check:config -- --production` before releasing.

Multiple-choice grading is deterministic. Written-answer review, generated diagnostics, and generated roadmaps remain unverified live. Traces redact learner text, retain actual token usage/latency and aggregate evaluation counts, and flush after route completion. The roadmap also provides a curated schedule. Two-item scores do not establish mastery; no real learner evaluation results exist.

Install Playwright's matching Chromium browser before browser checks: `npx playwright install chromium`. This workspace installed it under `.playwright`; use `$env:PLAYWRIGHT_BROWSERS_PATH='E:/neurolearn-ai/.playwright'` here. Normal installations use Playwright's default cache. Build/dev use the supported Webpack option because Turbopack child-process CSS processing failed in this Windows environment.

See [build status](docs/BUILD_STATUS.md), [deployment](docs/DEPLOYMENT.md), [compliance](docs/HACKATHON_COMPLIANCE.md), and [architecture](docs/ARCHITECTURE.md).
