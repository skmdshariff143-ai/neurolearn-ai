# Phase 10 deployment instructions

Final PRD: apply migration 003 after 002 before enabling hosted courses/notes. PostgreSQL smoke now also writes synthetic courses/notes and tests private read/write isolation, then deletes scratch guests. Actual hosted verification remains BLOCKED. Library uses existing persistence/access settings. No paid storage or original PDF retention introduced.

Install/prebuild copies locked PDF.js worker/license into ignored public assets; include generated assets in deployment output. Verify PDF extraction/unsupported handling, consent, citations, separate deletion, course resume, guest isolation and operational retention on the approved hosted URL. Accounts, backup/load/retention verification remain launch gaps. No deployment executed.

No push or deployment is authorized yet. Source configuration is prepared; no Vercel project, database, account, or billable resource was created. Do not run a deploy or marketplace provisioning command until the owner approves it.

For exact credential setup, classified evidence and manual publication steps, use [DEPLOYMENT_READINESS.md](DEPLOYMENT_READINESS.md) and [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md). LangSmith regional/workspace settings are optional and documented in .env.example; leave them unset unless your account requires them. The hosted database smoke checks SQL permission denial for cross-guest overwrites and cascading deletion; a connection failure is not an isolation pass.

## 1. Verify locally

Use Node 24 and the committed lockfile. Copy `.env.example` to ignored `.env.local` if absent; never overwrite an existing secret file. Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, then `npm run test:e2e`. Install matching Chromium with `npx playwright install chromium` if needed. In this workspace set `PLAYWRIGHT_BROWSERS_PATH=E:/neurolearn-ai/.playwright`. Browser tests start an isolated production fixture server and clear external credentials from its environment; stop your own local preview first if port 3000 is occupied.

Run `npm run check:config -- --production`. This validates configuration only, not provider availability or database connectivity. Build uses Webpack because of the previously observed Windows Turbopack child-process issue.

## 2. Open public fixture demo configuration

Required server variables: `AI_PROVIDER=fixture`, `ALLOW_DEMO_MODE=true`, `PERSISTENCE_PROVIDER=browser`, `RATE_LIMIT_BACKEND=memory`, `LANGSMITH_TRACING=false`. Leave external keys unset. All original guest paths remain available with visible demonstration labels. Hosted sync/live controls report unavailable instead of faking success. This demo is useful for review but does not meet mandatory live hackathon inference requirements.

## 3. Prepare PostgreSQL and restricted live access

Use an existing PostgreSQL database, or an owner-selected no-card/free option only after checking its terms. Supabase's transaction-pool connection is suitable for serverless Node clients; copy the connection details from the account dashboard and use verified TLS. Nothing was provisioned automatically.

An authorized database administrator applies `db/migrations/002_guest_postgres.sql`, followed by `db/migrations/003_learning_entities.sql`, **once and in that order** on a new database. On an existing database where 002 is already applied, apply only the missing 003 after reviewing the schema. These migrations are not idempotent; do not rerun them blindly. Do not apply `db/proposals/001_authenticated_supabase.sql` as part of this guest deployment. Both migrations are tested with embedded PostgreSQL but have not run against a hosted database.

Create a separate login role using your database's secure credential workflow and grant it membership:

```sql
-- The login role/password must already exist; do not put passwords in this file.
GRANT neurolearn_app TO neurolearn_runtime;
```

The login must be neither superuser, RLS-bypass, nor owner of the application tables. The repository rejects those roles. It needs CONNECT permission on your database and inherited privileges from neurolearn_app. Use a pooled URL for that restricted login in server-only `DATABASE_URL`, with `sslmode=verify-full` (or verify-ca with an appropriate trusted CA). Never disable certificate verification to make a smoke test pass. Do not use an admin connection as the application's runtime URL.

Set `RATE_LIMIT_BACKEND=postgres`. Set `PERSISTENCE_PROVIDER=postgres` only when enabling hosted guest storage; it can remain `browser` while PostgreSQL supplies live-call quotas. Generate independent cryptographically random `SESSION_SIGNING_SECRET` (32+ characters) and `LIVE_AI_ACCESS_CODE` (24+). Use a password manager and enter values directly into `.env.local`/Vercel secrets; do not paste secrets into chat or Git. Only share the organizer code through an approved private judging channel, not an API key.

Run `npm run smoke:postgres -- --confirm-live`. It exercises the actual repository, server grading and two isolated scratch guests, then deletes its own scratch data. Do not claim hosted persistence until its evidence says passed. In production, Settings unlocks a signed one-hour access cookie. Hosted storage then requires explicit consent; future curated assessments sync, existing local scores stay local. Cookie loss has no recovery flow. Configure an operator retention/deletion process before general production onboarding; no automatic retention job is enabled.

## 4. Verify real integrations

Add only server-side variables, never NEXT_PUBLIC secrets:

| Service | Configuration | Verification |
| --- | --- | --- |
| Nebius | `NEBIUS_API_KEY`, `NEBIUS_MODEL`, `AI_PROVIDER=nebius` | `npm run models:nebius`, select an exact available JSON-capable NVIDIA Nemotron ID, then `npm run smoke:nebius -- --confirm-live` |
| Tavily | `TAVILY_API_KEY` | `npm run smoke:tavily -- --confirm-live` retrieves relevant educational HTTPS sources |
| LangSmith | `LANGSMITH_API_KEY`, `LANGSMITH_TRACING=true`, `LANGSMITH_PROJECT=neurolearn-ai` | `npm run smoke:langsmith -- --confirm-live` writes a synthetic redacted trace and confirms remote readback/feedback |

Each command records private evidence under ignored `.integration-evidence`. Confirmed live calls may consume authorized credits; no purchase or auto-billing is initiated. Nebius performs an authenticated catalog lookup before the actual adapter request. Missing credentials or confirmation cause BLOCKED/no call; failures never switch to fixtures. Tavily research is used only with a live lesson provider; fixture research requests are rejected to avoid wasting credits. Tracing visibility alone does not verify inference or educational outcomes.

## 5. Approved publishing sequence

After owner approval, push the prepared clean commit to the verified public origin. After separate deployment approval, import that repository into the intended Vercel account/project, select Next.js and Node 24, and use `npm run build`. `vercel.json` sets the framework and 60-second API function duration; no storage lives on local SQLite/disk. Enter the chosen demo/live variables for the correct Preview/Production scope. Do not enable paid plans or integrations. Confirm account limits support this configuration before deployment.

No deploy command was executed here. For live mode, configuration checks and PostgreSQL/Nebius smoke evidence must pass first; for fixture mode, retain the honest labels and compliance blocker. A preview publication also needs owner permission.

## 6. Verify the actual deployed URL

On the approved URL, test all ten pages on desktop/mobile, keyboard access, provider status, errors and missing-key behavior, diagnostic → reteach → post-test → progress, each lab, organizer unlock/expiry, source citations, and explicit cloud opt-in/deletion if enabled. Use two independent browser contexts to verify guest isolation. Verify a real Nebius lesson at the deployed URL, inspect redacted LangSmith traces and token counts, and record the exact model/latency/evidence. Do not replace this with localhost or embedded test results. Deployment, live URL verification, remote PostgreSQL checks and hosted trace visibility are all pending.

Local-model development remains available through a loopback OpenAI-compatible server. The dev server binds 127.0.0.1; a Vercel function cannot reach your laptop's localhost model. Local hardware/model readiness is unverified and is not a substitute for the mandatory Nebius/NVIDIA runtime.

## Tavily integration audit — 2026-10-14

Server adapter uses POST https://api.tavily.com/search with server-side Bearer authentication from TAVILY_API_KEY (official endpoint checked). Four basic-search results, no generated search answer/raw pages, explicit automatic-parameter opt-out, safe search, 15-second timeouts and at most two attempts constrain usage. Normalized one-hour cache, in-flight deduplication and 100-entry bound are process-local, not a shared serverless budget. Production external access requires the existing organizer access gate and PostgreSQL-backed quotas.

Retrieved results are schema validated, filtered by Tavily score >=0.5, deduplicated and constrained to HTTPS citation URLs. These are ranking/format checks, not factual trust certification or proof of topic relevance. A live provider receives untrusted source excerpts through teachingPrompt; classroom shows real returned source links with an explicit warning that every claim is not verified. Fixture-to-research generation is rejected. No new sources or successful live lessons are claimed.

Added direct safe-preview research rejection and missing/placeholder key detection, including in the authorized smoke runner. Added regression checks proving no fetch occurs for placeholders or direct safe-preview calls. Preview remains fixture-only; no remote settings, credentials or deployment protection changed in this task. Browser static-build scan for TAVILY_API_KEY, api.tavily.com and tvly- returned no matches. .env.local is Git-ignored/untracked; only .env.example is tracked among environment files. Limited secret scan: 117 files, zero candidates.

Actual smoke: npm run smoke:tavily -- --confirm-live returned BLOCKED (TAVILY_API_KEY missing); no external request made. Typecheck/lint passed; 58 unit/integration tests passed in 13 files; production build passed with restricted preview variables. Live relevance, real citations and research-to-lesson behavior remain BLOCKED/unverified. A working live/local inference provider is additionally needed for grounded lesson generation; standalone Tavily smoke needs only the search key.

Manual setup: rotate the key exposed in chat, enter the replacement privately in E:\neurolearn-ai\.env.local as TAVILY_API_KEY, then run npm run smoke:tavily -- --confirm-live from the project folder. Do not put it in NEXT_PUBLIC variables or Preview environment. Keep Preview LANGSMITH_TRACING=false and NEXT_PUBLIC_SAFE_PREVIEW=true with all integration keys absent. Evidence is written under ignored .integration-evidence/tavily.json; inspect returned educational titles/URLs for topical relevance without treating rank as authority. No purchases or credit replenishment is authorized.

Restricted-preview browser verification after Tavily safeguards: 8/8 passed in 1.2 minutes, including desktop/mobile keyboard and accessibility checks.

## Tavily repair and operating policy — 2026-10-14

Live retrieval smoke is VERIFIED (HTTP 200; four valid results, two accepted citations). The cause was score-only filtering: all returned scores were below 0.5. Search now retains >=0.5 matches and admits >=0.35 only with at least two meaningful topic terms and half the topic terms in source title/content. This heuristic does not certify factual truth. HTTPS/schema checks remain; URL fragments are ignored for deduplication. There is one request per uncached search, a 15-second timeout, four basic results, process-local bounded cache, and no automatic retries. Production live usage still requires the organizer gate and PostgreSQL-backed quotas.

The smoke uses the same search/validation implementation as classroom research, records sanitized HTTP/authentication/schema/score/filter diagnostics, and never emits response bodies, headers or keys. DNS/TLS/timeouts, invalid JSON/schema, empty results, permissions and credit/rate limits are separately classified. Evidence remains ignored under .integration-evidence. Do not infer end-to-end grounding from retrieval alone.

The private local key is present and not shadowed; no local-file edits were necessary. No manual Tavily debugging is required. Other integration/hosting blockers and actual regression results are recorded in BUILD_STATUS.md. Keep all provider/database keys absent from restricted Vercel Preview and LANGSMITH_TRACING=false; no remote settings/protection were changed by this repair.

## LangSmith live verification — 2026-10-14

LangSmith is VERIFIED for real trace write/read and synthetic feedback. The existing npm run smoke:langsmith -- --confirm-live passed with the privately configured key, local tracing enabled and safe preview false. npm run smoke is not defined; no script alias was added. Trace ID: 01a1383b-cd24-7000-8000-01234236b3bc. Remote inputs/outputs have redacted=true and exclude the synthetic private sentinel. Feedback with synthetic_smoke_contract score=1 was written and read back. A subsequent bounded readRun/readProject check confirmed the trace belongs to configured project neurolearn-ai and current workspace access is accepted. No custom endpoint/workspace ID was necessary. API calls succeeded; exact HTTP status codes were not captured by the existing SDK smoke. Evidence is ignored under .integration-evidence/langsmith.json and langsmith-project.json.

The telemetry client now uses a 10-second request timeout and maxRetries=0 for trace ingestion. Inspection of the installed SDK shows that ordinary API reads hardcode up to four retries despite callerOptions; this SDK limitation is recorded rather than claiming all retries are disabled. The smoke retains up to three bounded visibility reads and now explicitly checks project association. SDK readRun currently works but reports deprecation after January 31, 2027; future SDK migration remains maintenance work.

The existing tracing boundaries cover adaptive-lesson, provider-inference, structured-learning-task and educational-research. A synthetic-transport regression executes actual tutor, diagnostic, written misconception evaluation and simpler reteaching services, inspects eight trace starts/updates, verifies private sentinel omission and preserves aggregate rubric/misconception metrics. It makes no service/model calls. Browser-only deterministic scoring/state transitions are not sent as private learner events. Full live-model workflow tracing remains unverified because Nebius/local inference availability has not been verified. Synthetic trace feedback is not educational efficacy.

Restricted Preview still requires LANGSMITH_TRACING=false and no key; safePreview blocks tracing even if accidentally configured. No Tavily requests, remote settings changes, pushes, deployments or purchases occurred in this task. Tavily retrieval remains VERIFIED; Nebius/NVIDIA and hosted PostgreSQL remain BLOCKED. Current test/build results are recorded below.

## Hosted PostgreSQL setup

See [POSTGRES_SETUP.md](POSTGRES_SETUP.md) for documentation-based Supabase Free compatibility, exact restricted-role setup, migration approval boundary, pooling/TLS and synthetic-cleanup checks. No target is configured and no hosted test has passed.

## Staged live promotion and rollback (prepared only)

Do not reuse fixture Preview secrets or deploy it as a live environment. After separate approval, provision/link a distinct live project, establish restricted PostgreSQL plus verified TLS/migrations/isolation/cleanup, configure strong organizer/session controls and shared quotas, then enable authorized Nebius/Tavily/LangSmith server-side. Apply NEXT_PUBLIC_SAFE_PREVIEW=false only for that explicit live build. Verify actual hosted guest flows and redacted inference before inviting adult pilot users. No child onboarding or public production launch is authorized here.

Record the exact release SHA, environment versions (not secret values), migration/catalog state and verified rollback deployment. Smoke the protected live candidate before promotion. If inference, quotas, isolation or protection fails, stop traffic/disable live access and revert to the last verified protected release without deleting learner records. Prefer forward-compatible schema changes; a deployment rollback must not automatically DROP schema or reverse data migrations. Database restoration/destructive recovery requires separate target approval and a verified backup. Free-tier backups/retention and real rollback remain untested.

Explicit --target preview still produced Production in CLI 64.0.2 on this project. The task-created deployment was canceled/deleted, with no assigned alias. Do not retry or bypass protection until the correct target behavior is resolved with Vercel. No working deployment URL is available.
