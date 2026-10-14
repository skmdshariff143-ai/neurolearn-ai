# Hackathon compliance audit

## Current status — 2026-10-14

Tavily retrieval and LangSmith trace/redaction/synthetic feedback are VERIFIED; Nebius inference and hosted PostgreSQL remain BLOCKED on missing/placeholder configuration. Public source is approved d4e6fb0; new local changes are not pushed. The explicit Preview CLI attempt was classified Production, immediately canceled and deleted; no safe hosted URL exists. See BUILD_STATUS.md for evidence and pending launch gates. Web citation identity now has regression coverage; factual grounding still requires live inference and educator review.

### Earlier evidence (historical)

## Activation assessment — 2026-10-14

Owner supplied Supabase project reference zwylxrtytktpynmwlzmg. Its API endpoint is identified; the exact selected database pooler host is still missing and no Supabase connector is callable. Private DATABASE_URL and DATABASE_ADMIN_URL are absent. The read-only preflight stopped before any external request; database version, TLS, pooling, role privileges and whether migrations 002/003 already exist are NOT VERIFIED. No migration, role/password setup or synthetic hosted write occurred. Exact target approval is pending and will be requested only after reference/host and catalog assessment are available.

Use ignored .env.database-admin.local for a temporary DATABASE_ADMIN_URL, read only by the assessment/migration process; Next.js must not receive administrator credentials. Keep restricted DATABASE_URL in .env.local. Neither file nor connection value should enter Git or chat. Non-secret project reference and exact Connect-panel host may be shared. The migration order and restricted-role SQL in POSTGRES_SETUP.md remain unchanged.


## Current compliance — 2026-10-14

Mandatory Nebius/NVIDIA runtime remains BLOCKED: no key/model or successful live inference. Tavily retrieval is VERIFIED by an actual HTTP 200 smoke returning two topical HTTPS citations; it does not replace the required runtime or prove learning outcomes. LangSmith trace write/read, redaction and synthetic feedback are VERIFIED on 2026-10-14; hosted PostgreSQL isolation remains BLOCKED. These tracing checks do not prove live-model quality or learner outcomes. Public source at d4e6fb0 was previously published; the new local repair is not pushed. No working hosted demo, completed video, pilot results or Devpost submission exists. The prior unintended Production-classified deployment was canceled/deleted.

The submission is not complete or technically compliant. See BUILD_STATUS.md for current test/integration evidence and DEPLOYMENT.md for safe configuration. Earlier dated claims below are historical.

### Earlier evidence (historical)

2026-10-14 restricted-preview preparation: fixture mode has no real inference/research/tracing and disables uploads/private persistence. Limited access requires verified Vercel protection. Preview smoke commands refuse real-integration verification. This can demonstrate curated UI workflows only; mandatory Nebius/NVIDIA runtime remains BLOCKED. Nothing has been pushed/deployed.

Final integration re-audit on 2026-10-13 confirmed ee83885's local tests/build and 18 browser tests. All four live smokes still report BLOCKED with no credentials and no external service call. See DEPLOYMENT_READINESS.md for classified evidence and exact owner actions. The enhanced hosted isolation/deletion smoke is prepared, not passed against a hosted database. Public code/demo/video and actual Nebius/NVIDIA runtime evidence remain pending; no compliance completion is claimed.

Final PRD additions (courses/private PDF notes/normalized PostgreSQL library) do not establish Nebius compliance or live educational efficacy. Mandatory NVIDIA/Nebius runtime remains BLOCKED. No public push/deployment, new credits, payment or submission occurred. Account linking/operational hosted verification and fluent review remain outstanding. [Official catalog API](https://docs.tokenfactory.nebius.com/api-reference/models/list-models) and [quickstart](https://docs.tokenfactory.nebius.com/quickstart) were rechecked; authenticated model availability/live smoke is still unavailable.

Reviewed official [rules](https://nebiusglobalaihackathon.devpost.com/rules) and [resources](https://nebiusglobalaihackathon.devpost.com/resources) on 2026-10-13.

The rules require a working app with a runtime Token Factory call or Nebius AI Cloud execution and an NVIDIA open-source model. Best Apps and Agents describes Nemotron-powered applications. A working demo/test build URL, public open-source code with setup instructions, a publicly visible YouTube demonstration under three minutes, track selection, and actual tool feedback are required. Entrant age/residence/other eligibility must be checked by the entrant; this project does not certify personal eligibility.

| Requirement | Actual status |
| --- | --- |
| Nebius runtime | BLOCKED: no usable inference credentials; no live call verified |
| NVIDIA model | Adapter configured by model ID; actual model availability/use not verified |
| Functional development app | See actual test/build evidence in BUILD_STATUS.md |
| Public repository and license | GitHub API confirms public empty repository; MIT source/commits are local only until approved push |
| Public demo | Pending authorization and deployment |
| Public YouTube video <3 min | Script prepared; video not recorded/uploaded |
| Meaningful tool feedback | Template only; must add feedback from genuine use |
| Devpost submission | Not submitted |
| Learner results | Pilot protocol prepared; no actual results |

Deadline: October 30, 2026, 10:00 AM PDT (10:30 PM India time). Resources advertise a $25 Token Factory credit form and another $25 via the Builders Program. Availability, account activation, and any card conditions have not been verified. No registration, credit application, purchase, or account change was initiated.

The hackathon submission is **not complete or technically compliant yet**. Tavily/LangSmith do not satisfy the Nebius runtime requirement.

## Phase 10 integration evidence

Official NVIDIA sources identify the [Nemotron 3 family](https://research.nvidia.com/labs/nemotron/Nemotron-3/) and public [model catalog](https://build.nvidia.com/models?label=Chat&q=nemotron). Nebius's [inference overview](https://docs.tokenfactory.nebius.com/ai-models-inference/overview) points to its account catalog; the [models endpoint](https://docs.tokenfactory.nebius.com/api-reference/models/list-models) requires authenticated access. Account-specific available IDs remain unverified because no key exists. The model-list command and adapter smoke test implement that check; no ID was invented or selected as a working deployment.

Nebius, Tavily, LangSmith, and hosted PostgreSQL verification commands were executed with missing configuration and recorded BLOCKED/no external request. The mandatory Nebius/NVIDIA blocker remains. Embedded PostgreSQL tests and fixture/browser tests do not satisfy it. Vercel config and protected live access are prepared; nothing was provisioned or published.

Official rules/resources rechecked on 2026-10-14: runtime Nebius plus an NVIDIA open model remains mandatory; Best Apps and Agents calls for Nemotron. Demo/test-build URL, public licensed source, a publicly visible YouTube video under three minutes, track selection and genuine tool feedback remain required. Public source d4e6fb0 is verified by git remote SHA, while later local source is unpublished. Current model IDs must come from the authenticated Nebius catalog; JSON mode support must be checked on the selected model. No account-model access is verified. See TOOL_FEEDBACK.md for actual optional-tool feedback; no Nebius performance or learner efficacy is invented.
