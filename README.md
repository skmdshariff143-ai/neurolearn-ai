# NeuroLearn AI

Learn Anything. Understand Deeply. Grow Continuously.

An adaptive educational workspace built with Next.js, React, strict TypeScript, Tailwind, Radix-based UI primitives, Zod, Recharts, and KaTeX. Three curated learning paths demonstrate diagnosis, explanation switching, multilingual teaching, interactive labs, assessment, and recorded progress.

**Development preview.** Fixture tutoring is deterministic and labelled; it is not live AI. Nebius/NVIDIA hackathon runtime compliance is **BLOCKED** until genuine inference succeeds. The public repository and protected deployments contain approved fixture commit d4e6fb0. Later local improvements have not been pushed. [Protected fixture Preview](https://neurolearn-2nymaifwu-shaik-mahammad-shariff-s-projects.vercel.app/) is verified for authorized demonstration; see [actual hosted checks and limits](docs/VERCEL_DEPLOYMENT_RESULT.md).

For the requested limited-access preview, set `NEXT_PUBLIC_SAFE_PREVIEW=true` before building and follow [the restricted preview checklist](docs/PREVIEW_DEPLOYMENT_CHECKLIST.md). This disables uploads, stored learner data and live integrations, preserves old browser records without reading them, and labels every page. All Deployments Vercel authentication is active; no bypass links are provided. Normal local development remains available with the flag false.

Local REA improvements add concept-based suggested revision dates, recall-before-reread prompts and scaffolded self-checks derived from recorded activity, plus a changed worked-example strategy on the second reteach. These suggestions do not claim mastery or measured learning gains. See [research, evaluation and original adaptations](docs/REA.md). They are not yet deployed.

The roadmap now includes resumable learning courses with on-demand lessons, diagnostic/practice attempts, two bounded reteaching rounds and recorded completion checks. Learn accepts limited text PDFs (2 MiB/20 pages), extracts locally, searches real page passages and offers explicit optional private hosted saving. Classroom document inference requires consent and a live provider; fixtures do not pretend to use notes. Course/document exports and deletion are available. See [final PRD inventory](docs/PRD.md) and [database schema](docs/DATABASE_SCHEMA.md).

Apply migration 003 after 002 for the private library API. Embedded SQL verification is not hosted verification. Generated keys, multilingual quality, optional account linking, hosted operations and public launch remain outstanding. The full universal-platform PRD is not yet complete.

## Run locally

Node 24 is recommended. Exact resolved versions are in package-lock.json.

```powershell
npm ci
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev
```

Open http://localhost:3000. Choose Learn → Electrical transformers → classroom. Take a diagnostic, explore explanations and a lab, complete post-lesson practice, and review Progress. No account or personal details are required. Guest records live in the browser.

## Providers

- `AI_PROVIDER=fixture`: curated demonstrations of transformers, Python loops, and quadratics. Production requires `ALLOW_DEMO_MODE=true` and retains labels.
- `AI_PROVIDER=nebius`: set server-side `NEBIUS_API_KEY` and the exact `NEBIUS_MODEL` ID available in your Token Factory account. Mandatory integration track for the Nebius × NVIDIA Global AI Hackathon. No silent fallback.
- `AI_PROVIDER=nvidia`: direct NVIDIA API adapter (`https://integrate.api.nvidia.com/v1`). Set server-side `NVIDIA_API_KEY` and optional `NVIDIA_MODEL` (defaults to `nvidia/nemotron-3.5-super-vl-120b-a12b`). Note: This standalone NVIDIA integration is distinct from Nebius Token Factory and does not alone satisfy the Nebius hackathon runtime requirement.
- `AI_PROVIDER=gemini`: Google Gemini free-tier developer adapter (set `GEMINI_API_KEY`).
- `AI_PROVIDER=groq`: Groq free-tier developer adapter (set `GROQ_API_KEY`).
- `AI_PROVIDER=local`: use a loopback OpenAI-compatible inference server, e.g. Ollama's `/v1` endpoint, with `LOCAL_AI_MODEL` set to an installed model. Hardware/model availability has not been verified.

### Universal Research-to-Teaching Engine
The platform includes an open-source, multi-source pedagogical research coordinator (`src/lib/research/`):
- **Sources queried**: Wikipedia (English, Telugu, Hindi), OpenAlex (open-access academic literature), Crossref (scholarly metadata), OpenStax / MIT OCW (peer-reviewed textbooks), and Tavily (web search).
- **Security & Quality**: Built-in SSRF protection (rejects private/cloud metadata IPs and loopbacks), untrusted prompt injection sanitization, canonical URL normalization, and authority/relevance weighting.
- **Golden Educational Benchmark**: 10 canonical benchmark topics across STEM, Humanities, Languages, and Financial Literacy tested deterministically in `tests/golden-evaluation.test.ts`.

Tavily retrieval is verified by a real HTTP 200 smoke (four results, two accepted sources). Research is opt-in and requires `TAVILY_API_KEY`. Tracing is opt-in using `LANGSMITH_API_KEY` and `LANGSMITH_TRACING=true`. Inputs and outputs are redacted from tracing. LangSmith trace write/read, redaction and synthetic feedback are verified. Full live-model tracing and source-grounded teaching remain unverified without authorized inference. None of these keys are needed for ordinary demo development.

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

Final integration preparation: [classified deployment readiness](docs/DEPLOYMENT_READINESS.md) lists exact private credentials and service setup; [manual deployment checklist](docs/DEPLOYMENT_CHECKLIST.md) separates local checks, live verification and approved publication. Both migrations (002 then 003) are required for the full hosted guest library.
