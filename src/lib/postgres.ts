import { Pool, type PoolClient } from "pg";
import { createHash } from "node:crypto";
import { z } from "zod";
import { activitySchema, profileSchema, type Profile } from "./domain";
import { questions } from "./content";
import { grade } from "./domain";
import { safePreview } from "./preview";
let pool: Pool | undefined;
export function databasePoolOptions(connectionString: string) {
  const url = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(url.protocol))
    throw new Error("DATABASE_URL must use PostgreSQL");
  if (
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
    (url.searchParams.get("sslmode") !== "verify-full" ||
      process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0")
  )
    throw new Error(
      "Hosted DATABASE_URL must use verified TLS with hostname verification",
    );
  return {
    connectionString,
    max: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 8000,
  };
}
export function databasePool() {
  if (safePreview)
    throw new Error("Hosted persistence is disabled in safe preview");
  if (!process.env.DATABASE_URL)
    throw new Error("PostgreSQL is not configured");
  if (!pool) {
    pool = new Pool(databasePoolOptions(process.env.DATABASE_URL));
    pool.on("error", () => {
      /* Do not log connection URLs or credentials. */
    });
  }
  return pool;
}
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export async function assertRestrictedRole(client: PoolClient) {
  const result = await client.query(
    "select rolsuper,rolbypassrls,rolcreaterole,rolcreatedb,exists(select 1 from pg_tables where schemaname='neurolearn' and tableowner=current_user) as owns_data from pg_roles where rolname=current_user",
  );
  const role = result.rows[0];
  if (
    !role ||
    role.rolsuper ||
    role.rolbypassrls ||
    role.rolcreaterole ||
    role.rolcreatedb ||
    role.owns_data
  )
    throw new Error(
      "Database runtime role must not be superuser or bypass RLS",
    );
}
export async function guestTransaction<T>(
  token: string,
  operation: (client: PoolClient, owner: string) => Promise<T>,
): Promise<T> {
  if (!/^[0-9a-f]{64}$/.test(token)) throw new Error("Invalid guest token");
  const client = await databasePool().connect();
  try {
    await assertRestrictedRole(client);
    await client.query("begin");
    await client.query("select set_config('neurolearn.token_hash',$1,true)", [
      hashToken(token),
    ]);
    const guest = await client.query(
      "insert into neurolearn.guests(token_hash) values($1) on conflict(token_hash) do update set token_hash=excluded.token_hash returning id",
      [hashToken(token)],
    );
    const value = await operation(client, guest.rows[0].id as string);
    await client.query("commit");
    return value;
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}
export const assessmentInputSchema = z.object({
  id: z.uuid(),
  topic: z.string().trim().min(2).max(200),
  kind: z.enum(["diagnostic", "practice"]),
  answers: z.array(z.number().int().min(0).max(3)).length(2),
});
export async function loadGuest(token: string) {
  return guestTransaction(token, async (client, owner) => {
    const profile = await client.query(
      "select profile from neurolearn.guests where id=$1",
      [owner],
    );
    const records = await client.query(
      "select id,topic,kind,score,weak,iterations,at from neurolearn.activities where learner_id=$1 order by at desc limit 500",
      [owner],
    );
    return {
      profile: profile.rows[0].profile
        ? profileSchema.parse(profile.rows[0].profile)
        : null,
      activities: z
        .array(activitySchema)
        .parse(
          records.rows
            .map((row) => ({ ...row, at: new Date(row.at).toISOString() }))
            .reverse(),
        ),
    };
  });
}
export async function saveGuestProfile(token: string, profile: Profile) {
  return guestTransaction(token, async (client, owner) => {
    await client.query(
      "update neurolearn.guests set profile=$1::jsonb where id=$2",
      [JSON.stringify(profileSchema.parse(profile)), owner],
    );
  });
}
export async function saveGuestAssessment(
  token: string,
  input: z.infer<typeof assessmentInputSchema>,
) {
  const parsed = assessmentInputSchema.parse(input);
  const qs = questions(parsed.topic, parsed.kind === "practice");
  if (!qs.length) throw new Error("Choose a curated assessment topic");
  const result = grade(qs, parsed.answers);
  return guestTransaction(token, async (client, owner) => {
    const previous = await client.query(
      "select count(*)::integer as count from neurolearn.activities where learner_id=$1 and topic=$2 and kind=$3",
      [owner, parsed.topic, parsed.kind],
    );
    const inserted = await client.query(
      "insert into neurolearn.activities(id,learner_id,topic,kind,score,weak,iterations) values($1,$2,$3,$4,$5,$6::jsonb,$7) on conflict(id) do nothing returning id,topic,kind,score,weak,iterations,at",
      [
        parsed.id,
        owner,
        parsed.topic,
        parsed.kind,
        result.score,
        JSON.stringify(result.diagnoses.map((d) => d.concept)),
        previous.rows[0].count + 1,
      ],
    );
    let row = inserted.rows[0];
    if (!row) {
      const existing = await client.query(
        "select id,topic,kind,score,weak,iterations,at from neurolearn.activities where id=$1 and learner_id=$2",
        [parsed.id, owner],
      );
      row = existing.rows[0];
      if (!row) throw new Error("Assessment ID conflict");
    }
    return activitySchema.parse({ ...row, at: new Date(row.at).toISOString() });
  });
}
export async function deleteGuest(token: string) {
  return guestTransaction(token, async (client, owner) => {
    await client.query("delete from neurolearn.guests where id=$1", [owner]);
  });
}
// Cleanup verification must not call loadGuest/loadLibrary: both create guests.
export async function guestExists(token: string) {
  if (!/^[0-9a-f]{64}$/.test(token)) throw new Error("Invalid guest token");
  const client = await databasePool().connect();
  try {
    await assertRestrictedRole(client);
    await client.query("begin");
    await client.query("select set_config('neurolearn.token_hash',$1,true)", [
      hashToken(token),
    ]);
    const result = await client.query(
      "select id from neurolearn.guests where token_hash=$1",
      [hashToken(token)],
    );
    await client.query("commit");
    return result.rows.length > 0;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
export async function consumeDatabaseBudget(key: string, cap: number) {
  const client = await databasePool().connect();
  try {
    await assertRestrictedRole(client);
    const result = await client.query(
      "select neurolearn.consume_budget($1,$2) as allowed",
      [key, cap],
    );
    return result.rows[0].allowed === true;
  } finally {
    client.release();
  }
}
