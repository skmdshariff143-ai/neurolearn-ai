# Limited-access fixture preview — 2026-10-14

## Current status — 2026-10-14

Tavily retrieval and LangSmith trace/redaction/synthetic feedback retain VERIFIED live evidence. Nebius inference and hosted PostgreSQL remain BLOCKED by missing/placeholder configuration. Both protected fixture deployments are READY at approved d4e6fb0 with All Deployments authentication and automatic Git deployments disabled. Later local REA, Settings and accessibility improvements are not pushed or deployed. See VERCEL_DEPLOYMENT_RESULT.md for hosted evidence and limits, REA.md for original learning adaptations, and BUILD_STATUS.md for executed checks. Grounded live teaching and learner efficacy remain unverified.

### Earlier evidence (historical)

## Required environment (set before build)

```dotenv
NEXT_PUBLIC_SAFE_PREVIEW=true
AI_PROVIDER=fixture
ALLOW_DEMO_MODE=true
PERSISTENCE_PROVIDER=browser
RATE_LIMIT_BACKEND=memory
LANGSMITH_TRACING=false
```

Despite the browser provider name, safe-preview policy uses temporary memory rather than localStorage. Existing browser records are ignored and preserved. Reload clears activity/preferences/courses/history. An anonymous request-limiting cookie and hosting operational logs may still exist; don't enter personal information. PDF uploads/extraction, export of guest data, hosted sync, generated live tasks, Tavily and tracing are disabled. Direct API calls cannot enable them. Provider selection is forced to labelled fixtures; invalid preview settings fail preflight. The preview flag is public configuration, not a credential. It is compiled into both client/server bundles; changing it requires a fresh build, not just runtime variable edits.

**Unset** NEBIUS_API_KEY, NEBIUS_MODEL, TAVILY_API_KEY, LANGSMITH_API_KEY, DATABASE_URL, LIVE_AI_ACCESS_CODE and SESSION_SIGNING_SECRET in this preview's environment. Do not copy credentials from another project's Production/Preview scopes. No database/migration, external model or billable integration is needed.

Local verification commands (PowerShell):

```powershell
Set-Location E:\neurolearn-ai
npm run typecheck
npm run lint
npm test
npm run check:secrets
$env:NEXT_PUBLIC_SAFE_PREVIEW='true'
$env:AI_PROVIDER='fixture'
$env:ALLOW_DEMO_MODE='true'
$env:PERSISTENCE_PROVIDER='browser'
$env:RATE_LIMIT_BACKEND='memory'
$env:LANGSMITH_TRACING='false'
npm run check:config -- --production
npm run build
$env:PLAYWRIGHT_BROWSERS_PATH='E:/neurolearn-ai/.playwright'
npm run test:e2e
```

Run unit tests before setting the preview environment; their test explicitly switches policy to verify it. Preview browser mode runs its dedicated restricted suite; normal browser regressions require a normal-mode rebuild with the flag false. Do not run either suite against a build from the other mode. No deployment command appears in these local checks.

## GitHub publication — commands prepared, not executed

Only after explicit approval to publish source:

```powershell
Set-Location E:\neurolearn-ai
git status --short
git log -1 --oneline
git remote get-url origin
git ls-remote origin
git diff --check
npm run check:secrets
git push -u origin main
```

Expected origin is https://github.com/skmdshariff143-ai/neurolearn-ai.git. Review any newly appearing remote commits before pushing; no force push. If a Vercel Git integration already exists, pushes may deploy automatically: disable/pause that automation before a source-only approval. Source approval does not authorize deployment.

## Vercel setup — separate approval required

- [ ] Approve project/linking and preview deployment separately; choose the intended account/team and free plan. Do not purchase protection or additional seats.
- [ ] Create/link a project without releasing a deployment, then configure Preview environment variables above before building. Avoid a Git import flow that immediately publishes an unprotected Production deployment.
- [ ] Use repository root, Next.js preset, Node24, npm ci and npm run build. Existing vercel.json is compatible with the application; no persistent server disk/SQLite is used. PDF worker build asset is retained for normal mode but no preview upload UI exists.
- [ ] Enable Vercel Authentication for Preview URLs in project Deployment Protection **before deployment**. Confirm intended environment/branch; deploy as Preview, never with --prod. If the account workflow cannot configure protection before release, stop and resolve it first.
- [ ] [Official Vercel Authentication documentation](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication) states availability on all plans and a Hobby limit of one external access-request user. Use owner access and only supported, approved reviewer access. Do not upgrade to add reviewers. Avoid distributing bypass/shareable links; they grant access to anyone holding them.
- [ ] After separate deployment approval, use the configured project to create a Preview deployment (for example `vercel deploy`, **not executed here**). Verify every generated URL/alias is covered by protection. Do not attach a public production domain or promote it.
- [ ] In a signed-out browser, verify site routes and APIs redirect/deny access. In an authorized reviewer context, verify successful access. A localhost test cannot prove this protection.
- [ ] Check /api/status: safePreview true, fixture provider, disabled integrations, transient memory. Check every page banner and noindex metadata.
- [ ] Confirm no file inputs; research/course-live/hosted/export controls unavailable; direct progress/library/workflow/access requests fail; no network traffic reaches AI/search/tracing/database services.
- [ ] Verify classroom/labs/languages/curated checks/course journey. Reload must discard temporary activity and must not reveal old records. Run keyboard/mobile/axe checks on the real protected URL using an approved test access method.
- [ ] Confirm operational logging/retention, free usage limits and invitation scope in the actual account. Remove reviewer access when review ends; keep protection enabled.

## Readiness decision

Local evidence: 56 unit/integration tests, 18 preserved-mode browser tests and 8 restricted-preview browser tests passed; typecheck/lint, both production builds, preview preflight, per-route axe/keyboard/overflow checks and limited secret scan passed. Production dependency audit returned zero advisories. These are localhost/embedded checks only.

Locally prepared for a restricted fixture demonstration after all recorded checks pass. **Not yet verified safe on Vercel:** no hosted build/URL/access-protection test exists. Owner approvals, free-account/project setup, protected Preview deployment and anonymous-versus-authorized URL verification remain blockers. Hosted isolation remains unverified, so uploads/private persistence must stay disabled. Mandatory Nebius/NVIDIA hackathon runtime remains BLOCKED; fixtures are not live AI.

## Protected deployment attempt — 2026-10-14

Approved source remains d4e6fb0255952e2be48481ac6bb046036e8a1755. CLI authentication succeeded in the intended Hobby workspace. Created neurolearn-ai link-only, verified Preview authentication and all six restricted fixture variables. Forbidden integration credentials are absent. GitHub is connected; automatic Git deployments are disabled.

Deployment: BLOCKED. The API unexpectedly classified the Git-SHA request with omitted target as Production. Immediately canceled it (confirmed CANCELED, aliasAssigned false, zero READY deployments), then deleted it. No safe hosted Preview URL exists. Anonymous/authorized access and hosted application checks are NOT TESTED. No protection was weakened, purchase made or source push performed.

Local verification: approved source 56 unit/integration tests and 8 restricted-preview browser/accessibility tests passed; typecheck, lint, preview configuration, secret scan and preview-variable production build passed. Subsequent local LangSmith placeholder safeguards passed 57 tests, typecheck, lint and secret scan. They remain uncommitted and were excluded from the remote Git deployment request. LangSmith smoke: BLOCKED placeholder, no external request. Local .env.local is ignored; Vercel Preview tracing remains false without a key.

Next: resolve Preview-only target selection before retrying and then verify hosted authentication and all learning flows. Rotate the LangSmith key exposed in chat and insert its replacement privately into the local ignored environment file. Do not promote to Production or create bypass links.
