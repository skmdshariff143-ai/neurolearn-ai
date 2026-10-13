import {
  createHmac,
  randomBytes,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { consumeDatabaseBudget } from "./postgres";
import { allowRequest } from "./rate-limit";
import { HTTPError } from "./http";
export const accessCookie = "nl-ai-access";
export function accessRestricted() {
  return process.env.NODE_ENV === "production";
}
function signingSecret() {
  const secret = process.env.SESSION_SIGNING_SECRET;
  if (!secret || secret.length < 32)
    throw new HTTPError("Live access is not configured", 503);
  return secret;
}
function mac(value: string) {
  return createHmac("sha256", signingSecret()).update(value).digest("hex");
}
export function mintAccess(now = Date.now()) {
  const payload = `${randomBytes(16).toString("hex")}.${now + 3600000}`;
  return `${payload}.${mac(payload)}`;
}
export function verifyAccess(
  token: string | undefined,
  now = Date.now(),
): string | null {
  if (!token || token.length > 180) return null;
  const [id, expires, signature, ...extra] = token.split(".");
  if (
    extra.length ||
    !/^[a-f0-9]{32}$/.test(id) ||
    !/^[a-f0-9]{64}$/.test(signature ?? "") ||
    !/^\d{13}$/.test(expires ?? "")
  )
    return null;
  const end = Number(expires);
  if (end <= now || end > now + 3600000) return null;
  const expected = mac(`${id}.${expires}`);
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    ? id
    : null;
}
export function codeMatches(code: string) {
  const expected = process.env.LIVE_AI_ACCESS_CODE;
  if (!expected || expected.length < 24)
    throw new HTTPError("Live access code is not configured", 503);
  return timingSafeEqual(
    createHash("sha256").update(code).digest(),
    createHash("sha256").update(expected).digest(),
  );
}
export async function requestBudget(key: string, cap = 12) {
  if (process.env.RATE_LIMIT_BACKEND === "postgres") {
    try {
      return await consumeDatabaseBudget(key, cap);
    } catch {
      throw new HTTPError(
        "Shared request limits are unavailable. No external call was made.",
        503,
      );
    }
  }
  if (process.env.NODE_ENV === "production")
    throw new HTTPError(
      "Shared request limits must be configured before live access",
      503,
    );
  return allowRequest(key);
}
export async function authorizeExternal(token: string | undefined) {
  if (accessRestricted()) {
    const id = verifyAccess(token);
    if (!id)
      throw new HTTPError(
        "Unlock live AI access in Settings with the organizer access code.",
        401,
      );
    if (
      !(await requestBudget("ai:global", 12)) ||
      !(await requestBudget(`ai:${id}`, 6))
    )
      throw new HTTPError("Live request budget reached. Wait one minute.", 429);
  } else if (!allowRequest("development-external-global"))
    throw new HTTPError("Request limit reached. Wait one minute.", 429);
}
