# NeuroLearn AI contributor instructions

Use strict TypeScript and validate external inputs and AI outputs with Zod. Keep credentials server-side. Never silently fall back from live inference to fixtures. Fixture responses must remain visibly labelled. Do not publish, push, deploy, purchase resources, or enable billable services without the owner's approval.

Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and relevant Playwright tests after functional changes. Record actual checks and blockers in docs/BUILD_STATUS.md. Do not report learning outcomes or integration verification without evidence. Do not execute learner code on the application server. Browser-only guest storage is not a substitute for production persistence.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
