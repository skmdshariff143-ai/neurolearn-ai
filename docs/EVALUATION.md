# Educational evaluation

Reproducible PRD regressions: courses.test.ts checks bounded adaptation, dependency order, scores/gaps from submitted answers and completion integrity; resources.test.ts checks retrieval relevance, real page IDs, Telugu/Hindi matching and invalid upload boundaries. Embedded repository tests exercise normalized course/attempt/revision persistence and private note isolation. Existing learning/provider tests cover explanation calculations, strategy changes, languages, misconception cues and failure behavior. Browser course/PDF journeys cover actual interaction and resume; these tests do not grade live model or translation quality.

Extend the adult pilot with one course module and an authorized non-sensitive text PDF. Record successful extraction, relevant/correct page citation, whether the learner can resume, and failure/reteach counts. Keep repeated demo checks separate from the independent pre/post comparison. An educator reviews AI-generated answer keys before treating scores as an educational measure. Subject and fluent-language reviewers score accuracy, clarity, grounding and appropriateness with written evidence. No real learner data or improvements have been collected.

No learner pilot has been conducted. No learning gains are claimed. Automated fixture tests verify software behavior, not educational efficacy or live model quality.

For each of 5–10 consenting volunteers: explain development mode and privacy; choose one curated path; collect pre-test score; record explanation strategies and iterations; collect post-test score using the alternate comparable questions; ask for clarity (1–5) and one confusing detail; optionally conduct delayed recall after 1–3 days. Keep participant codes, not names, in evaluation exports. Obtain appropriate guardian/legal review before involving minors.

Report pre/post scores per participant, concept gaps addressed, reteaching iterations, clarity, latency, and model/API failures. Include limitations: tiny sample, two-item tests, selection bias, repeated practice, no control group. Do not infer causal improvement from this pilot.

Evaluation dataset: `evaluations/cases.json` includes prompts for correctness, clarity, age appropriateness, language, grounding, assessment quality, and misconception detection. For live evaluation, use independent subject/language reviewers and score 1–5 with written evidence. Do not use the same model's self-rating as sole validation.

## Phase 10 pilot execution protocol

Recruit 5–10 consenting adult volunteers for the first pilot; no recruitment or messaging has happened here. Use participant codes V01–V10 without names/contact details in results. Explain whether the session uses fixtures or verified live inference and whether hosted storage is enabled. Give participants a deletion option and never publish a guest token, organizer code, raw personal answer or browser profile.

For a 15–20 minute session, record topic, language, initial level, pre-test correct/total, explanation strategies, reteaching iterations, comparable post-test correct/total, clarity (1–5), response latency, API/model failures and one optional confusion note stripped of identifying details. Use separate browser contexts between volunteers. Compare the actual paired scores transparently and include the small-sample/two-item limitations. Optional delayed recall should be agreed in advance; no follow-up messages are authorized automatically.

Hosted trace smoke feedback is a synthetic visibility/privacy contract check, not a learner-quality score. Automated model/schema tests do not establish educational correctness. Have subject experts and fluent Telugu/Hindi reviewers inspect generated content when available. No completed participants, learning improvements, accuracy percentages or live latencies are reported yet.
