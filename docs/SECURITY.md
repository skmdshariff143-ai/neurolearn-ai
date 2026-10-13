# Security review

API keys are server-only env vars. No NEXT_PUBLIC credential variables exist. React renders model explanations as text, preventing HTML execution. KaTeX receives a fixed developer-controlled formula. User code is never executed. Tutor requests validate topic/language/strategy and bound message size. Cross-origin requests are rejected, session cookies are HttpOnly/SameSite strict, and responses avoid caching learner text. Headers disable framing and MIME sniffing and restrict unnecessary browser capabilities.

External calls use timeouts and bounded retries. Live errors never fall back to fixtures. Local inference accepts only loopback hostnames. Production fixtures need explicit opt-in. Public status shows booleans/configuration only, no secrets.

Known limitations: process-local session rate limiting is not sufficient for a public paid-inference endpoint (cookie rotation and multiple instances can bypass it). Deploy with a shared limiter and authenticated/abuse-resistant identity before enabling public inference. Add a tested CSP before launch. Browser storage is readable by anyone with that browser profile. Authenticated persistence is not wired. RLS migration must be verified against cross-user access after integration. No formal penetration test has been performed.

Do not publicly onboard children until parental consent, age handling, retention, deletion, and applicable legal obligations have been reviewed. Generated safety instructions reduce risk but are not a guaranteed safety classifier.

Dependency audit on 2026-10-13: production dependency audit returned zero advisories. Full audit after upgrading LangSmith, KaTeX, and Vitest still reports five high advisories in development dependencies (braces → micromatch → fast-glob → Next.js ESLint tooling). Registry latest braces is 3.0.3 and the reported range includes it; a speculative 3.0.4 override failed because no such release exists. No forced incompatible ESLint/Next.js downgrade was applied. Do not feed untrusted glob patterns into development tooling. This remains a known development security limitation.
