# Product requirements and implementation scope

Primary goal: help learners articulate concepts, identify gaps, and choose a useful next activity. Primary loop: diagnostic → explanation → demonstration → practice → targeted review. The demo covers transformers, Python loops/conditions, and quadratic equations. Guest onboarding collects only level, language, goal, and study preferences.

Routes: landing, topic selection, classroom, assessment, roadmap, progress, labs, settings, about, privacy. Each route has usable content. Explanations can change strategy and language. Unknown topics in fixture mode explicitly request a live provider rather than inventing teaching content.

Acceptance checks: learner can finish pre/post checks; weak concepts suggest reteaching; scores survive reload; labs respond deterministically; keys remain server-side; provider errors preserve browser progress; arbitrary learner code is never executed.

Remaining full-product requirements: authenticated hosted persistence, live verification of generated diagnostics and written-answer evaluation/course plans, fluently reviewed translations, larger assessment banks, and a public-production privacy/compliance review. Generated question scores are displayed as unverified previews rather than mixed into curated progress; production needs independently checked answer keys and provenance-aware assessment records.
