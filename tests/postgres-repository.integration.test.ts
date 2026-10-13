import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
const state = vi.hoisted(() => ({
  db: null as import("@electric-sql/pglite").PGlite | null,
}));
vi.mock("pg", () => ({
  Pool: class {
    on() {}
    async connect() {
      return {
        query: async (sql: string, params?: unknown[]) =>
          state.db!.query(sql, params),
        release() {},
      };
    }
  },
}));
import {
  loadGuest,
  saveGuestProfile,
  saveGuestAssessment,
  deleteGuest,
} from "../src/lib/postgres";
const a = "c".repeat(64),
  b = "d".repeat(64);
beforeAll(async () => {
  vi.stubEnv("DATABASE_URL", "postgresql://localhost/embedded-test");
  state.db = new PGlite();
  await state.db.exec(
    readFileSync("db/migrations/002_guest_postgres.sql", "utf8"),
  );
  await state.db.exec("set role neurolearn_app");
}, 30000);
afterAll(async () => {
  vi.unstubAllEnvs();
  await state.db?.close();
});
describe("actual application repository over embedded PostgreSQL client bridge", () => {
  it("persists profile and server-grades answers; idempotent retry does not add records", async () => {
    expect((await loadGuest(a)).activities).toEqual([]);
    await saveGuestProfile(a, {
      language: "Hindi",
      level: "Beginner",
      goal: "Learn",
      minutes: 20,
      style: "simple",
      reducedMotion: true,
    });
    const input = {
      id: "33333333-3333-4333-8333-333333333333",
      topic: "Electrical transformers",
      kind: "diagnostic" as const,
      answers: [0, 2],
    };
    expect((await saveGuestAssessment(a, input)).score).toBe(50);
    await saveGuestAssessment(a, input);
    const saved = await loadGuest(a);
    expect(saved.profile?.language).toBe("Hindi");
    expect(saved.activities).toHaveLength(1);
  });
  it("isolates guest snapshots and deletes owned progress", async () => {
    expect((await loadGuest(b)).activities).toEqual([]);
    await deleteGuest(a);
    expect((await loadGuest(a)).activities).toEqual([]);
  });
  it("refuses a privileged runtime role", async () => {
    await state.db!.exec("reset role");
    try {
      await expect(loadGuest(b)).rejects.toThrow("must not be superuser");
    } finally {
      await state.db!.exec("set role neurolearn_app");
    }
  });
});
