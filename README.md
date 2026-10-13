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

The smoke command does not load `.env.local` automatically; use `node --env-file=.env.local scripts/smoke-nebius.mjs` when ready. It makes one inference request; do not run it against an account without authorized credits.

## Honest limits

Browser-local guest storage is implemented. Production authenticated Postgres persistence is not connected; a migration is supplied, with row-level policies, for future Supabase integration. Account creation is not exposed. Multiple-choice grading is deterministic. Written-answer rubric grading, generated diagnostics, and generated roadmaps have validated live-provider routes and review interfaces; they are tested with mock transport, not verified live. The roadmap also supplies a deterministic curated schedule. Two-question scores do not establish broad mastery. There are no real learner evaluation results yet.

Install Playwright's matching Chromium browser before browser checks: `npx playwright install chromium`. This workspace installed it under `.playwright`; use `$env:PLAYWRIGHT_BROWSERS_PATH='E:/neurolearn-ai/.playwright'` here. Normal installations use Playwright's default cache. Build/dev use the supported Webpack option because Turbopack child-process CSS processing failed in this Windows environment.

See [build status](docs/BUILD_STATUS.md), [deployment](docs/DEPLOYMENT.md), [compliance](docs/HACKATHON_COMPLIANCE.md), and [architecture](docs/ARCHITECTURE.md).
