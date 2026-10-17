# Authorized protected fixture deployment — 2026-10-14

## Subsequent local sprint — not deployed

The following fixes exist only locally: truthful Settings copy, populated Progress chart ARIA role and larger review targets, assessment deep-link topic handling, and supported-alias fixture matching. Approved deployed d4e6fb0 retains older behavior. Demonstrate its three curated paths and disclose limitations; do not claim arbitrary fixture topics, full WCAG conformance or live AI. New recall/revision features require separate publication/deployment approval. Existing hosted security evidence below remains valid; the deployments/protection were not altered by this sprint.

## Final hosted verification — 2026-10-14

This follow-up supersedes the earlier untested statuses below. No deployment, push, protection change, bypass-token generation, share link, live integration call or database migration was performed. Both deployments still serve approved `d4e6fb0255952e2be48481ac6bb046036e8a1755`; At that verification, local HEAD was `8cbf5f0f8c74afc1c1f25813124c415f7e6b01f3` with uncommitted local copy/test/documentation changes.

| Hosted check | Production bootstrap | Preview | Actual evidence / limits |
| --- | --- | --- | --- |
| Build and source identity | VERIFIED | VERIFIED | Authenticated CLI readback: READY; Production/main versus Preview/null/fixture-preview; exact approved SHA |
| Deployment environments | VERIFIED | VERIFIED | Six expected values target both environments, no branch overrides; exactly six project environment entries |
| All Deployments authentication | VERIFIED | VERIFIED | Project readback `all`; zero automation bypass tokens and no protection exceptions; Git automation remains disabled |
| Anonymous page/API GET denial | VERIFIED | VERIFIED | Ten page routes plus `/api/status`, `/api/progress`, `/api/library`: HTTP 302 to Vercel login |
| Anonymous API POST denial | VERIFIED | VERIFIED | `/api/tutor`, `/api/access`, `/api/workflow`, `/api/progress`, `/api/library`: HTTP 401; empty synthetic JSON only |
| Existing authorized browser access | VERIFIED | VERIFIED | Hosted pages and synthetic curated assessment interactions succeeded in available browser access context |
| `/api/status` fixture policy | VERIFIED | VERIFIED | Settings' existing same-origin fetch rendered actual status fields: provider fixture, safePreview true, all integration flags false, transient memory, memory rate limiter, no live access gate |
| Live inference/research/tracing/database disabled | VERIFIED | VERIFIED | Status, exactly six fixture variables without credentials, disabled research and hosted save controls; external traffic independently monitored: NOT TESTED |
| PDF uploads and export unavailable | VERIFIED | VERIFIED | Zero file inputs, uploads-disabled heading, disabled export and hosted course-save controls |
| Actual assessment progress resets | VERIFIED | VERIFIED | Synthetic 2/2 diagnostic appeared in accessible progress table; reload returned to empty-state heading; no personal data used |
| Desktop/mobile basic accessibility | VERIFIED | VERIFIED | 40 route/viewport checks total: ten routes each at 1280×800 and 390×844; one main and H1, no unlabelled visible native controls, no horizontal overflow, noindex metadata; keyboard Tab reaches Skip to content |
| Full hosted axe audit | BLOCKED | BLOCKED | Available browser surface supports read-only DOM/semantics checks but not injecting/running the axe scanner; no authenticated Playwright scanner context is available. No bypass credential or protection change was used to obtain one |
| Retained runtime errors | VERIFIED | VERIFIED | Authenticated CLI error/fatal queries returned zero records in ten-minute windows ending 03:53:52/03:53:56 UTC; no excluded intervals or further pages |
| Retained HTTP 5xx requests | VERIFIED | VERIFIED | Authenticated CLI request queries returned zero records in ten-minute windows ending 03:57:50/03:57:55 UTC; no excluded intervals or further pages |
| Earlier runtime logs | BLOCKED | BLOCKED | One-hour query rejected HTTP 400 because it exceeds Hobby retention; no upgrade attempted |
| Misleading Settings description | FAILED | FAILED | Older deployed copy still mentions persistent browser storage/export and ambiguous account authentication; corrected locally, awaiting publication approval |
| Exhaustive course/lab/teaching regression on hosted URLs | NOT TESTED | NOT TESTED | Limited hosted interactions above do not establish every educational workflow or overall WCAG conformance |

The browser client does not support direct navigation to the JSON status endpoint; successful validation through the application's existing Settings fetch removes the earlier status-validation blocker. Raw authenticated negative-API tests remain NOT TESTED. No `vercel curl` command or credential-generation endpoint was called in this follow-up.

Local changes: Settings now describes temporary memory, reload reset, disabled export/hosted storage and hosting-level protection accurately in safe-preview mode. Normal mode retains its browser-storage/export description and identifies learner accounts specifically. Existing restricted browser tests now assert the preview descriptions.

Executed local verification: `npm run typecheck` PASS; `npm run lint` PASS; `npm test` 75/75 across 15 files; `npm run check:config -- --production` with restricted fixture variables PASS; `npm run build` PASS; `NEXT_PUBLIC_SAFE_PREVIEW=true npm run test:e2e` 8/8 desktop/mobile tests including axe scans on ten routes per viewport and API-policy checks; `npm run check:secrets` 123 files, zero issues; `git diff --check` PASS. These automated axe/API tests ran on localhost, not the hosted URLs.

Recommendation: the existing protected Preview is suitable for a restricted, authorized fixture demonstration, provided protection and disabled integrations remain unchanged and no personal data is entered. It is not a verified live-AI release or a fully audited public launch. Publishing the corrected copy requires separate approval for source publication and a new build; neither occurred here.

## Verified deployment identity

Workspace: `shaik-mahammad-shariff-s-projects`, team `team_J1DYhRPYmArh3STLVOFj38nB`, confirmed Hobby. Existing project: `neurolearn-ai`, `prj_tAAZ8ADLhAhFXo7vzlSEtBeaehTu`. The authenticated CLI found the project despite the connector's earlier discovery limitation. No new project or paid resource was created.

Both deployments fetched the approved GitHub source directly: `d4e6fb0255952e2be48481ac6bb046036e8a1755`. Application code was not modified or rebuilt from scratch. At this verification, local development HEAD was `8cbf5f0f8c74afc1c1f25813124c415f7e6b01f3`; its later changes were not published.

| Deployment | ID | Target | Source branch | Build |
| --- | --- | --- | --- | --- |
| Protected bootstrap | dpl_2rwuMPRKYeqwicbwELibUnPnSSbh | Production | main | READY |
| Protected demonstration | dpl_FiqNeXorsX9M7JkGnR1grvTjbohq | Preview (API target null) | fixture-preview | READY |
| Protected preview release | dpl_2Hes9pKGG2hX5bt3EK4Hpa6deJd4 | Preview (API target null) | fixture-preview | READY |

- Bootstrap: https://neurolearn-3pexaim8c-shaik-mahammad-shariff-s-projects.vercel.app
- Primary protected domain: https://neurolearn-ai-pink.vercel.app
- Prior Preview demonstration: https://neurolearn-2nymaifwu-shaik-mahammad-shariff-s-projects.vercel.app
- Latest Preview release: https://neurolearn-p6rp0nceo-shaik-mahammad-shariff-s-projects.vercel.app
- Preview branch alias: https://neurolearn-ai-git-fixt-c75bbe-shaik-mahammad-shariff-s-projects.vercel.app

The Git publication was the explicitly authorized `fixture-preview` branch reference at approved commit `6b03ae2b22bfa34b4d8eba37703a70f5a47b099f`. Remote main remains at the approved `d4e6fb0255952e2be48481ac6bb046036e8a1755`. No unapproved development commits were pushed.

## Safeguards verified before either build

Authentication readback: `ssoProtection.deploymentType=all`. Git automation readback: `gitProviderOptions.createDeployments=disabled`. Next.js, repository root, Node 24.x, `npm ci`, and `npm run build` configured.

Each of the six variables exists once, has no branch override, and targets both Production and Preview:

```dotenv
NEXT_PUBLIC_SAFE_PREVIEW=true
AI_PROVIDER=fixture
ALLOW_DEMO_MODE=true
PERSISTENCE_PROVIDER=browser
RATE_LIMIT_BACKEND=memory
LANGSMITH_TRACING=false
```

The project environment contains exactly these six entries, with zero API-key/database/session-secret/live-access/model-selection entries. Private local environment files were not uploaded. Final project readback shows All Deployments authentication, disabled automatic deployments, no protection-exceptions field, and zero automation bypass tokens.

## Actual hosted checks

- Both deployment URLs, the primary domain, both additional Production aliases and the Preview branch alias returned HTTP 302 to Vercel authentication to anonymous requests. Root and `/api/status` denial were checked on the deployment URLs, primary domain and Preview alias.
- Existing browser access successfully opened and interacted with both hosted applications. This verification did not require changing authentication or adding reviewer access.
- All ten routes on both deployments visibly show the restricted fixture disclosure, have `noindex, nofollow` metadata, and contain zero file inputs.
- Both hosted classrooms returned `Curated demonstration · not live inference` lessons. Reload cleared the lesson. Tavily controls were disabled.
- Preview export, course-source selection and hosted course-save controls were disabled. Bootstrap export was also disabled.
- All ten Preview routes had no horizontal overflow at 390 × 844. Bootstrap mobile classroom rendered an actual Telugu fixture explanation without overflow. Preview keyboard Tab reached Skip to content.
- Final API deployment readback confirmed READY, expected targets and exact source SHA. No provider smoke test or database access was performed.

## Test limitations and incident

Authenticated direct `/api/status` navigation was blocked by the browser client. Authorized raw API rejection checks, a hosted axe scan, exhaustive educational workflow regression, external-provider network monitoring and a runtime-error-log scan were **NOT TESTED in this deployment task**. Existing local test results remain historical evidence, not newly executed hosted tests. The deployment's fixture-only configuration and observed UI restrictions are verified; no claim of live AI, hosted persistence or hackathon compliance is made.

The initial `vercel curl` access attempt automatically generated an automation bypass token, then failed because a CLI directory flag was forwarded to curl. Automatic approval review rejected retrying that method. The newly generated token was revoked through the API with `regenerate=false`; readback confirmed zero remaining tokens. Its value was never printed, persisted in project documentation or committed. Browser verification proceeded through the available browser access context after revocation. No shareable bypass link was created.

A request with literal API `target=preview` returned HTTP 400 and created no deployment. The [official API](https://vercel.com/docs/rest-api/deployments/create-a-new-deployment) defines omitted target as Preview and response target null as Preview. The corrected branch/SHA-pinned request used that format after the initializing Production deployment. This is separate from the [documented first-deployment Production rule](https://vercel.com/docs/deployments/environments#first-deployment).

Current local checks: `npm run check:secrets` scanned 122 files with no issues before deployment; `git diff --check` passed. Application code was unchanged, so the full local functional suite was not rerun in this deployment-only task. Both remote production builds actually completed successfully.

## Remaining issues

The approved older source's Settings text says browser data can be exported even though safe-preview export is disabled, and its account-authentication text refers to application accounts rather than Vercel protection. The prominent fixture disclosure and disabled controls remain accurate. Correcting that copy requires approval to publish a newer source commit; it was not changed in the deployed source.

Nebius/NVIDIA live inference and hosted PostgreSQL remain BLOCKED. Tavily and LangSmith previously verified locally remain intentionally disabled here. Public live launch, real learner evaluation, video and Devpost submission are outside this fixture deployment and remain unverified.

Sign in to Vercel with the authorized workspace account to review the protected Preview. Keep authentication and Git automation settings unchanged. No payment or new credential is required for this restricted demonstration.
