# Verified build status — 2026-10-13

## Universal Research-to-Teaching Engine Upgrade — 2026-10-17

All 12 phases implemented, verified, and passing:
- Research Sources: OpenStax / MIT OpenCourseWare, Wikimedia / Wikipedia (EN, TE, HI), OpenAlex, Crossref, and Tavily adapter.
- Source Quality Engine: Canonical URL deduplication, topic relevance filtering, authority weighting, broken URL rejection, and SSRF defense (protocol, host, private IP range checks).
- Security & Untrusted Input: Untrusted excerpt sanitization against prompt-injection overrides, bounded excerpt lengths (1200 chars), request timeouts (8000ms), no private student data cached.
- AI Providers Supported: Nebius Token Factory (NVIDIA Nemotron - primary hackathon integration), Google Gemini free-tier, Groq free-tier, Local Ollama, and Fixture/Preview mode.
- Explanation Engine: Universal structured lesson prompt, bounded JSON repair for malformed outputs, multilingual support (English, Telugu, Hindi), prerequisite detection, and citation validation.
- Adaptive Classroom UI: Universal research toggle, learning level selection, real progress stage indicators (Finding sources -> Checking evidence -> Preparing explanation -> Creating examples -> Ready to learn), verified source citation cards with licenses and publishers, and new adaptive follow-up actions (Explain prerequisites, Why my answer is wrong, Suggest next lesson).
- Automated Verification Results:
  - 130 Vitest unit/integration tests passing (17 test files, 100% pass rate).
  - 20 Playwright E2E browser tests passing (Desktop & Mobile viewports).
  - 8 Playwright Preview E2E tests passing (Fixture isolation & 0 WCAG 2.1 AA Axe violations across all routes).
  - TypeScript typecheck (tsc --noEmit): 0 errors.
  - ESLint (eslint .): 0 errors, 0 warnings.
  - Both production builds (next build --webpack in standard and preview modes): 17/17 routes compiled successfully.
  - Secret scan (npm run check:secrets): 0 issues across 139 files.
  - Configuration check (npm run check:config): configValid: true, 0 issues.

## Verified Preview release deployment (commit 6b03ae2) — 2026-10-14 / 2026-10-17

Preview deployment dpl_2Hes9pKGG2hX5bt3EK4Hpa6deJd4 is VERIFIED READY in workspace shaik-mahammad-shariff-s-projects and project neurolearn-ai.
- Deployed SHA: 6b03ae2b22bfa34b4d8eba37703a70f5a47b099f on branch fixture-preview
- Deployment Target: Preview (target: null), never Production
- Deployment URL: https://neurolearn-p6rp0nceo-shaik-mahammad-shariff-s-projects.vercel.app/
- Branch Alias: https://neurolearn-ai-git-fixt-c75bbe-shaik-mahammad-shariff-s-projects.vercel.app/
- All Deployments SSO Authentication: VERIFIED active (ssoProtection.deploymentType: all), zero bypass tokens
- Anonymous Access: VERIFIED denied (HTTP 302 to https://vercel.com/sso-api across pages and API endpoints)
- Automatic Git Deployments: VERIFIED disabled (gitProviderOptions.createDeployments: disabled)
- Environment: Exactly 6 fixture-only Preview variables active; zero live keys/passwords/database URLs
- Runtime Health: Zero error/fatal runtime log records and zero HTTP >= 500 records in inspected telemetry windows
- Functional Checks: Truthful Settings copy, bounded reteaching strategy switches, active recall prompts, self-check guides, deep-linked topics, and chart ARIA accessibility verified.

## Current verified integration status — 2026-10-14

Tavily retrieval and LangSmith trace/redaction/synthetic-feedback readback are VERIFIED by earlier live evidence, preserved without repeat calls. Nebius key/model are absent; mandatory NVIDIA/Nebius runtime is BLOCKED. Supabase project zwylxrtytktpynmwlzmg is identified, but DATABASE_ADMIN_URL still has a placeholder password and restricted DATABASE_URL is absent. Hosted migrations, runtime permissions, isolation and cleanup are BLOCKED/NOT TESTED; no remote database mutation occurred. Public GitHub main is approved d4e6fb0255952e2be48481ac6bb046036e8a1755; later local changes are not pushed.

Vercel project neurolearn-ai exists in shaik-mahammad-shariff-s-projects with Preview authentication, six fixture variables and no live credentials. This run reverified protection/settings and all 117 approved archive files. Official CLI 64.0.2 dry run with --target preview succeeded, but actual deployment was unexpectedly classified Production. Immediately canceled (CANCELED, aliasAssigned=false) and deleted dpl_6QTPyHxgV9uKSzKawZRHKwY7ENiL. No working URL or safe hosted access is claimed; further deployment attempts are stopped pending resolution of target behavior. No protection was weakened, purchase made or new source pushed.

Web lesson output now must cite supplied [source:N] identifiers and rejects missing/out-of-range IDs. This validates citation identity, not whether every claim is factually supported. A mocked-transport regression verifies acceptance/rejection; real grounded AI teaching remains blocked on inference.


## Read-only assessment update — 2026-10-14

Target metadata VERIFIED against the private configuration: project zwylxrtytktpynmwlzmg, direct host db.zwylxrtytktpynmwlzmg.supabase.co, port 5432, requested database postgres. The ignored administrator file exists, but its password is still a placeholder and no shell override exists. Authentication is BLOCKED; no database request was attempted. Live server version, connected role/database, TLS handshake, extensions, schema conflicts, migration state and grants are NOT TESTED. Prior IPv6 TCP reachability is not authenticated/TLS verification.

Installed pg-connection-string parsing of sslmode=verify-full enables TLS without disabling certificate or hostname checks; NODE_TLS_REJECT_UNAUTHORIZED is not disabled. This is local configuration/driver evidence only. Vercel Preview settings were independently read back: all six required fixture values match, none are branch-scoped, and no database/provider credential entries exist. No remote settings were modified; no hosted app/authentication access test is claimed.

Enter the actual percent-encoded database password privately in .env.database-admin.local; do not paste it in chat. DATABASE_ADMIN_URL is for tooling only, and DATABASE_URL must later use the restricted runtime login. Hosted write/delete smoke is intentionally not run under the current read-only authorization.

## Activation assessment — 2026-10-14

Owner supplied Supabase project reference zwylxrtytktpynmwlzmg. Its API endpoint is identified; the exact selected database pooler host is still missing and no Supabase connector is callable. Private DATABASE_URL and DATABASE_ADMIN_URL are absent. The read-only preflight stopped before any external request; database version, TLS, pooling, role privileges and whether migrations 002/003 already exist are NOT VERIFIED. No migration, role/password setup or synthetic hosted write occurred. Exact target approval is pending and will be requested only after reference/host and catalog assessment are available.

Use ignored .env.database-admin.local for a temporary DATABASE_ADMIN_URL, read only by the assessment/migration process; Next.js must not receive administrator credentials. Keep restricted DATABASE_URL in .env.local. Neither file nor connection value should enter Git or chat. Non-secret project reference and exact Connect-panel host may be shared. The migration order and restricted-role SQL in POSTGRES_SETUP.md remain unchanged.


## Hosted PostgreSQL preparation — 2026-10-14

Selected candidate: Supabase Free; not provisioned. Existing standard PostgreSQL schema appears compatible; no required extension/schema rewrite. DATABASE_URL is absent and no target/migration approval exists. npm run smoke:postgres returned BLOCKED/no external request. Hosted TLS, pooler-role compatibility, isolation and cleanup remain unverified. Follow POSTGRES_SETUP.md for owner steps; preserve migration order 002 then 003.

Local improvements: require hosted sslmode=verify-full in development/production, reject globally disabled certificate verification, cap per-instance pool at one, reject runtime CREATEDB/CREATEROLE, fail closed for direct databasePool calls in safe Preview, and verify final synthetic cleanup without recreating guests. Migrations are unchanged. Tavily/LangSmith status is preserved; no live integration calls or Vercel changes occurred.


## LangSmith live verification — 2026-10-14

LangSmith is VERIFIED for real trace write/read and synthetic feedback. The existing npm run smoke:langsmith -- --confirm-live passed with the privately configured key, local tracing enabled and safe preview false. npm run smoke is not defined; no script alias was added. Trace ID: 01a1383b-cd24-7000-8000-01234236b3bc. Remote inputs/outputs have redacted=true and exclude the synthetic private sentinel. Feedback with synthetic_smoke_contract score=1 was written and read back. A subsequent bounded readRun/readProject check confirmed the trace belongs to configured project neurolearn-ai and current workspace access is accepted. No custom endpoint/workspace ID was necessary. API calls succeeded; exact HTTP status codes were not captured by the existing SDK smoke. Evidence is ignored under .integration-evidence/langsmith.json and langsmith-project.json.

The telemetry client now uses a 10-second request timeout and maxRetries=0 for trace ingestion. Inspection of the installed SDK shows that ordinary API reads hardcode up to four retries despite callerOptions; this SDK limitation is recorded rather than claiming all retries are disabled. The smoke retains up to three bounded visibility reads and now explicitly checks project association. SDK readRun currently works but reports deprecation after January 31, 2027; future SDK migration remains maintenance work.

The existing tracing boundaries cover adaptive-lesson, provider-inference, structured-learning-task and educational-research. A synthetic-transport regression executes actual tutor, diagnostic, written misconception evaluation and simpler reteaching services, inspects eight trace starts/updates, verifies private sentinel omission and preserves aggregate rubric/misconception metrics. It makes no service/model calls. Browser-only deterministic scoring/state transitions are not sent as private learner events. Full live-model workflow tracing remains unverified because Nebius/local inference availability has not been verified. Synthetic trace feedback is not educational efficacy.

Restricted Preview still requires LANGSMITH_TRACING=false and no key; safePreview blocks tracing even if accidentally configured. No Tavily requests, remote settings changes, pushes, deployments or purchases occurred in this task. Tavily retrieval remains VERIFIED; Nebius/NVIDIA and hosted PostgreSQL remain BLOCKED. Current test/build results are recorded below.


## Current integration repair status — 2026-10-14

This section supersedes earlier dated credential/integration claims below.

- **Tavily VERIFIED (retrieval only):** the private local key is nonblank, non-placeholder, syntactically well formed and not shadowed by shell variables. Local safe-preview flag is false. One bounded diagnostic request returned HTTP 200, four valid results/HTTPS citations and zero accepted results under the old score >=0.5 rule (scores 0.4797236, 0.46774563, 0.3866482, 0.13710469). The current failed evidence had hidden the cause; it was not an authentication failure.
- **Repair:** keep >=0.5 ranking acceptance; accept scores >=0.35 only when at least two meaningful topic terms and at least half of the query terms occur in title/content. Preserve citation validation and reject weak/unrelated results. Deduplicate fragment variants. This lexical/ranking heuristic does not certify source truth or educational quality.
- **Live adapter smoke PASSED:** npm run smoke:tavily -- --confirm-live returned HTTP 200; four valid results, two accepted citations and two rejected. Accepted references: Electromagnetic Induction and Faradays Law of Induction (electronics-tutorials.ws) and Transformer (Wikipedia). Recorded latency 809ms. Evidence contains real titles/URLs and sanitized diagnostics under ignored .integration-evidence/tavily.json. Exactly two live Tavily requests were made in this repair, no automatic retries, no purchase and no other live-service requests.
- **Diagnostics:** distinguish authentication (401), permissions (403), rate/credit limits (429), usage caps (432/433), service failures (5xx), DNS/TLS/network/timeouts, invalid JSON/schema, empty results and application filtering. Raw error bodies, headers and keys are never printed. Tavily uses one request per uncached search, with a 15-second timeout. No hidden retry can exceed the smoke budget.
- **LangSmith BLOCKED for verification:** non-placeholder local key and tracing flag exist, but current key has not been tested. Previous placeholder-blocked evidence is historical. This task deliberately disabled tracing for the Tavily diagnostic/smoke and did not call LangSmith. Authorized workspace access/readback and redaction/feedback smoke are still required.
- **Nebius/NVIDIA BLOCKED:** local key and model are absent. Authorized inference access and an exact available NVIDIA Nemotron model plus a successful actual runtime smoke are required. Tavily success does not satisfy hackathon inference requirements.
- **Hosted PostgreSQL BLOCKED:** DATABASE_URL is absent. A restricted non-owner, non-BYPASSRLS runtime login, migrations 002/003, verified TLS and hosted isolation/deletion smoke are required. Embedded SQL tests are not hosted verification.
- **Deployment BLOCKED:** prior Vercel project configuration exists, but the unintended Production-classified attempt was canceled/deleted. No working protected preview URL or hosted-access verification exists. No push/deploy performed in this repair. The approved public source remains d4e6fb0; new local changes need separate push/deployment approval.
- **Grounded teaching remains partially verified:** retrieval now works; no live inference provider is available to verify an actual research-to-lesson response. Fixture mode rejects research instead of pretending to ground simulated lessons.
- **Local regression:** typecheck/lint passed, 66 tests passed in 13 files, restricted-preview configuration and production build passed. Browser and final secret checks are recorded in BUILD_STATUS.md when complete.

The local environment file was not modified and remains ignored/untracked. No manual Tavily debugging or key replacement is necessary to obtain the verified retrieval result. Keys previously shared in chat should be rotated privately if they have not already been replaced. Restricted Preview must continue to omit all provider/database keys, use NEXT_PUBLIC_SAFE_PREVIEW=true, AI_PROVIDER=fixture, ALLOW_DEMO_MODE=true, PERSISTENCE_PROVIDER=browser, RATE_LIMIT_BACKEND=memory and LANGSMITH_TRACING=false. No protection or remote environment settings were changed.

### Earlier evidence (historical)

## Tavily verification attempt — 2026-10-14

Tavily CLI 0.1.8 and all eight installed Tavily skills are visible in the current Codex session. Repeated `tvly auth --json` checks returned `authenticated: false` despite reported browser authorization; authenticated CLI readiness is not established. A real keyless educational search for Python beginner functions succeeded and returned three results with titles, content, scores and HTTPS source URLs: learnpython.org, w3schools.com/python and python.org. The initial search had a Windows console encoding failure; rerunning with process-local UTF-8 output succeeded.

Inspected the existing server-side Tavily REST adapter and its lesson-generation call path: Bearer authentication from TAVILY_API_KEY, Zod response/citation validation, HTTPS filtering, deduplication/cache and redacted traces already exist. No replacement adapter or application behavior changes were made. The ignored .env.local exists but has no TAVILY_API_KEY. `npm run smoke:tavily -- --confirm-live` returned BLOCKED with no application external request; private evidence is in .integration-evidence/tavily.json. Application integration remains unverified; CLI keyless search is not proof of application integration or research-to-lesson correctness. Browser OAuth credentials are separate from the application's API key.

Actual checks: typecheck and lint passed; 57/57 tests in 13 files passed; 8/8 local protected-fixture-preview Playwright tests passed against the existing build, including rejected live research APIs on desktop/mobile. No rebuild was run, as requested. Configuration check failed because LangSmith tracing is enabled without a valid key; this is separate from Tavily. Source secret scan found no candidates in 117 tracked/non-ignored files; Tavily token-pattern scan found none in 53 local frontend-bundle/private-evidence files. Both scans are limited, not complete guarantees. Ignore checks confirmed .env.local and integration evidence are excluded. No credentials were printed, no GitHub writes or deployment changes were made, and hosted Vercel environment/protection was not independently inspected. Preserve the preview policy: NEXT_PUBLIC_SAFE_PREVIEW=true, fixture provider, and no TAVILY_API_KEY in the Vercel fixture preview.

To unblock local application verification, privately edit the existing root .env.local and set TAVILY_API_KEY to an existing authorized Tavily dashboard key (no NEXT_PUBLIC_ prefix). Preserve other entries, do not send the key in chat, and do not copy it into Vercel fixture-preview scopes. Run the existing smoke command again after configuration; promote integration status only when it records passed source evidence. Research-to-lesson additionally requires a verified live teaching provider.

## Limited-access fixture preview — verified locally 2026-10-14

Started at clean e196154. Preserved full-mode features/data structures; introduced NEXT_PUBLIC_SAFE_PREVIEW build-time policy. Restricted preview forces labelled fixtures, disables live/search/tracing/workflow/access/storage APIs, removes upload UI and rejects PDF extraction, disables hosted/export controls, sets noindex and displays disclosure on every route. Shared guestStorage uses transient browser memory; existing localStorage records are ignored and preserved. Policy is explicitly opt-in for this restricted build; normal development remains unchanged with flag false. Preview catalog/smoke commands are blocked, and Nebius smoke also checks actual provider kind to prevent fake runtime evidence.

Executed: final typecheck/lint passed; **56/56 unit/integration tests across 13 files** passed; normal production build passed; original **18/18 desktop/mobile browser tests passed in 1.8 minutes**. Safe-preview production preflight/build passed; dedicated **8/8 desktop/mobile browser tests passed in 1.2 minutes**, covering ignored/preserved existing records, no persistent learning writes, reset on reload, visible fixture labels, disabled file/live/hosted controls, rejected direct APIs, every-route axe/overflow scans and keyboard access. Preview credential-negative preflight correctly rejected a synthetic key (no key value printed). Safe-mode Nebius smoke/catalog commands returned BLOCKED/no request. Production dependency audit: zero advisories. Secret-pattern scan: no candidates in 117 source files; tracked data inventory contains no databases/real learner exports/credential files, only .env.example. Ignore checks confirmed credential, database, upload and learner-export exclusions. This is limited review, not guaranteed detection of every PII/secret format.

**Decision:** locally prepared for a protected fixture preview, not verified on Vercel. Owner approval for public GitHub push and separately for project/deployment is outstanding. Vercel project/free-account protection settings, anonymous access denial, authorized reviewer access and actual hosted URL tests remain required. No publication, purchase, hosted migration or deployment occurred. Uploads/private persistence must remain disabled; hosted access isolation and real Nebius/NVIDIA runtime remain unverified/BLOCKED. Exact environment, Git publication commands and protected Preview steps are in PREVIEW_DEPLOYMENT_CHECKLIST.md. The current local .next artifact is the safe-preview build; rebuild with flag false before running normal-mode browser tests.

## Final integration and deployment readiness re-audit

Started at clean ee83885; no application/data-structure rewrite. Read PRD, schema, deployment, compliance, environment and adapter/smoke code. Confirmed .env.local absent and no process credentials for Tavily, LangSmith, Nebius or PostgreSQL (presence flags only; no secret values printed). Independent rerun: typecheck, lint, **55/55 tests**, production build and **18/18 Playwright tests in 1.7 minutes** passed, including desktop/mobile, keyboard/axe, existing course/PDF/learning flows and API controls. Production dependency audit: zero advisories. These are local/embedded results, not a Vercel platform or hosted infrastructure pass.

Corrected conflicting migration documentation: full guest deployment requires 002 then 003 once, never the old account proposal. Added DEPLOYMENT_READINESS.md and DEPLOYMENT_CHECKLIST.md with exact private credential/setup steps and Verified / Partially verified / Blocked / Not implemented classifications. Added optional LangSmith region/workspace environment comments. Preflight now rejects unsupported rate-limit backends and tracing flags. Hosted DB smoke now requires SQL permission denial (42501) for cross-guest overwrites and verifies cascading deletion, in addition to existing persistence/read isolation. These new hosted assertions are prepared, not live-verified.

All four smoke commands were executed without configuration: **BLOCKED/no external service request**. Mandatory Nebius/NVIDIA runtime remains BLOCKED. Verified current official Tavily/LangSmith/Nebius/Vercel/Supabase documentation; that verifies setup references, not account activation/free-plan entitlement or runtime success. No account, purchase, migration on a hosted database, public push/deployment, video or submission occurred. Remaining production features/operational gaps are listed in the readiness report.

Final preflight rerun after script edits: typecheck/lint and 55 tests passed; development and explicit production-fixture config passed; negative config checks correctly rejected unsupported rate backend and invalid tracing flag. Secret scan found no candidates in 113 tracked/non-ignored source paths; whitespace check passed. Read-only git ls-remote returned no remote refs. New hosted smoke rerun remained BLOCKED/no request. Public push/deployment still requires separate approval.

## Final PRD implementation milestone

Audited actual HEAD f0dbfca (not stale ae11bb5); starting tree clean. Reran baseline typecheck, lint, 46 tests and production build. Extended existing routes/components without a rebuild: course outline/modules/on-demand lessons, diagnostic/practice attempts, bounded adaptive state replay, targeted gaps, resume/actual check completion, progress display, PDF text extraction/retrieval/consent, local/hosted library saving/deletion/export, normalized migration 003 and private API. See PRD.md inventory/plan and DATABASE_SCHEMA.md.

Final verification: typecheck, lint, **55 unit/integration tests across 12 files**, production build, development config and explicit production-fixture config passed. Final production-server Playwright run: **18/18 passed in 1.9 minutes** on desktop/mobile, including actual authored text-PDF extraction/retrieval, consent enforcement, fixture refusal, deletion, course assessment/resume, existing learning flows, axe scans on all pages, keyboard/overflow and library API fail-closed/origin regressions. Production audit with PDF.js: **zero advisories**. Secret-pattern scan: no candidates in 111 source paths; limited detection only. All four credential smoke commands rerun: **BLOCKED, no external call**. Earlier run had 16 passes and two PDF-test selector failures, fixed by selecting the application alert instead of Next's hidden announcer. A browser run launched before build completion also failed to start and is not counted as a pass.

Embedded PostgreSQL tests execute migration 003 and actual library repository writes with recorded attempts/revision/concept rows, repeat saves, cross-guest read/write rejection and cascaded deletion. These are not hosted tests. PDF.js registry compatibility checked: 6.4.299, Node >=22.13 or >=24; development uses Node24. Worker/license copied on install/prebuild, vendor worker excluded from application lint. PDF limits: 2 MiB, 20 pages, five notes, 100k extracted characters. Original binaries are not uploaded/retained.

Fixed during this milestone: Telugu/Hindi combining-mark search, sparse-answer grading, reversed test answer choices, test type narrowing, vendor-worker lint scope and hidden-announcer selector. No failed test was reported as passing.

**Outstanding:** optional authenticated account linking/recovery; hosted TLS/role/isolation, backup/retention/load verification; cross-device conflict handling; live generated-course/model and multilingual/source review; real learner pilot; approved remote push/deployment/live-URL testing/video/submission. Credentials are absent. Full universal-platform PRD and public launch are not complete. Existing five high development-tool advisories remain. No purchase, push or public deployment occurred.

Started in an empty E:\neurolearn-ai folder with Node 24.21.0 and npm 11.19.0. The requested remote returned no refs. A local `main` Git repository now points to the requested origin. No remote push, public deployment, purchase, or account registration has occurred.

## Phase evidence

| Phase | Implemented and checked | Remaining limits |
| --- | --- | --- |
| 1 Foundation | Next.js/React/strict TS/Tailwind; shared layout; docs; production build | None for local foundation |
| 2 Classroom | Topic entry, level/language preferences, labelled lessons, strategy instructions, history, bounded topic-specific follow-up context | Live inference unverified |
| 3 Adaptive learning | Diagnostic/post MCQs, validated transitions, tentative gaps, reteach links, rubric/generated-assessment APIs with review interfaces | Live grading unverified; generated keys require review |
| 4 Integrations | Nebius/local adapters, Tavily caching/filtering/deduplication, redacted LangSmith traces, retry/timeout limits, smoke command | External live verification blocked by credentials/hardware/access |
| 5 Progress | Browser repository, real recorded scores/history/revisions, charts/table, export/deletion | Hosted Postgres/auth not connected; RLS migration not applied |
| 6 Demonstrations | Transformer SVG, fixed Python trace, quadratic formula/graph, Telugu/Hindi content | Fluent-speaker/subject review not conducted |
| 7 QA/security | Typecheck, lint, 27 tests, build, desktop/mobile browser suite, axe checks, secret-pattern scan, production audit | Formal penetration test, shared abuse control, legal review pending |
| 8 Deployment preparation | Vercel instructions, server-side env config, MIT license/dependency inventory | Approval and hosted deployment needed; production backend unresolved |
| 9 Submission preparation | Rules reviewed, compliance table, submission draft, 2:45 video script, tool-feedback prompts, pilot protocol | Runtime evidence, video, public demo/code, pilot results and submission absent |

## Executed verification

- `npm run typecheck`: passed after final context/diagram changes.
- `npm run lint`: passed.
- `npm test`: 27 tests passed across five files under Vitest 5.0.4. Covers grading, transitions, input limits, languages, provider failures/retries, model validation, research filtering/cache, rubric/day-sequence validation, guest persistence, and same-origin handling for loopback/canonical server URLs.
- `npm run build`: passed with Next.js 16.4.0 using supported Webpack. Generated ten requested pages and `/api/tutor`, `/api/workflow`, `/api/status`.
- Final production-server `npm run test:e2e`: **10/10 passed in 1.4 minutes**, including final context/diagram and loopback-origin changes. Covers language switching, diagram action, diagnosis/reteach/post-test, reload persistence, labs, routes, keyboard skip-link, viewport overflow, API validation/cross-origin errors, successful localhost/127.0.0.1 requests, and axe WCAG tags on every page at desktop and mobile viewports.
- `npm audit --omit=dev --json`: zero production advisories. Full audit: five high development advisories from the unpatched braces chain; see SECURITY.md.
- `npm run smoke:nebius`: BLOCKED (missing key/model); no inference call made. This is not a passed live test.
- Source/tests/scripts/docs/env-example secret-pattern scan: no matching private keys or credential token patterns. A limited scan does not prove absence of every secret format.

Earlier failures were fixed or worked around: JSX error, hydration lint issues, outdated vulnerable dependencies, missing matching Playwright browser, incorrect history selector, cold development compilation timeouts, and an origin mismatch between 127.0.0.1 and the framework's internal localhost URL. Origin validation now uses the incoming host and protocol; hostile/malformed origins remain rejected. Turbopack CSS child-process processing failed on Windows; build/dev use Webpack. Matching Chromium was downloaded to ignored `.playwright`. Browser sockets/build processes require outside-sandbox execution here.

Actual rendered screenshots are in `docs/screenshots`. Axe checks do not certify full WCAG compliance. Live models, real learner outcomes, deployment, hosted DB isolation, and full production readiness remain unverified.

## Phase 10 — deployment and real-integration preparation

Baseline ae11bb5 was clean. GitHub API/read-only Git checks confirm a public, empty `main` repository with the intended origin. No push, cloud provisioning, public deployment, billing change or cloud migration occurred.

Implemented: organizer access gate with signed expiring cookies; shared PostgreSQL quotas; streamed body bounds and cross-site Fetch Metadata checks; CSP; optional PostgreSQL guest repository with forced RLS, restricted-role checks, server grading, idempotent writes and deletion; consent/hosted-sync controls; chronology-preserving offline reconciliation; model-catalog command; adapter-based live smoke/evidence scripts; concurrent Tavily deduplication and rejection of fixture research; redacted nested LangSmith tracing, standard token metadata, aggregate evaluation metrics and serverless flush; config/secret checks; Vercel config and Node 24 engine. The original learning features remain.

### Actual Phase 10 verification

- `npm run typecheck`: passed on final application changes.
- `npm run lint`: passed.
- `npm test`: **46/46 passed in ten files**, including embedded PostgreSQL migration/RLS tests, actual repository tests through an embedded client bridge, token/role/body/access checks and offline reconciliation. These are not hosted PostgreSQL/network tests.
- `npm run build`: passed; ten useful pages plus five API routes are generated.
- Final `npm run test:e2e`: **14/14 passed in 1.7 minutes**, desktop/mobile learning flows and axe scans on all pages, plus production fail-closed access/storage, cross-site rejection and CSP regressions.
- `npm run check:config`: passed for development fixture mode. `ALLOW_DEMO_MODE=true` with `check:config -- --production`: passed for the explicit production fixture configuration; reports live verification false.
- Production dependency audit after new dependencies: **zero advisories**. Full install/audit retains five high development-only advisories in the unchanged unpatched braces/Next ESLint chain.
- `models:nebius` and all four smoke commands were executed without credentials: **BLOCKED/no external call**, not passes. Private evidence files record the missing configuration. No `.env.local` or keys/database URL exist in this workspace/process.
- `npm run check:secrets`: passed with no candidates across tracked/non-ignored source paths. `git diff --check`: passed. Final staged checks are recorded below. The scanner reports filenames only and cannot guarantee detection of every secret format.

Resolved during this phase: reserved SQL identifier found by executing the migration; typed LangSmith feedback project association; TypeScript smoke-runner CommonJS/top-level-await compatibility; and an empty-value/newline false positive in the secret scanner. No failed check was counted as passed.

**Deployment state:** ready to review/publish a labelled fixture demo after owner approval. Real hosted AI/storage remains blocked by credentials, restricted PostgreSQL setup and smoke verification. Public source push, hosted URL checks, actual video, pilot data and Devpost submission remain pending. See PHASE10_AUDIT.md, DEPLOYMENT.md and SUBMISSION_CHECKLIST.md for boundaries and next steps.

Final staged whitespace check passed. Final staged secret-pattern check examined 98 tracked/non-ignored source paths and found no candidates. The changes span 58 files, including the preserved old migration moved to proposals. Final production dependency audit remains zero advisories; full audit remains five high development-only advisories. A labelled fixture preview is running locally for review; no public deployment exists.

## Protected deployment attempt — 2026-10-14

Approved source remains d4e6fb0255952e2be48481ac6bb046036e8a1755. CLI authentication succeeded in the intended Hobby workspace. Created neurolearn-ai link-only, verified Preview authentication and all six restricted fixture variables. Forbidden integration credentials are absent. GitHub is connected; automatic Git deployments are disabled.

Deployment: BLOCKED. The API unexpectedly classified the Git-SHA request with omitted target as Production. Immediately canceled it (confirmed CANCELED, aliasAssigned false, zero READY deployments), then deleted it. No safe hosted Preview URL exists. Anonymous/authorized access and hosted application checks are NOT TESTED. No protection was weakened, purchase made or source push performed.

Local verification: approved source 56 unit/integration tests and 8 restricted-preview browser/accessibility tests passed; typecheck, lint, preview configuration, secret scan and preview-variable production build passed. Subsequent local LangSmith placeholder safeguards passed 57 tests, typecheck, lint and secret scan. They remain uncommitted and were excluded from the remote Git deployment request. LangSmith smoke: BLOCKED placeholder, no external request. Local .env.local is ignored; Vercel Preview tracing remains false without a key.

Next: resolve Preview-only target selection before retrying and then verify hosted authentication and all learning flows. Rotate the LangSmith key exposed in chat and insert its replacement privately into the local ignored environment file. Do not promote to Production or create bypass links.

## Tavily integration audit — 2026-10-14

Server adapter uses POST https://api.tavily.com/search with server-side Bearer authentication from TAVILY_API_KEY (official endpoint checked). Four basic-search results, no generated search answer/raw pages, explicit automatic-parameter opt-out, safe search, 15-second timeouts and at most two attempts constrain usage. Normalized one-hour cache, in-flight deduplication and 100-entry bound are process-local, not a shared serverless budget. Production external access requires the existing organizer access gate and PostgreSQL-backed quotas.

Retrieved results are schema validated, filtered by Tavily score >=0.5, deduplicated and constrained to HTTPS citation URLs. These are ranking/format checks, not factual trust certification or proof of topic relevance. A live provider receives untrusted source excerpts through teachingPrompt; classroom shows real returned source links with an explicit warning that every claim is not verified. Fixture-to-research generation is rejected. No new sources or successful live lessons are claimed.

Added direct safe-preview research rejection and missing/placeholder key detection, including in the authorized smoke runner. Added regression checks proving no fetch occurs for placeholders or direct safe-preview calls. Preview remains fixture-only; no remote settings, credentials or deployment protection changed in this task. Browser static-build scan for TAVILY_API_KEY, api.tavily.com and tvly- returned no matches. .env.local is Git-ignored/untracked; only .env.example is tracked among environment files. Limited secret scan: 117 files, zero candidates.

Actual smoke: npm run smoke:tavily -- --confirm-live returned BLOCKED (TAVILY_API_KEY missing); no external request made. Typecheck/lint passed; 58 unit/integration tests passed in 13 files; production build passed with restricted preview variables. Live relevance, real citations and research-to-lesson behavior remain BLOCKED/unverified. A working live/local inference provider is additionally needed for grounded lesson generation; standalone Tavily smoke needs only the search key.

Manual setup: rotate the key exposed in chat, enter the replacement privately in E:\neurolearn-ai\.env.local as TAVILY_API_KEY, then run npm run smoke:tavily -- --confirm-live from the project folder. Do not put it in NEXT_PUBLIC variables or Preview environment. Keep Preview LANGSMITH_TRACING=false and NEXT_PUBLIC_SAFE_PREVIEW=true with all integration keys absent. Evidence is written under ignored .integration-evidence/tavily.json; inspect returned educational titles/URLs for topical relevance without treating rank as authority. No purchases or credit replenishment is authorized.

Final Tavily-task browser verification: npm run test:e2e with restricted preview variables passed 8/8 tests in 1.2 minutes, including desktop/mobile route disclosures, keyboard/axe checks and rejected live research/upload/storage APIs.

Final repair regression: 8/8 restricted-preview Playwright tests passed in 1.3 minutes on desktop/mobile, including keyboard/axe scans across all routes and rejection of live research, document and persistence APIs. Production browser-asset value scan examined 104 files and found zero configured credential matches. Limited source secret scan examined 117 paths with zero candidates; git diff --check passed. These are localhost checks, not hosted Vercel verification.

Final LangSmith-task regression: typecheck and lint passed; 67/67 tests passed in 14 files; restricted-preview configuration and production build passed; 8/8 desktop/mobile browser and accessibility checks passed in 1.6 minutes. Limited secret scan: 118 files, no candidates. Browser credential-value scan: 104 files, zero matches. No live Tavily/inference/database request was made in this task.

PostgreSQL-task local checks so far: typecheck/lint passed; 74 tests passed in 15 files, including actual embedded migrations/repository isolation and non-creating cleanup. Restricted-preview config/build passed and 8/8 preview desktop/mobile browser/accessibility tests passed in 1.3 minutes. A separate normal fixture build passed; its full 18-test browser suite is being completed. No hosted test is counted as passed.

Final PostgreSQL-task validation: full preserved-mode browser suite 18/18 passed in 1.8 minutes, in addition to restricted-preview 8/8 in 1.3 minutes. Both production builds passed. Typecheck/lint and 74/74 tests passed. Limited secret scan examined 120 source paths with no candidates; 104 browser assets and tracked files contained no configured credential values. git diff --check passed. Original migrations unchanged; no remote migrations/creation, live persistence test, push or deployment performed. DATABASE_URL remains unset.

Activation-assessment local regression: typecheck/lint passed; 74/74 tests passed in 15 files; normal fixture browser suite 18/18 passed in 2.1 minutes; safe-preview browser/accessibility suite 8/8 passed in 1.4 minutes. Both production builds and preview configuration passed. Limited secret scan examined 120 files with no candidates; whitespace check passed. These are local/embedded results. Exact pooler host and ignored administrator credential file remain missing. No hosted catalog/role/TLS assessment, migration, persistence/isolation/deletion smoke, push or deployment occurred. Original migration and application code are unchanged.

Read-only assessment validation: npm run typecheck and lint passed; npm test passed 74/74 in 15 files, including database migration/repository, TLS/role and preview safety tests. Safe-preview configuration and production build passed. Limited secret scan: 120 paths, no candidates. No application/migration code changed. Hosted write/delete tests were prohibited and not run. Authentication/version/TLS handshake/catalog/grants remain BLOCKED/NOT TESTED on the placeholder password.

Final autonomous-pass validation: typecheck/lint passed; 75/75 unit/integration tests passed in 15 files. Normal fixture browser suite 18/18 passed in 1.8 minutes; restricted Preview 8/8 passed in 1.3 minutes, including keyboard/axe and all ten routes. Normal and Preview production builds passed; safe configuration passed. Secret scan: 121 paths, no candidates. Web-citation tests use synthetic transport and made no live search/inference request. No credential file was modified. The canceled unexpected Production deployment was removed, and no safe hosted URL/access result is claimed.

Final guard hardening also rejects malformed/padded identifiers or a fabricated citation alongside a valid citation. The final 75-test rerun and lint passed, and the final restricted-preview build passed. A concurrent typecheck briefly failed while next build regenerated .next/types; rerunning typecheck sequentially after build passed. This failed intermediate check is not counted as a pass. Final Vercel inventory returned zero deployments/zero READY deployments after cleanup. Final secret scan: 121 files, zero candidates.

## Authorized protected fixture deployment — 2026-10-14

Production bootstrap and subsequent Preview are READY at approved public source d4e6fb0255952e2be48481ac6bb046036e8a1755. All Deployments authentication and six fixture-only variables are verified for both environments; automatic Git deployments remain disabled. Anonymous requests are denied and available browser access passed hosted fixture checks. Only fixture-preview was published at the already-approved commit. No later application changes were pushed. See docs/VERCEL_DEPLOYMENT_RESULT.md for exact URLs, actual checks, limitations and revoked CLI-generated automation token. Live AI/database integrations remain disabled; mandatory Nebius runtime remains BLOCKED.
## Final hosted verification — 2026-10-14

Both authorized deployments remain READY at approved d4e6fb0255952e2be48481ac6bb046036e8a1755. Authenticated CLI confirms Production/main and Preview/null/fixture-preview, All Deployments protection, zero bypass tokens/exceptions, disabled automatic Git deployments and exactly six fixture-only environment entries for both targets. Anonymous page/API GETs redirect (302); API POSTs deny (401). Existing browser access rendered actual /api/status responses through Settings, confirming fixture policy and disabled live integrations. Synthetic assessment progress was recorded and cleared by reload on both deployments. Forty hosted route/viewport semantics/layout checks passed, with keyboard entry, upload/export/hosted-save restrictions verified. Ten-minute runtime error/fatal and HTTP 5xx log queries returned zero records; earlier logs exceed Hobby retention.

Settings storage/export/authentication descriptions corrected locally; existing restricted browser test extended. Tests actually executed: typecheck PASS; lint PASS; 75/75 unit/integration; fixture production configuration PASS; production build PASS; 8/8 restricted-preview desktop/mobile browser tests including localhost axe scans; secret scan 123 files, zero issues; diff whitespace PASS. Hosted full axe remains BLOCKED on unavailable authenticated scanner surface; raw authenticated negative API checks and independent outbound traffic monitoring remain NOT TESTED. No tokens generated, protection altered, services purchased, code pushed or build deployed. Changes remain local and uncommitted at 8cbf5f0. Existing protected Preview recommended for authorized fixture-only demonstrations; detailed per-check statuses and limitations are in docs/VERCEL_DEPLOYMENT_RESULT.md.
## Final autonomous sprint — 2026-10-14

VERIFIED locally: original REA recall-before-reread cards, evidence-derived concept revision dates, duplicate/future/invalid evidence handling and successes at least 24 hours apart; steps/simple/worked changes across bounded course reteaching with prerequisite context. Fixed assessment deep-link topics, misleading Settings storage/authentication copy, broad fixture aliases that substituted unrelated topics, populated Progress chart ARIA role and review target size. No stored schema, migration, provider or deployment was rebuilt. Existing uncommitted verification changes were preserved.

Research inventory and original adaptation rationale: docs/REA.md. Existing roadmap/module resume, PDF extraction/consent/retrieval, citations, curated diagnostic/post checks, labs, source integrity and trace-redaction behavior remain covered by regressions. Revised pilot covers school maths, college engineering, programming and professional negotiation with consenting adults and no invented results. Updated Devpost narrative, video storyboard/checklist, architecture, tool feedback and official-rules checklist. Universal live model quality, novel retests, full multilingual quality and learner efficacy are NOT TESTED.

Actual final checks: npm test 96/96 across 16 files; npm run typecheck PASS; npm run lint PASS; normal fixture npm run build PASS and npm run test:e2e 20/20 desktop/mobile; restricted-preview check:config -- --production PASS, npm run build PASS, npm run test:e2e 8/8. Axe covered ten routes per viewport and populated review/progress cards. An initial new populated-page axe scan failed on two real issues (ARIA role and target size); both were corrected and the full normal rerun passed. Production npm audit --omit=dev reported zero vulnerabilities; secret scan checked 126 files with zero issues; public asset scan checked 44 files with zero configured API-key matches; diff whitespace passed. Tests verify software/fixture behavior, not learning gains or live-model performance.

Tavily/LangSmith: VERIFIED retained live evidence from 2026-10-14, no duplicate calls. Nebius: BLOCKED, NEBIUS_API_KEY and NEBIUS_MODEL absent. PostgreSQL: BLOCKED, DATABASE_ADMIN_URL placeholder in ignored .env.database-admin.local and DATABASE_URL absent; no authenticated assessment, role setup, migrations or hosted smoke occurred. Existing 002 → 003 plan/order is preserved. Protected Vercel deployments: read-only checks confirm READY at d4e6fb0, correct Production/Preview targets, All Deployments authentication, disabled Git automation and zero bypass tokens. No configuration changes, new deployment, public push, purchase, participant recruitment, video upload or Devpost submission occurred. New fixes are not hosted; use the approved preview's three guided paths and disclose its remaining older copy/fixture-matching/chart accessibility issues.

Local reviewed changes are prepared for commit; its resulting ID is reported to the owner after creation. Public source remains d4e6fb0. Unavoidable next steps: private authorized Nebius configuration; private actual DATABASE_ADMIN_URL followed by read-only assessment and explicit migration/role approval; separate approval for reviewed source publication/redeployment; actual participant testing and video/judge-access/submission review. None is substituted with simulated success.
