import { afterEach, expect, it, vi } from "vitest";
import { databasePoolOptions, assertRestrictedRole } from "../src/lib/postgres";
import type { PoolClient } from "pg";
afterEach(() => vi.unstubAllEnvs());
it("requires hostname-verified TLS for hosted connections even in development", () => {
  vi.stubEnv("NODE_ENV", "development");
  for (const mode of [
    "",
    "?sslmode=disable",
    "?sslmode=require",
    "?sslmode=verify-ca",
  ])
    expect(() =>
      databasePoolOptions(`postgresql://example.org/postgres${mode}`),
    ).toThrow("verified TLS");
  expect(
    databasePoolOptions(
      "postgresql://example.org/postgres?sslmode=verify-full",
    ),
  ).toMatchObject({
    max: 1,
    connectionTimeoutMillis: 5000,
    statement_timeout: 8000,
  });
  expect(databasePoolOptions("postgresql://localhost/local").max).toBe(1);
  expect(() => databasePoolOptions("https://example.org/db")).toThrow(
    "PostgreSQL",
  );
  vi.stubEnv("NODE_TLS_REJECT_UNAUTHORIZED", "0");
  expect(() =>
    databasePoolOptions(
      "postgresql://example.org/postgres?sslmode=verify-full",
    ),
  ).toThrow("verified TLS");
});
it.each([
  "rolsuper",
  "rolbypassrls",
  "rolcreaterole",
  "rolcreatedb",
  "owns_data",
])("rejects runtime privilege %s", async (flag) => {
  const client = {
    query: async () => ({ rows: [{ [flag]: true }] }),
  } as unknown as PoolClient;
  await expect(assertRestrictedRole(client)).rejects.toThrow(
    "Database runtime role",
  );
});
