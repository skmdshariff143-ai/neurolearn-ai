import { it, expect, vi, afterEach } from "vitest";
import { browserRepository, defaultProfile } from "../src/lib/repository";
afterEach(() => vi.unstubAllGlobals());
it("preserves validated guest results and clears records", () => {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  });
  browserRepository.saveProfile({ ...defaultProfile, language: "Telugu" });
  expect(browserRepository.profile().language).toBe("Telugu");
  browserRepository.saveActivity({
    id: "one",
    topic: "Python",
    kind: "diagnostic",
    score: 50,
    weak: ["range"],
    at: "2026-10-13",
    iterations: 1,
  });
  expect(browserRepository.activities()[0].score).toBe(50);
  store.set("nl-activities", "corrupt");
  expect(browserRepository.activities()).toEqual([]);
  browserRepository.clear();
  expect(browserRepository.profile()).toEqual(defaultProfile);
});
