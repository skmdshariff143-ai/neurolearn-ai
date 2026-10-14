# Submission draft — not submitted

## Current status — 2026-10-14

Tavily retrieval and LangSmith trace/redaction/synthetic feedback are VERIFIED; Nebius inference and hosted PostgreSQL remain BLOCKED on missing/placeholder configuration. Public source is approved d4e6fb0; new local changes are not pushed. The explicit Preview CLI attempt was classified Production, immediately canceled and deleted; no safe hosted URL exists. See BUILD_STATUS.md for evidence and pending launch gates. Web citation identity now has regression coverage; factual grounding still requires live inference and educator review.

### Earlier evidence (historical)

Final PRD demonstration variant (2:45): 0:00–0:20 introduce learner problem and explicit inference mode; 0:20–0:50 create/resume a course and take diagnostic; 0:50–1:20 show misconception-driven simpler teaching and Telugu/Hindi controls; 1:20–1:45 lab plus different post-test; 1:45–2:10 authorized text PDF retrieval with real page IDs and explicit consent (show live grounding only after verification); 2:10–2:30 recorded progress/private storage and architecture; 2:30–2:45 disclose remaining limitations and verified source/demo URLs. Hide credentials/cookies. Do not portray fixtures as live AI or prepared configuration as working hosted services.

Phase 10 adds the concise [Devpost description](DEVPOST_DESCRIPTION.md), updated architecture, protected live access, hosted guest repository and [final checklist](SUBMISSION_CHECKLIST.md). No live-provider or hosted database success has been recorded; all published URLs remain pending.

**Name:** NeuroLearn AI. **Tagline:** Learn Anything. Understand Deeply. Grow Continuously. **Intended track:** Best Apps and Agents.

Problem: learners can receive answers without discovering why their understanding is incomplete. Solution: an adaptive workspace that pairs concept checks, teaching strategy changes, interactive demonstrations, and targeted review. Target users: students, professionals, teachers, and lifelong learners.

Implemented demonstration: curated transformer, Python, and quadratic paths; English/Telugu/Hindi explanation content; deterministic MCQs and tentative misconception feedback; interactive SVG/graph/fixed-code-trace labs; browser-local progress and editable schedules. Live-provider APIs also support generated assessments, rubric-based written-answer review, and editable generated course plans; these are validated through mock-transport tests and remain unverified live. Architecture and provider implementation are in ARCHITECTURE.md and AI_WORKFLOW.md.

NVIDIA/Nebius details: adapter calls Token Factory's chat completions endpoint with an account-selected model ID. No inference access or actual NVIDIA runtime use has been verified. Fill in the exact model, smoke evidence, and live demonstration before submitting. Tavily source retrieval and optional redacted LangSmith traces are implemented; live verification is pending credentials.

Repository intended URL: https://github.com/skmdshariff143-ai/neurolearn-ai. Working demo URL: pending. Video URL: pending. Educational results: none yet. Technical challenges: affordable access, multilingual accuracy, limited assessment evidence, safe model output, durable production identity and storage.

## Video script (target 2:45)

- 0:00–0:20: explain the learning problem and show Learn onboarding.
- 0:20–0:45: answer a transformer diagnostic incorrectly; show tentative changing-flux diagnosis.
- 0:45–1:15: show simpler teaching, worked example, Telugu/Hindi switch; disclose current inference mode.
- 1:15–1:45: manipulate AC/DC and turns in the transformer lab; briefly show Python trace and quadratic graph.
- 1:45–2:05: complete alternate practice and show real recorded scores.
- 2:05–2:30: show organizer unlock with its input masked, then genuine Nebius/NVIDIA lesson evidence, retrieved sources and a redacted trace if verified. Show the architecture diagram briefly. If live access is unavailable, state the blocker rather than simulate success. Do not reveal .env files, API keys, guest cookies or private trace links on video.
- 2:30–2:45: describe limitations and next steps; show approved public source/demo URLs.

## Tool feedback to complete after genuine use

For Nebius/NVIDIA: exact model, setup experience, measured latency/errors, structured-output quality, language limitations, credit usage if measured, and actionable feedback. For Tavily: source relevance/deduplication behavior and grounding limitations. For LangSmith: trace usefulness, redaction behavior, and evaluation workflow. Do not fill in observations from assumptions or fixture tests.
