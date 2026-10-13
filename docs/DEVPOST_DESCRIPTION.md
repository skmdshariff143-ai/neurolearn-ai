# NeuroLearn AI — Devpost description draft

**Learn Anything. Understand Deeply. Grow Continuously.**

NeuroLearn AI is an adaptive educational workspace for learners who need more than a quick answer. It pairs diagnostic concept checks with explanation switching, practical demonstrations, post-lesson practice, and targeted review. The learner can explore an idea in English, Telugu, or Hindi and revisit a confusing concept with a simpler explanation, analogy, worked example, or diagram.

The current application includes three curated paths: electrical transformers, Python loops and conditions, and quadratic equations. The transformer lab connects AC, changing magnetic flux and turns ratio; the Python lab traces a fixed program without executing untrusted code; the quadratic lab connects coefficients, roots, formula and graph. Recorded assessment results drive review recommendations. A wrong answer suggests a possible gap rather than certifying a learner misconception.

The technical foundation is Next.js/React/TypeScript with Zod-validated route handlers and an explicit model-provider interface. The Nebius adapter is prepared for an account-selected NVIDIA Nemotron model. Tavily retrieves filtered educational source URLs for live lessons. LangSmith traces model/retrieval workflows with learner text redacted while retaining actual latency, usage and aggregate rubric metrics. A production organizer-access gate and shared PostgreSQL quotas protect external calls. Optional hosted guest progress uses a private cookie, restricted database role, forced RLS and server-side grading; browser-only mode remains available without an account.

**Current disclosure:** the local development application and automated checks are verified, but live Nebius/NVIDIA inference, Tavily retrieval, hosted trace visibility and remote PostgreSQL operation have not succeeded yet because credentials are absent. Demonstration fixtures are labelled. The public repository is currently empty and deployment, video upload and Devpost submission have not occurred. There are no measured learner outcomes. Do not submit this draft as though those requirements were complete.

**Intended track:** Best Apps and Agents. **Intended repository:** https://github.com/skmdshariff143-ai/neurolearn-ai. **Demo URL:** pending. **YouTube URL:** pending.

Before submission, replace pending fields with verified URLs; state the exact available NVIDIA model ID and successful Nebius runtime evidence; include genuine tool feedback, observed limitations and pilot results if collected. Do not convert synthetic integration feedback or two-item concept scores into efficacy claims.
