import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
const db = new PGlite();
const alice = "a".repeat(64),
  bob = "b".repeat(64);
async function asGuest<T>(hash: string, fn: () => Promise<T>) {
  await db.exec("begin; set local role neurolearn_app");
  try {
    await db.query("select set_config('neurolearn.token_hash',$1,true)", [
      hash,
    ]);
    const result = await fn();
    await db.exec("commit");
    return result;
  } catch (e) {
    await db.exec("rollback");
    throw e;
  }
}
beforeAll(async () => {
  await db.exec(readFileSync("db/migrations/002_guest_postgres.sql", "utf8"));
}, 30000);
afterAll(async () => {
  await db.close();
});
describe("actual embedded PostgreSQL migration and RLS", () => {
  it("applies the migration and stores an owned assessment", async () => {
    const guest = await asGuest(alice, () =>
      db.query<{ id: string }>(
        "insert into neurolearn.guests(token_hash) values($1) returning id",
        [alice],
      ),
    );
    await asGuest(alice, () =>
      db.query(
        "insert into neurolearn.activities(id,learner_id,topic,kind,score,weak,iterations) values('11111111-1111-4111-8111-111111111111',$1,'Transformers','diagnostic',50,'[]',1)",
        [guest.rows[0].id],
      ),
    );
    const result = await asGuest(alice, () =>
      db.query("select * from neurolearn.activities"),
    );
    expect(result.rows).toHaveLength(1);
  });
  it("prevents another guest reading, altering, or inserting into the first guest records", async () => {
    await asGuest(bob, () =>
      db.query("insert into neurolearn.guests(token_hash) values($1)", [bob]),
    );
    expect(
      (
        await asGuest(bob, () =>
          db.query("select * from neurolearn.activities"),
        )
      ).rows,
    ).toHaveLength(0);
    expect(
      (
        await asGuest(bob, () =>
          db.query("delete from neurolearn.activities returning id"),
        )
      ).rows,
    ).toHaveLength(0);
    const owner = await asGuest(alice, () =>
      db.query<{ id: string }>("select id from neurolearn.guests"),
    );
    await expect(
      asGuest(bob, () =>
        db.query(
          "insert into neurolearn.activities(id,learner_id,topic,kind,score,weak,iterations) values('22222222-2222-4222-8222-222222222222',$1,'Python','practice',100,'[]',1)",
          [owner.rows[0].id],
        ),
      ),
    ).rejects.toThrow(/row-level security/i);
  });
  it("does not permit reading data without an owner context", async () => {
    await db.exec("begin;set local role neurolearn_app");
    try {
      expect(
        (await db.query("select * from neurolearn.guests")).rows,
      ).toHaveLength(0);
      expect(
        (await db.query("select * from neurolearn.activities")).rows,
      ).toHaveLength(0);
    } finally {
      await db.exec("rollback");
    }
  });
  it("atomically caps a shared budget and hides bucket data from app role", async () => {
    await db.exec("set role neurolearn_app");
    try {
      const results = await Promise.all(
        Array.from({ length: 5 }, () =>
          db.query<{ allowed: boolean }>(
            "select neurolearn.consume_budget('test',3) as allowed",
          ),
        ),
      );
      expect(results.filter((r) => r.rows[0].allowed)).toHaveLength(3);
      await expect(
        db.query("select * from neurolearn.request_buckets"),
      ).rejects.toThrow(/permission denied/i);
    } finally {
      await db.exec("reset role");
    }
  });
  it("deletes only the current guest and cascades its progress", async () => {
    await asGuest(alice, () => db.query("delete from neurolearn.guests"));
    expect(
      (
        await asGuest(alice, () =>
          db.query("select * from neurolearn.activities"),
        )
      ).rows,
    ).toHaveLength(0);
    expect(
      (await asGuest(bob, () => db.query("select * from neurolearn.guests")))
        .rows,
    ).toHaveLength(1);
  });
});
