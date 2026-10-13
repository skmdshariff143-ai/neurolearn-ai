import { it, expect, vi, afterEach } from "vitest";
import { remoteRepository } from "../src/lib/remote-repository";
const activity = (id: string, at: string, score = 100) => ({
  id,
  at,
  score,
  topic: "Python",
  kind: "diagnostic",
  weak: [],
  iterations: 1,
});
function storage(initial: unknown[]) {
  const store = new Map<string, string>([
    ["nl-activities", JSON.stringify(initial)],
  ]);
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  });
  return store;
}
afterEach(() => vi.unstubAllGlobals());
it("reconciles server-graded records and keeps offline history in chronological order", async () => {
  const store = storage([
    activity("same", "2026-10-12T00:00:00.000Z"),
    activity("new", "2026-10-13T00:00:00.000Z"),
  ]);
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            profile: null,
            activities: [
              activity("old", "2026-10-11T00:00:00.000Z"),
              activity("same", "2026-10-12T00:00:00.000Z", 50),
            ],
          }),
        ),
      ),
  );
  await remoteRepository.load();
  const records = JSON.parse(store.get("nl-activities")!);
  expect(records.map((r: { id: string }) => r.id)).toEqual([
    "old",
    "same",
    "new",
  ]);
  expect(records[1].score).toBe(50);
});
it("does not destroy local progress when hosted loading fails", async () => {
  const store = storage([activity("local", "2026-10-13T00:00:00.000Z")]);
  const before = store.get("nl-activities");
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response('{"error":"Unavailable"}', { status: 503 }),
      ),
  );
  await expect(remoteRepository.load()).rejects.toThrow("Unavailable");
  expect(store.get("nl-activities")).toBe(before);
});
