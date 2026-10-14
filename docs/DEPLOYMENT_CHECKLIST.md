# Manual deployment checklist — 2026-10-13

For the currently requested limited-access fixture preview, use PREVIEW_DEPLOYMENT_CHECKLIST.md (2026-10-14), which disables uploads and saved private data and requires verified hosted access protection. The live-service setup below remains future work, not a prerequisite for that restricted fixture preview.

No public push/deployment is authorized or completed. Local checks are not hosted evidence.

## Prepared locally

- [x] Audit clean baseline ee83885 and preserve existing application.
- [x] Rerun 55 baseline unit/integration tests, typecheck, lint and production build.
- [x] Review serverless storage: browser guest records or external PostgreSQL; no persistent server files/SQLite.
- [x] Review migration order 002 → 003, restricted runtime login and forced RLS.
- [x] Prepare bounded real integration smokes and private evidence output; missing credentials fail visibly.
- [x] Prepare exact environment/service setup and manual GitHub/Vercel steps in DEPLOYMENT_READINESS.md.
- [x] Complete final browser/axe regression run: 18/18 desktop/mobile tests passed; read BUILD_STATUS.md before publishing.

## Your service setup actions

- [ ] Create .env.local from .env.example only if absent; fill secrets privately in an editor/password manager.
- [ ] Add TAVILY_API_KEY from existing authorized credits; run `npm run smoke:tavily -- --confirm-live`.
- [ ] Add LANGSMITH_API_KEY, LANGSMITH_TRACING=true and LANGSMITH_PROJECT; optional region/workspace settings only as needed. Run `npm run smoke:langsmith -- --confirm-live` and inspect remote trace/redaction/feedback.
- [ ] Obtain usable authorized Nebius access without a purchase/card requirement; add NEBIUS_API_KEY, run `npm run models:nebius`, choose exact NVIDIA Nemotron NEBIUS_MODEL, then `npm run smoke:nebius -- --confirm-live`.
- [ ] Arrange an authorized hosted PostgreSQL database, apply missing migrations once, create restricted runtime login, store verified-TLS DATABASE_URL. Set PostgreSQL provider/budget flags and independent SESSION_SIGNING_SECRET/LIVE_AI_ACCESS_CODE.
- [ ] Run `npm run smoke:postgres -- --confirm-live`; retain actual read/write-isolation/deletion evidence. Test two guest browser contexts and arrange retention/backup/recovery.
- [ ] Run `npm run check:config -- --production`; this is configuration validation, not live verification.

## Your publication actions

- [ ] Choose labelled fixture preview or real-inference demonstration. A fixture preview can be published with approval but remains hackathon-runtime BLOCKED.
- [ ] Review final local commit and explicitly authorize public push. Verify origin/state, then `git push -u origin main` without force.
- [ ] Confirm public GitHub contains source, README, setup docs and MIT license.
- [ ] Separately authorize deployment; import the repository into the intended Vercel account/team. Import may deploy immediately; later linked Git pushes may auto-deploy.
- [ ] Select repository root/Next.js/Node24/npm run build; check free account limits and leave paid options disabled.
- [ ] Set chosen variables through server environment settings for intended Preview/Production scopes; never NEXT_PUBLIC secrets. Redeploy after variable changes.
- [ ] Test actual URL on desktop/mobile: all routes, keyboard/axe, languages/labs, assessments/progress, course resume/completion, PDF parsing/consent/citations/deletion, API errors, access expiry and hosted guest isolation.
- [ ] For live claims, verify actual hosted Nebius lesson, genuine Tavily citations and redacted LangSmith workflow. Record commit/URL/date/model evidence.
- [ ] Complete privacy/retention review before public learner data collection; do not publicly onboard children before applicable consent/compliance review.
- [ ] Record public video under three minutes, add genuine tool feedback and complete SUBMISSION_CHECKLIST.md. No fabricated outcomes.
