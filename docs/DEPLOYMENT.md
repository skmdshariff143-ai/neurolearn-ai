# Phase 10 deployment instructions

Final PRD: apply migration 003 after 002 before enabling hosted courses/notes. PostgreSQL smoke now also writes synthetic courses/notes and tests private read/write isolation, then deletes scratch guests. Actual hosted verification remains BLOCKED. Library uses existing persistence/access settings. No paid storage or original PDF retention introduced.

Install/prebuild copies locked PDF.js worker/license into ignored public assets; include generated assets in deployment output. Verify PDF extraction/unsupported handling, consent, citations, separate deletion, course resume, guest isolation and operational retention on the approved hosted URL. Accounts, backup/load/retention verification remain launch gaps. No deployment executed.

No push or deployment is authorized yet. Source configuration is prepared; no Vercel project, database, account, or billable resource was created. Do not run a deploy or marketplace provisioning command until the owner approves it.

## 1. Verify locally

Use Node 24 and the committed lockfile. Copy `.env.example` to ignored `.env.local` if absent; never overwrite an existing secret file. Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, then `npm run test:e2e`. Install matching Chromium with `npx playwright install chromium` if needed. In this workspace set `PLAYWRIGHT_BROWSERS_PATH=E:/neurolearn-ai/.playwright`. Browser tests start an isolated production fixture server and clear external credentials from its environment; stop your own local preview first if port 3000 is occupied.

Run `npm run check:config -- --production`. This validates configuration only, not provider availability or database connectivity. Build uses Webpack because of the previously observed Windows Turbopack child-process issue.

## 2. Open public fixture demo configuration

Required server variables: `AI_PROVIDER=fixture`, `ALLOW_DEMO_MODE=true`, `PERSISTENCE_PROVIDER=browser`, `RATE_LIMIT_BACKEND=memory`, `LANGSMITH_TRACING=false`. Leave external keys unset. All original guest paths remain available with visible demonstration labels. Hosted sync/live controls report unavailable instead of faking success. This demo is useful for review but does not meet mandatory live hackathon inference requirements.

## 3. Prepare PostgreSQL and restricted live access

Use an existing PostgreSQL database, or an owner-selected no-card/free option only after checking its terms. Supabase's transaction-pool connection is suitable for serverless Node clients; copy the connection details from the account dashboard and use verified TLS. Nothing was provisioned automatically.

An authorized database administrator applies **only** `db/migrations/002_guest_postgres.sql`. Do not apply the old `db/proposals/001_authenticated_supabase.sql` as part of this guest deployment. Migration 002 is tested with embedded PostgreSQL but has not run against a hosted database.

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
