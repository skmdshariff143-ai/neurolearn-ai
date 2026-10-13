# Phase 10 production readiness audit

Baseline: clean local commit ae11bb5. Existing ten pages/components, provider implementations, scripts, schemas, tests, env example, license, and architecture were inspected. The original features were preserved. GitHub API reports `private=false`, default branch `main`, size 0, and `git ls-remote` returns no refs. The repository is public but contains no published source yet. No push, deployment, migration on a cloud database, purchase, or resource provisioning occurred.

| Finding | Improvement | Verification boundary |
| --- | --- | --- |
| Public inference could be called without authentication; session cookies could be rotated | Organizer code, signed one-hour access cookie, per-access/global PostgreSQL budgets; production fails closed | Signing/bypass/expiry tests; deployed live gate still needs configured database |
| Process limits cleared all active buckets when full | Remove expired buckets; reject new entries at capacity | Existing rate-limit tests; no credit-bearing production call uses memory limits |
| Request bodies were fully read before limits | Streamed byte cap with cancellation, plus schema bounds | Body limit/invalid JSON tests |
| No hosted repository | Optional PostgreSQL guest repository, private token hashes, forced RLS, restricted runtime role, server grading, idempotent attempts, export via browser merge and hosted deletion | Embedded PostgreSQL migration and real repository tests; no hosted/network test |
| Fixture research spent credits without affecting teaching | Reject research-to-fixture lessons; concurrent normalized research queries share one request | Mock transport tests; Tavily live check BLOCKED |
| Serverless traces could remain in SDK batches | Shared LangSmith client with post-response flush; nested LLM/retriever traces; usage metadata; aggregate rubric metrics | Typed SDK integration and token tests; remote visibility check BLOCKED |
| Old inference smoke used a separate unstructured request | Actual app adapter plus authenticated model catalog membership and schema validation; private evidence records | Missing-key behavior executed; live inference BLOCKED |
| Missing security headers | CSP, existing frame/MIME/referrer/permission headers; cross-site Fetch Metadata rejected | Browser security-header regression checks |
| Unsafe production defaults could be mistaken for live readiness | Config checker, explicit fixture opt-in, Node 24 engine, Vercel function duration config, precise configuration status | Production build/config checks; no Vercel deployment |

## Remaining limitations

- No credentials are present for Nebius, Tavily, LangSmith, or PostgreSQL, and no `.env.local` exists. All integration smoke evidence records are BLOCKED, not passes.
- Full dependency audit retains five high development-only advisories in the unpatched braces → micromatch → fast-glob → Next ESLint chain. Production audit returned zero advisories. No incompatible forced downgrade or undocumented vendor patch was applied.
- CSP permits inline scripts/styles required by this build; it blocks external scripts, frames, objects, and off-origin browser fetches. A strict nonce-based CSP is a future hardening task, not a claimed guarantee against XSS.
- Guest cloud cookies are bearer capabilities, not named user accounts. They are private/HttpOnly/SameSite and server storage only sees hashes. Losing one prevents recovery. Do not publish guest tokens or share browser profiles.
- Fixed-minute quotas are deliberate bounded demo protection; they do not guarantee resistance to every denial-of-service attack or replace account-level billing/credit controls.
- Consent UI, deletion, and privacy disclosures are implemented. Age verification, parent accounts, automatic retention maintenance, legal review, and real pilot testing are not complete. Hosted use should initially be an authorized adult demonstration/pilot.
- The original access-controlled Supabase account schema is preserved as a proposal. Only migration 002 is the current runnable guest schema.

Final test evidence is in BUILD_STATUS.md. Configuration booleans and embedded tests never certify a deployed service, live model, or hackathon compliance.
