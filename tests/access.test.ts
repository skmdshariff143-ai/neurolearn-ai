import { it, expect, vi, afterEach } from "vitest";
import {
  mintAccess,
  verifyAccess,
  codeMatches,
  authorizeExternal,
} from "../src/lib/access";
import { boundedJSON } from "../src/lib/http";
afterEach(() => vi.unstubAllEnvs());
it("verifies signed access and rejects expiry/tampering", () => {
  vi.stubEnv("SESSION_SIGNING_SECRET", "test-secret-".repeat(4));
  const now = 1700000000000;
  const token = mintAccess(now);
  expect(verifyAccess(token, now)).toMatch(/^[a-f0-9]{32}$/);
  expect(verifyAccess(token + "x", now)).toBeNull();
  expect(verifyAccess(token, now + 3600001)).toBeNull();
});
it("matches organizer codes without plaintext comparison and rejects missing configuration", () => {
  vi.stubEnv("LIVE_AI_ACCESS_CODE", "organizer-test-code-".repeat(2));
  expect(codeMatches("wrong")).toBe(false);
  expect(codeMatches("organizer-test-code-".repeat(2))).toBe(true);
  vi.stubEnv("LIVE_AI_ACCESS_CODE", "");
  expect(() => codeMatches("anything")).toThrow("not configured");
});
it("fails closed for production external calls without access", async () => {
  vi.stubEnv("NODE_ENV", "production");
  await expect(authorizeExternal(undefined)).rejects.toMatchObject({
    status: 401,
  });
});
it("bounds streamed body bytes even without Content-Length", async () => {
  const request = new Request("http://localhost", {
    method: "POST",
    body: "x".repeat(2048),
  });
  await expect(boundedJSON(request, 100)).rejects.toMatchObject({
    status: 413,
  });
});
it("validates JSON and rejects malformed input", async () => {
  await expect(
    boundedJSON(
      new Request("http://localhost", { method: "POST", body: "bad" }),
    ),
  ).rejects.toMatchObject({ status: 400 });
  expect(
    await boundedJSON(
      new Request("http://localhost", {
        method: "POST",
        body: '{"topic":"Python"}',
      }),
    ),
  ).toEqual({ topic: "Python" });
});
