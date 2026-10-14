# Vercel target investigation — 2026-10-14

Read-only investigation. No deployment, remote configuration change, branch creation/push, billing change or project deletion was performed. At that investigation, local HEAD was 8cbf5f0f8c74afc1c1f25813124c415f7e6b01f3.

## Root cause and evidence

The [official environment guide](https://vercel.com/docs/deployments/environments#first-deployment) states that the first deployment of a new project is always Production, including non-production branches and CLI deployments without a production flag. Preview routing applies after the first Production deployment exists. The installed CLI 64.0.2 contains the matching first-deployment notice in its deploy command and presentation code. This corrects the earlier assumption that the observed behavior necessarily indicated a CLI/platform bug.

Current API readback shows no Production target and zero deployments. Both prior attempts were canceled/deleted, so a successful initializing Production deployment does not exist. This matches the documented first-deployment behavior. Merely renaming the branch or adding an explicit Preview CLI target cannot safely bypass it on this new project. There is no evidence that the connector rewrote the target: it failed project creation with 403 and was not used for the later CLI deployment. The first Git API attempt also omitted target; its source ref was the approved SHA, not a dedicated branch. Actual wire captures of past requests are unavailable, but first-deployment policy independently explains the observed Production result.

## Verified settings

| Setting | Readback |
| --- | --- |
| Project | neurolearn-ai / prj_tAAZ8ADLhAhFXo7vzlSEtBeaehTu |
| Workspace | Shaik Mahammad Shariff's projects / shaik-mahammad-shariff-s-projects |
| Plan | Hobby |
| Git repository | skmdshariff143-ai/neurolearn-ai |
| Production branch | main |
| Automatic Git deployments | disabled |
| Authentication | ssoProtection.deploymentType = preview |
| Remaining deployments / Production target | 0 / absent |
| Existing default domain | neurolearn-ai-pink.vercel.app; no Git branch or custom environment assignment |
| Framework / Node | Next.js / 24.x |
| Remote branches | main only, at d4e6fb0255952e2be48481ac6bb046036e8a1755 |

Each of these variables exists once with target exactly Preview and no branch override:

```ini
NEXT_PUBLIC_SAFE_PREVIEW=true
AI_PROVIDER=fixture
ALLOW_DEMO_MODE=true
PERSISTENCE_PROVIDER=browser
RATE_LIMIT_BACKEND=memory
LANGSMITH_TRACING=false
```

Preview has zero entries for provider keys, DATABASE_URL/DATABASE_ADMIN_URL, model selection, session signing secrets or live access codes. These settings are correct for Preview but do not configure the required initial Production build. Current preview-only authentication does not cover Production URLs.

## Conditional safe plan — not executed

Under the current prohibition on Production deployments, **stop here**. No dedicated branch can produce the first Preview while avoiding the documented bootstrap rule. Obtain either a Vercel-supported exception confirmed before deployment or separate approval for the protected fixture-only Production bootstrap below. No paid plan is needed for the proposed authentication scope; actual account readback must still confirm availability before release.

1. With explicit approval, strengthen authentication to All Deployments (`ssoProtection.deploymentType=all`). [Official protection documentation](https://vercel.com/docs/deployment-protection#all-deployments) says this is available on all plans and covers Production domains as well as generated URLs. Do not disable authentication, add exceptions or create shareable bypass links. Confirm the setting and existing default-domain coverage before any build.
2. With approval, assign the same six fixture-only values above to Production as well as Preview. Ensure no live/admin/runtime secrets exist in either environment. Do not import private local environment files. Keep automatic Git deployment disabled.
3. With separate explicit deployment approval, bootstrap exactly one protected fixture-only deployment from the already-approved d4e6fb0 source. Acknowledge that Vercel will classify it as Production. Do not run a production flag, promote a live application, buy/attach a custom domain, or enable AI/storage. All Deployments authentication must already be active. Immediately verify anonymous denial, owner access, fixture labels, noindex and disabled uploads/storage/integrations. If protection cannot be configured free or a prerequisite fails, do not deploy.
4. After a verified Production bootstrap exists, approve creating/pushing `fixture-preview` from the same exact approved SHA. This publishes a branch reference to already-public source, not later local commits. If the latest 8cbf5f0 changes are preferred, approve that different publication explicitly. Do not force-push, overwrite an existing branch or change `main`.
5. Keep Git automatic deployments disabled and request a manual Preview deployment from a clean isolated checkout of `fixture-preview`, using the linked project and explicit Preview target. A branch push alone will not deploy with the current disabled setting. Check the remote branch SHA, inherited Preview values, absence of overrides/secrets, project/workspace and authentication before release. No custom staging environment or paid feature is needed.
6. Inspect the actual returned target, deployment environment and exact source SHA; expect Preview/null, not Production. Test anonymous denial and authorized access plus all fixture restrictions on the real URL. Stop/cancel on a target mismatch. Do not claim the issue operationally resolved before these checks succeed.

## Future commands — gated, not executed

Only after protected bootstrap and branch-publication approval:

```powershell
git branch fixture-preview d4e6fb0255952e2be48481ac6bb046036e8a1755
git push origin refs/heads/fixture-preview:refs/heads/fixture-preview
git ls-remote origin refs/heads/fixture-preview
```

Stop if fixture-preview already exists or differs. Create an isolated checkout at that SHA/branch, link the existing project without pulling credentials into the application, then—only after deployment approval—use:

```powershell
npx --yes vercel@64.0.2 deploy --target preview --project prj_tAAZ8ADLhAhFXo7vzlSEtBeaehTu --scope shaik-mahammad-shariff-s-projects
```

Run from that clean isolated checkout, not the private development directory. This command remains unsafe as a first deployment under current settings; it is a later-stage instruction only. A dry run can inspect inputs but cannot prove target/protection behavior.

## Approval required

No approval is assumed for All Deployments configuration, Production fixture variables, the initializing protected Production deployment, branch publication, or the subsequent Preview release. The owner must explicitly approve the exact scope; approval for Preview alone does not authorize the bootstrap. If the owner retains a strict no-Production policy, deployment remains BLOCKED. Root cause is now explained; no hosted resolution or new test deployment is claimed.
