# Educational evaluation

No learner pilot has been conducted. No learning gains are claimed. Automated fixture tests verify software behavior, not educational efficacy or live model quality.

For each of 5–10 consenting volunteers: explain development mode and privacy; choose one curated path; collect pre-test score; record explanation strategies and iterations; collect post-test score using the alternate comparable questions; ask for clarity (1–5) and one confusing detail; optionally conduct delayed recall after 1–3 days. Keep participant codes, not names, in evaluation exports. Obtain appropriate guardian/legal review before involving minors.

Report pre/post scores per participant, concept gaps addressed, reteaching iterations, clarity, latency, and model/API failures. Include limitations: tiny sample, two-item tests, selection bias, repeated practice, no control group. Do not infer causal improvement from this pilot.

Evaluation dataset: `evaluations/cases.json` includes prompts for correctness, clarity, age appropriateness, language, grounding, assessment quality, and misconception detection. For live evaluation, use independent subject/language reviewers and score 1–5 with written evidence. Do not use the same model's self-rating as sole validation.
