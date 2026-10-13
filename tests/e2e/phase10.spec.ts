import { test, expect } from "@playwright/test";
test("production live calls and unconfigured persistence fail closed", async ({
  request,
}) => {
  const research = await request.post("/api/tutor", {
    data: { topic: "Transformers", research: true },
  });
  expect(research.status()).toBe(401);
  expect((await research.json()).error).toContain("Unlock live AI access");
  expect(
    (
      await request.post("/api/access", { data: { code: "not-a-secret" } })
    ).status(),
  ).toBe(503);
  expect((await request.get("/api/progress")).status()).toBe(503);
  expect(
    (
      await request.get("/api/progress", {
        headers: { "sec-fetch-site": "cross-site" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/workflow", {
        data: {
          task: "roadmap",
          topic: "Python",
          language: "English",
          days: 3,
        },
      })
    ).status(),
  ).toBe(503);
});
test("same-origin mutation protection and CSP are present", async ({
  request,
}) => {
  for (const route of ["/api/access", "/api/progress"])
    expect(
      (
        await request.post(route, {
          headers: { Origin: "https://attacker.example" },
          data: {},
        })
      ).status(),
    ).toBe(403);
  const response = await request.get("/");
  const csp = response.headers()["content-security-policy"];
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).not.toContain("unsafe-eval");
  const status = await request.get("/api/status");
  const body = await status.json();
  expect(body.rateLimitBackend).toBe("memory");
  expect(body.persistence).toContain("browser-local");
  expect(body.liveVerification).toContain("Not established");
});
