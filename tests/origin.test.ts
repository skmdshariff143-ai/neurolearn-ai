import { it, expect } from "vitest";
import { isSameOrigin } from "../src/lib/origin";
it("allows the incoming host even when the framework uses an internal canonical URL", () => {
  expect(
    isSameOrigin(
      new Request("http://localhost:3000/api/tutor", {
        headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" },
      }),
    ),
  ).toBe(true);
});
it("rejects hostile, malformed, and different-protocol origins", () => {
  for (const origin of [
    "https://attacker.example",
    "null",
    "https://localhost:3000",
  ])
    expect(
      isSameOrigin(
        new Request("http://localhost:3000/api/tutor", {
          headers: { host: "localhost:3000", origin },
        }),
      ),
    ).toBe(false);
});
