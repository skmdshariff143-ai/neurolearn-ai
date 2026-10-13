# Deployment readiness

No deployment has been authorized or performed. Vercel-compatible Next.js routes are supplied; production readiness depends on outstanding checks and backend configuration.

1. Review docs/BUILD_STATUS.md and resolve any failed checks/security blockers. Run `npm ci`, typecheck, lint, unit tests, Playwright, and production build under Node 24.
2. Obtain owner approval before pushing to the public repository or creating a public deployment. Do not create paid resources.
3. Import the approved GitHub repository in Vercel; use Next.js preset, Node 24, `npm run build`, and standard Next.js output. There is no SQLite file or local server database to deploy.
4. For an explicitly labelled guest demo use `AI_PROVIDER=fixture`, `ALLOW_DEMO_MODE=true`. For real inference set `AI_PROVIDER=nebius`, `NEBIUS_API_KEY`, and `NEBIUS_MODEL` as secret server variables. Confirm an available NVIDIA Nemotron model ID in the account, then run the smoke test using authorized credits. Configure Tavily and LangSmith only when authorized keys exist.
5. Before public live inference add shared abuse-resistant rate limiting. Before production learner accounts apply the Postgres migration, connect an authenticated repository, test RLS isolation and deletion, and review child/privacy requirements. Do not treat browser data as a hosted production backend.
6. After authorized deployment, test every route, mobile layouts, keyboard access, provider status, errors, pre/post persistence, lab controls, and live inference on the deployed URL. Record the actual URL and evidence. No hosted route verification has happened yet.

Local model development: install a compatible model only after checking hardware and license, run an OpenAI-compatible localhost server, set LOCAL_AI_BASE_URL and LOCAL_AI_MODEL. A Vercel server cannot use your laptop's loopback server.
