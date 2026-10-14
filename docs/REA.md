# Research → Evaluate → Adapt — 2026-10-14

Research informs implementation choices; product descriptions are not independent proof of learning gains. No proprietary code, layouts, assets or lesson content were copied. The adaptations below are original templates and deterministic application logic. No new dependency, paid API or background service is required.

## Reference and decision inventory

| Public reference | Research finding / problem addressed | Evaluation and original adaptation |
| --- | --- | --- |
| [Khan Academy/Khanmigo](https://blog.khanacademy.org/how-khan-academy-is-building-a-better-ai-tutor-our-most-recent-learnings/) | Tutor behavior should guide understanding and use prerequisite/performance context; answer-giving and errors need monitoring | Existing strategy switcher retained; course request now includes prerequisites and asks for reasoning; test strategy requests one guiding hint at a time. Live compliance with prompts is NOT TESTED |
| [Duolingo spacing explanation](https://blog.duolingo.com/spaced-repetition-for-learning/) | Review over time rather than only rereading immediately | New concept-based queue derived from recorded attempts. Failed checks suggest one-day review; spaced successful checks suggest 3/7/14 days. These intervals are an engineering heuristic, not Duolingo's model or empirically optimized dates |
| [Coursera Better Learning](https://www.coursera.org/learn/better-learning) | Retrieval practice asks learners to recall rather than passively consume | New recall-before-reread cards ask for a novel example, assumptions and an alternative explanation; guidance is hidden in an accessible details control |
| [edX self-paced courses](https://support.edx.org/hc/en-us/articles/360049382273-Does-my-course-have-due-dates) | Learners need flexible schedules | Existing minutes/days/resumable outline retained. Review dates are suggestions, not hard locks or punitive streaks |
| [Quizlet Learn](https://quizlet.com/features/learn) | Practice tied to the learner's material | Course reviews use actual generated quiz concept IDs; unfamiliar subjects do not silently acquire a curated quiz or invented successful concepts |
| [Brilliant interactive learning](https://brilliant.org/faq/) | Active problem solving and foundational progression | Existing SVG/graph/code-trace labs and course progression retained; no competing visual design copied |
| [NotebookLM sources](https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-discover-sources/) | Traceable source context helps learners inspect claims | Existing source-ID validation, passage provenance and citations retained. IDs establish identity, not factual entailment; live factual review remains necessary |
| [Moodle access restrictions](https://docs.moodle.org/402/en/Conditional_activities) | Progress can depend on completion evidence | Existing ordered course access, replay validation and graded completion preserved. No new lock based on unsupported mastery prediction |
| [MIT OpenCourseWare learner guidance](https://ocw.mit.edu/pages/get-started/) | Independent learners can practice using structured course resources | Course lessons still load on demand; learner is encouraged to attempt reasoning before checking. No MIT problems or solutions redistributed |
| [OpenStax licensing guidance](https://help.openstax.org/s/article/Licensing-information-of-OpenStax-textbooks) | Affordable reference access needs explicit license awareness | Link/research context only. Check each specific book/version's license before importing or translating content; don't assume every book permits unrestricted commercial redistribution |
| [UNESCO GenAI education guidance](https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research) | Preserve learner agency, inclusion and privacy | Original data-minimal recall tasks, tentative diagnoses and accessible controls. No additional learner data sent to services; minors remain outside the initial adult pilot |

Independent background: [Dunlosky et al. review](https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html) evaluates study techniques, including practice testing and distributed practice. It supports prioritizing retrieval/spacing as design directions, not a claim that NeuroLearn's implementation has proven effects.

## Implemented adaptations

`src/lib/revision.ts` derives due concepts from authentic recorded activities and validated saved course attempts. Duplicate attempt identities, invalid dates and future evidence are ignored. Successful checks must be at least 24 hours apart to increase the spacing stage; failures reset it. The queue supports arbitrary course concept IDs, sorts by due date and displays at most twelve cards. It stores no additional records and needs no migration. Safe preview keeps existing transient-memory behavior.

Self-explanation prompts and a revealable self-check guide never assign points or alter completion/mastery. The learner can return to teaching or an actual graded check. Unknown subjects return to their course checks, not a substitute transformer quiz. Suggested benefits are better opportunities for recall and inspecting reasoning; benefits need human evaluation.

Fixture matching now accepts supported curated aliases rather than broad electrical/equation/loop keywords. Unrelated topics such as differential equations, transformer neural networks and Python classes explicitly remain unavailable in fixture mode. This corrects accidental substitution rather than expanding simulated subject coverage.

Course reteaching now changes from steps → simple → worked example across the two permitted reteach rounds, with an explicit simpler request respected. Existing transition/score replay and review stop remain intact. Structured test instructions guide thinking before revealing answers; fixtures remain labelled curated demonstrations.

## Preserved, deferred and blocked

- Preserved: different curated diagnostic/post questions, misconceptions labelled tentative, scores from submitted attempts, lab demonstrations, schema-validated course prerequisites, bounded orchestration, citation validation and privacy-redacted tracing.
- Deferred: automatic interleaving across unrelated concepts, full hint ladders, novel model-generated retests every round, calibrated forgetting curves, auto-grading self-explanations, large-scale educator validation. Existing repeated quizzes cannot establish independent learning gains.
- BLOCKED: actual model quality, universal live courses, grounded teaching and live-model traces until authorized Nebius access exists. No paid requests were made.

## Verification and pilot

Unit scenarios test no invented activity, ordering, duplicate evidence, invalid/future dates, weak-concept review, 24-hour spacing including midnight boundaries, arbitrary course concepts and bounded adaptation in four domains. Browser regressions check actual recall cards, guide disclosure, correct assessment deep links and preserved learner journeys. These are software tests, not learner outcomes. See EVALUATION.md for the adult pilot and BUILD_STATUS.md for executed results.
