# Final integration and deployment readiness — 2026-10-13

## Current readiness — 2026-10-14

Tavily retrieval is VERIFIED: repaired score-only filtering, then live smoke returned HTTP 200, four schema-valid/HTTPS results and two topical citations. LangSmith trace write/read, redaction, synthetic feedback and project association are VERIFIED on 2026-10-14; real inference-workflow tracing remains unverified. Nebius key/model and hosted DATABASE_URL are absent; those integrations remain BLOCKED. Research-to-lesson generation is unverified without working inference. No safe hosted preview exists; the prior unintended Production-classified attempt was canceled/deleted. No remote publication occurred in this repair.

Local typecheck, lint, 66 tests, restricted-preview configuration and production build passed. Browser/static-secret results and the exact root cause are recorded in BUILD_STATUS.md. Restricted preview retains all live-call restrictions. See DEPLOYMENT.md for the repaired search policy and operational limits. Earlier dated credential/publication statements below are historical.

### Earlier evidence (historical)

2026-10-14 limited-preview update: follow PREVIEW_DEPLOYMENT_CHECKLIST.md for the current requested deployment. A dedicated build-time safe-preview policy disables live calls, uploads and persistent learner records, uses temporary memory and visibly labels every page. Existing records remain untouched. Limited access must additionally be verified with Vercel deployment protection; no hosted verification/publication has occurred. Historical open-fixture configuration below is not the configuration for this restricted preview.

Audit baseline: ee83885, clean working tree. This report distinguishes local evidence from live verification. No account, purchase, database, public push or deployment was initiated.

## Status

| Classification | Scope | Evidence / remaining work |
| --- | --- | --- |
| Verified | Local application | 55 tests rerun; strict TypeScript, lint and production build passed; 18/18 desktop/mobile browser tests with keyboard/axe passed in 1.7 minutes |
| Verified | Local privacy/security behavior | Fixture labels, bounded requests, missing-key/production access failures, private guest capability checks, embedded SQL isolation and secret-pattern scan |
| Partially verified | PostgreSQL persistence | Both migrations and actual repository SQL pass embedded PostgreSQL tests. Hosted TLS, restricted role, isolation, deletion, latency and backups unverified |
| Partially verified | Tavily | Adapter filtering, caching, deduplication/error behavior tested; genuine educational search and research-to-lesson citations unverified |
| Partially verified | LangSmith | Redacted tracing and synthetic evaluation/readback smoke implemented; remote visibility, usage and actual lesson evaluation unverified |
| Partially verified | Nebius/NVIDIA | Validated adapter and authenticated catalog + real structured inference smoke prepared; account model access/inference unverified |
| Partially verified | Vercel | Next.js Node runtime/build, generated PDF worker, server-only keys, external database design and duration configuration prepared. No Vercel build or hosted URL tested |
| Blocked | Live services | No TAVILY_API_KEY, LANGSMITH_API_KEY, NEBIUS_API_KEY/NEBIUS_MODEL or DATABASE_URL found; no .env.local exists. All four smokes return BLOCKED without service requests |
| Blocked | Hackathon runtime | Real NVIDIA open-source model on Nebius has not run; fixtures/local models/Tavily/LangSmith do not satisfy this requirement |
| Blocked | Public publication | Owner approval required for GitHub push and separately for any Vercel deployment |
| Not implemented | Production capabilities | Optional account linking/recovery, versioned concurrent-device merge, automatic retention maintenance, verified backup/recovery operations |
| Not implemented | Evaluation/submission | Actual learner pilot/results, fluent/subject review, public video and completed Devpost submission |

Final checks also passed development/explicit production-fixture configuration, correctly rejected invalid backend/tracing flags, and found no secret-pattern candidates in 113 source paths. Read-only remote inspection returned no refs; no push was made. Production dependency audit returned zero advisories. Known development-tool advisories remain documented in SECURITY.md; neither audit nor axe certifies complete security/accessibility.

## Exact configuration and secure setup

Values go only into an ignored .env.local using your editor/password manager, or Vercel server environment settings. Never paste them into chat, command arguments, screenshots, Git or NEXT_PUBLIC variables. If .env.local already exists, edit it without overwriting it. Only create it from .env.example when absent. API keys and the database URL contain credentials; model IDs, project names and flags are configuration, not secrets.

| Service | Credential | Additional configuration |
| --- | --- | --- |
| Tavily | TAVILY_API_KEY from your authorized dashboard | Research is explicit; no SDK install needed. A live teaching provider is required for research-to-lesson |
| LangSmith | LANGSMITH_API_KEY for the intended workspace | LANGSMITH_TRACING=true, LANGSMITH_PROJECT=neurolearn-ai; LANGSMITH_ENDPOINT only for another region; LANGSMITH_WORKSPACE_ID only for multi-workspace keys |
| Nebius Token Factory | NEBIUS_API_KEY with authorized inference access/credits | AI_PROVIDER=nebius; NEBIUS_MODEL must exactly match an available NVIDIA Nemotron catalog ID. No assumed ID or automatic billing |
| Hosted PostgreSQL | DATABASE_URL for a restricted runtime login, including its encoded password | Verified TLS; PERSISTENCE_PROVIDER=postgres to store progress/library; RATE_LIMIT_BACKEND=postgres for live quotas |
| Production protection | SESSION_SIGNING_SECRET and LIVE_AI_ACCESS_CODE | Independently generated random values, at least 32 and 24 characters respectively; not provider keys |

### Tavily

Open your existing [Tavily dashboard](https://app.tavily.com), confirm promotional/free-credit limits and disable any automatic paid usage if applicable. Copy an authorized key directly into the private environment file. Run `npm run smoke:tavily -- --confirm-live` once. It uses the actual adapter for a fixed educational query, validates relevant HTTPS sources and records title/URL evidence. The [official quickstart](https://docs.tavily.com/documentation/quickstart) documents key retrieval and Bearer authentication.

That smoke verifies retrieval only. After live teaching is verified, unlock Settings and enable Tavily research in the classroom. Confirm that the lesson displays retrieved citations, source URLs genuinely support the claims, errors preserve history, and repeated requests use the bounded cache where the same server process serves them. Do not claim end-to-end grounding from a search-only smoke.

### LangSmith

Use your existing [LangSmith account](https://smith.langchain.com), choose the intended workspace/project, and create a scoped service key where available. Keep within existing credits; do not enable a paid plan. Configure the variables above. [Official setup](https://docs.langchain.com/langsmith/create-account-api-key) explains optional endpoint/workspace settings. Run `npm run smoke:langsmith -- --confirm-live` once, then inspect the recorded trace ID in that project. It checks remote trace readback, redaction and synthetic feedback readback.

Then inspect a genuine learning workflow: redacted inputs/outputs, inference/retriever spans, latency, errors and token usage where actually returned. Use evaluations/cases.json with independent subject/language reviewers. Synthetic feedback validates telemetry plumbing, not clarity, educational quality or learning improvement. Do not upload learner identities or private PDF contents as evaluation data.

### Nebius/NVIDIA

Obtain usable access through existing authorized credits or organizer assistance. If activation requires a payment card, unavailable credit or a purchase, stop this service; do not substitute another provider for compliance. See the [official quickstart](https://docs.tokenfactory.nebius.com/quickstart).

Store NEBIUS_API_KEY privately, then run `npm run models:nebius`. It lists authenticated NVIDIA Nemotron IDs without inference or printing the key. Select an available JSON-capable ID as NEBIUS_MODEL. Run `npm run smoke:nebius -- --confirm-live` only with authorized credits. The smoke checks catalog membership and uses the real app adapter for one structured lesson, at most one transient retry. Preserve private evidence. Mandatory compliance remains BLOCKED unless it reports a genuine successful request; repeat a real lesson at the hosted URL after approved deployment.

### PostgreSQL

Use an existing authorized hosted database or personally select a no-card/free option without enabling billing. Choose a new dedicated database/project or review an existing schema before changes. An administrator applies 002 then 003 once, stopping on errors; use a provider SQL editor or psql with ON_ERROR_STOP enabled. Never apply the old account proposal or blindly rerun migrations.

Create a separate login through the provider's secure role/password workflow; grant CONNECT on the chosen database and membership in neurolearn_app. It must inherit privileges and must not own tables or have superuser/BYPASSRLS. Never use the administrator URL as DATABASE_URL. Configure a provider-supported serverless pool connection for that login with verified TLS (normally sslmode=verify-full). Never disable certificate validation. [Supabase connection documentation](https://supabase.com/docs/guides/database/connecting-to-postgres) describes direct and pooled options; provider/role/pool compatibility still needs a real test.

Set both PostgreSQL flags and independently generated production protection values. Run `npm run smoke:postgres -- --confirm-live`. It uses random synthetic guests, tests server grading, course/note persistence, separate-guest reads, rejected cross-guest overwrites and cascading deletion, and cleans up its scratch guests. No other learner records are intentionally modified. Then test the actual app with two separate browser contexts, including cloud consent, manual library save/load, delete and cookie expiry. Arrange retention and backup/recovery operations before general production data collection.

## Vercel compatibility and publication sequence

Node 24 is supported in the [current Vercel documentation](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions). Use Next.js preset, repository root, npm ci/install and npm run build. Existing vercel.json sets 60-second API duration; verify actual account/function limits. PDF worker/license are generated by install/prebuild; they must be present in deployment output. No production route relies on persistent SQLite, local disk uploads or .integration-evidence files. Browser storage stays browser-local; PostgreSQL is external. Local loopback inference cannot run on Vercel. Process caches are ephemeral and not globally shared; live quotas use PostgreSQL.

For a labelled fixture preview, use AI_PROVIDER=fixture, ALLOW_DEMO_MODE=true, PERSISTENCE_PROVIDER=browser, RATE_LIMIT_BACKEND=memory and LANGSMITH_TRACING=false; leave external keys unset. This can become an approved public demonstration, but not a live-compliant hackathon entry. For real inference, pass local and hosted checks and configure the live/DB protection variables above. Apply variables separately to Preview/Production using [Vercel environment settings](https://vercel.com/docs/environment-variables); redeploy after changes. Never store secrets in vercel.json or Git.

1. Review the prepared local commit and explicitly approve the public GitHub push. Check remote state first, then use `git push -u origin main` only when approved; do not force-push.
2. Separately approve deployment. In your intended Vercel account/team, import skmdshariff143-ai/neurolearn-ai, choose Node24/Next.js and review the free plan/limits. Import can create a deployment immediately, so do not perform it before approval. Linked Git pushes can automatically deploy; control the integration before later pushes.
3. Set the chosen fixture/live server variables in the correct environment before releasing. Do not activate paid marketplace resources or automatic paid usage.
4. Test the resulting URL: all routes, mobile/keyboard/axe, languages/labs, diagnostic/reteach/post-test/progress, course resume, PDF parsing/consent/citations/deletion, access expiry, API failures and two-guest hosted isolation. Validate live Nebius at that URL if claiming compliance; inspect real Tavily citations/LangSmith traces.
5. Record the approved commit, deployment URL, runtime/model evidence, actual failures/limits and date. Recheck privacy/retention before public learner data collection. Record/upload a public video under three minutes and complete the separate submission checklist.

No live URL exists in this audit. Vercel platform build, deployment and production operations are unverified; passing localhost is insufficient.
