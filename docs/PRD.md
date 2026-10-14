# Product requirements and implementation scope

## Current status — 2026-10-14

Tavily retrieval and LangSmith trace/redaction/synthetic feedback are VERIFIED; Nebius inference and hosted PostgreSQL remain BLOCKED on missing/placeholder configuration. Public source is approved d4e6fb0; new local changes are not pushed. The explicit Preview CLI attempt was classified Production, immediately canceled and deleted; no safe hosted URL exists. See BUILD_STATUS.md for evidence and pending launch gates. Web citation identity now has regression coverage; factual grounding still requires live inference and educator review.

### Earlier evidence (historical)

2026-10-14 rollout policy: the limited-access fixture preview intentionally disables uploads, private persistence and live integrations until hosted isolation/runtime evidence exists. In this build, learning state is temporary and resets on reload; existing local records are untouched. Full local-development capabilities remain available with the safe-preview flag false. See PREVIEW_DEPLOYMENT_CHECKLIST.md; this is not production launch or hackathon compliance.

## Final PRD inventory and prioritized plan — 2026-10-13

Audience: school learners through working professionals across India initially; English/Telugu/Hindi, guest first, ₹0 default. Broader subjects require configured inference. Sources: generated lessons, owned text PDFs, curated public references.

| Priority | Audit evidence | Implementation / remaining work |
| --- | --- | --- |
| P0 Preserve | Core routes, labs, languages, grading and progress work; 46 baseline tests/build rerun | Preserved regression coverage |
| P0 Adapt | Existing transitions; retries unbounded | Course attempt/state replay and two reteaching rounds; standalone retry button pauses after three practice rounds |
| P1 Courses | Schedules/live plan previews lacked lesson flow | Resumable modules, ordered on-demand lessons/quizzes, assessment-backed completion, targeted review implemented |
| P1 Sources | Upload/retrieval absent | Bounded local PDF extraction, Unicode retrieval, page IDs, consent, export/deletion and optional private hosted extracted notes implemented |
| P1 Storage | Guest profile/result repository | Migration 003, normalized learning entities and private library API implemented; embedded verification only |
| P1 Integrations | Existing secure adapters/traces/smokes | Preserved; database smoke extended; real verification BLOCKED by missing credentials/services |
| P2 Accounts | Guest capability only | Authentication, verified optional account linking and recovery outstanding |
| P2 Launch | No hosted URL, retention operations, pilot/language review | External verification/review and approved publishing outstanding |
| Deferred | Advanced media absent | OCR, large collections, video/native mobile deferred |

Demo courses have three revision modules for the same topic. Generated two-question keys require educator review; completion is passing checks, not subject mastery. Suggested revisions derive from recorded mistakes. Concurrent cross-device merging and named accounts remain unimplemented; the final universal-platform specification is not fully complete.

Primary goal: help learners articulate concepts, identify gaps, and choose a useful next activity. Primary loop: diagnostic → explanation → demonstration → practice → targeted review. The demo covers transformers, Python loops/conditions, and quadratic equations. Guest onboarding collects only level, language, goal, and study preferences.

Routes: landing, topic selection, classroom, assessment, roadmap, progress, labs, settings, about, privacy. Each route has usable content. Explanations can change strategy and language. Unknown topics in fixture mode explicitly request a live provider rather than inventing teaching content.

Acceptance checks: learner can finish pre/post checks; weak concepts suggest reteaching; scores survive reload; labs respond deterministically; keys remain server-side; provider errors preserve browser progress; arbitrary learner code is never executed.

Phase 10 adds opt-in, access-controlled PostgreSQL guest persistence and protected production live calls. Remaining full-product requirements: hosted verification, named-account recovery if introduced later, live verification of generated diagnostics/written-answer evaluation/course plans, fluent translation review, larger assessment banks, retention maintenance, and public-production privacy/child compliance review. Generated question scores remain unverified previews; hosted curated records are server-graded with explicit provenance.
