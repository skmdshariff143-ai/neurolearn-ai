import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
const paths = [
  ...new Set(
    execFileSync(
      "git",
      ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
      { encoding: "utf8" },
    )
      .split("\0")
      .filter(Boolean),
  ),
];
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:sk-|tvly-|lsv2_|ghp_|github_pat_)[A-Za-z0-9_-]{20,}/,
  /^[ \t]*(?:NEBIUS_API_KEY|TAVILY_API_KEY|LANGSMITH_API_KEY|DATABASE_URL|SESSION_SIGNING_SECRET|LIVE_AI_ACCESS_CODE)[ \t]*=[ \t]*[^\s#]+/m,
];
const issues = [];
for (const path of paths) {
  if (/(?:^|\/)\.env(?:\.|$)/.test(path) && path !== ".env.example") {
    issues.push({ file: path, reason: "Tracked credential environment file" });
    continue;
  }
  let contents;
  try {
    contents = readFileSync(path);
  } catch {
    continue;
  }
  if (contents.includes(0)) continue;
  if (patterns.some((pattern) => pattern.test(contents.toString("utf8"))))
    issues.push({
      file: path,
      reason: "Potential credential pattern; value not printed",
    });
}
console.log(
  JSON.stringify(
    {
      filesChecked: paths.length,
      issues,
      scope:
        "Limited pattern scan of tracked and non-ignored source files; not a complete secret-detection guarantee",
    },
    null,
    2,
  ),
);
process.exit(issues.length ? 1 : 0);
