// Compatibility entry point. The TypeScript verifier uses the actual app adapter.
import { spawnSync } from "node:child_process";
const result = spawnSync(
  process.execPath,
  [
    "--env-file-if-exists=.env.local",
    "--import=tsx",
    "scripts/verify-integrations.ts",
    "--nebius",
    ...process.argv.slice(2),
  ],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
