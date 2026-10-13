# Product requirements and implementation scope

Primary goal: help learners articulate concepts, identify gaps, and choose a useful next activity. Primary loop: diagnostic → explanation → demonstration → practice → targeted review. The demo covers transformers, Python loops/conditions, and quadratic equations. Guest onboarding collects only level, language, goal, and study preferences.

Routes: landing, topic selection, classroom, assessment, roadmap, progress, labs, settings, about, privacy. Each route has usable content. Explanations can change strategy and language. Unknown topics in fixture mode explicitly request a live provider rather than inventing teaching content.

Acceptance checks: learner can finish pre/post checks; weak concepts suggest reteaching; scores survive reload; labs respond deterministically; keys remain server-side; provider errors preserve browser progress; arbitrary learner code is never executed.

Phase 10 adds opt-in, access-controlled PostgreSQL guest persistence and protected production live calls. Remaining full-product requirements: hosted verification, named-account recovery if introduced later, live verification of generated diagnostics/written-answer evaluation/course plans, fluent translation review, larger assessment banks, retention maintenance, and public-production privacy/child compliance review. Generated question scores remain unverified previews; hosted curated records are server-graded with explicit provenance.
