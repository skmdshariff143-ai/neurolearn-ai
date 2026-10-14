# Supabase Free PostgreSQL setup

## Activation assessment — 2026-10-14

Owner supplied Supabase project reference zwylxrtytktpynmwlzmg. Its API endpoint is identified; the exact selected database pooler host is still missing and no Supabase connector is callable. Private DATABASE_URL and DATABASE_ADMIN_URL are absent. The read-only preflight stopped before any external request; database version, TLS, pooling, role privileges and whether migrations 002/003 already exist are NOT VERIFIED. No migration, role/password setup or synthetic hosted write occurred. Exact target approval is pending and will be requested only after reference/host and catalog assessment are available.

Use ignored .env.database-admin.local for a temporary DATABASE_ADMIN_URL, read only by the assessment/migration process; Next.js must not receive administrator credentials. Keep restricted DATABASE_URL in .env.local. Neither file nor connection value should enter Git or chat. Non-secret project reference and exact Connect-panel host may be shared. The migration order and restricted-role SQL in POSTGRES_SETUP.md remain unchanged.


Prepared 2026-10-14; no hosted project or migration was created. Selected candidate: Supabase Free. [Pricing](https://supabase.com/pricing) currently lists $0/month, 500 MB database storage, two active projects and pausing after one week of inactivity; automatic backups are not included. Do not enable paid plans/add-ons. Plan manual backups and restore checks before using genuine learner data.

## Compatibility

Migrations use UUID, JSONB, foreign keys, RLS, PL/pgSQL and transaction-local settings. PostgreSQL 13+ includes gen_random_uuid(); no extension is needed on modern Supabase. Custom schema and roles are supported in principle; actual managed-role permissions remain untested. The app uses node-postgres directly, not Supabase Auth/Data API. Do not expose neurolearn through the Data API or grant it to anon/authenticated/service_role.

The [shared transaction pooler](https://supabase.com/docs/guides/database/connecting-to-postgres) is appropriate for serverless. Guest transactions pin one client and use set_config(..., true); no named prepared statements, pipelining or persistent session identity are used. Pool max=1 per warm instance, 5-second connection, 8-second statement and 10-second idle timeouts. Instance count still affects total connections; load is unverified. Use session mode or direct connections for migrations. No schema rewrite is planned.

## Owner setup and approval boundary

1. Choose a Free organization/new dedicated Supabase project and suitable region. Store the administrator password privately. Stop if setup requires a purchase/card/add-on. No creation is authorized/executed by this document.
2. Record project reference, region, database name and Connect-panel host without sharing passwords. Approve that specific target and migrations 002 then 003 plus restricted-role setup before any remote mutation. The app never auto-migrates.
3. In that project's SQL editor, run this read-only preflight. A fresh target should have no neurolearn schema or either role; the UUID function must exist. Verify the selected dashboard project reference too: current_database() is often postgres across projects.

```sql
select current_database(), current_user, version();
select to_regnamespace('neurolearn'), to_regprocedure('pg_catalog.gen_random_uuid()');
select rolname from pg_roles where rolname in ('neurolearn_app','neurolearn_runtime');
```

4. After target approval, apply db/migrations/002_guest_postgres.sql then 003_learning_entities.sql exactly once as migration administrator. Both have explicit transactions; stop at the first error. Do not apply db/proposals or blindly rerun CREATE statements. SQL editor or psql session/direct connectivity is suitable. With psql use -W for a hidden password prompt and -v ON_ERROR_STOP=1 -f for each migration; do not put passwords/credential URLs in terminal arguments.
5. As administrator, execute this reviewed setup after approval. Use the confirmed database name if different:

```sql
create role neurolearn_runtime login inherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls connection limit 5;
grant neurolearn_app to neurolearn_runtime;
grant connect on database postgres to neurolearn_runtime;
```

Set its password privately using a secure role-password workflow; in psql use `\password neurolearn_runtime` with hidden prompts. Never put a literal password in a saved SQL script or chat. The role cannot log in until its password is set. Grant no administrator/service membership, schema CREATE, ownership or BYPASSRLS. neurolearn_app remains NOLOGIN; the migration administrator owns tables/function.

6. Read back roles and RLS:

```sql
select rolname,rolsuper,rolcreatedb,rolcreaterole,rolreplication,rolbypassrls,rolinherit
from pg_roles where rolname in ('neurolearn_app','neurolearn_runtime');
select tablename,tableowner from pg_tables where schemaname='neurolearn';
select relname,relrowsecurity,relforcerowsecurity
from pg_class where relnamespace='neurolearn'::regnamespace and relkind='r';
```

All learner tables require enabled/forced RLS. request_buckets intentionally exposes no application table privileges: only bounded SECURITY DEFINER consume_budget. Runtime must inherit only neurolearn_app, not privileged roles; audit membership and absence of unrelated schema privileges. No serial sequences or extension grants are required. See [official custom-role guidance](https://supabase.com/docs/guides/database/postgres/roles).

## Secure connection configuration

Copy the exact shared transaction pooler host from Connect; do not infer it from region. Port is 6543; custom username is neurolearn_runtime.PROJECT_REF. Session mode uses 5432. Direct connections use neurolearn_runtime and normally require IPv6 on Free. No paid IPv4 add-on is necessary for shared pooling.

Edit only DATABASE_URL privately in ignored E:\neurolearn-ai\.env.local; preserve Tavily/LangSmith entries. This example contains placeholders only:

```text
postgresql://neurolearn_runtime.PROJECT_REF:URL_ENCODED_RUNTIME_PASSWORD@EXACT_POOLER_HOST:6543/postgres?sslmode=verify-full
```

Percent-encode password special characters privately. Never use the administrator URL or NEXT_PUBLIC secrets. DATABASE_URL is currently blank and was not modified. Hosted connections now require sslmode=verify-full in development and production; require/verify-ca/plain connections and globally disabled certificate validation are rejected. Certificate/hostname verification must succeed before claiming live security.

For certificate-chain failures, download the project's CA from Database Settings and provide sslrootcert with a URL-encoded absolute file path to an ignored local certificate, such as .integration-evidence/supabase-ca.crt. Never disable verification. See [official SSL guidance](https://supabase.com/docs/guides/platform/ssl-enforcement). An eventual approved live Vercel environment must deliberately bundle any required public CA and use a valid server path; Windows paths cannot work there. Actual TLS/CA and pooler-role compatibility remain unverified.

## Smoke, cleanup and isolation

After target/migration approval and private connection setup, run `npm run smoke:postgres -- --confirm-live`. This writes synthetic records, not migrations. Set LANGSMITH_TRACING=false in that process to avoid unrelated telemetry; local safe-preview must be false for this authorized test. No remote Preview change is needed.

The smoke checks restricted role, server grading, two guests' visibility, course/document isolation, cross-guest overwrites requiring SQLSTATE 42501, owned readback and cascades. It finally deletes both synthetic guests and verifies absence using non-creating guestExists checks. Reads through loadGuest/loadLibrary would recreate guests and are unsuitable for final cleanup checks. syntheticCleanupVerified is set only after successful readback; errors cannot count as successful cleanup. Evidence remains ignored under .integration-evidence/postgres.json.

Guest capability isolation is not account authentication; losing the cookie loses access. Anyone holding the private token can access that guest. Account linking, retention, backup recovery and hosted load remain outstanding. Local persistence is opt-in with PERSISTENCE_PROVIDER=postgres; production live usage also needs the existing organizer gate and database-backed quotas.

Restricted fixture Preview must retain browser persistence, memory quotas, no DATABASE_URL/provider keys and LANGSMITH_TRACING=false. Direct databasePool calls also fail closed in safe preview. No remote configuration/protection was changed.

## Actual status

Hosted creation, migrations, TLS/connection, isolation and cleanup are **BLOCKED**: no DATABASE_URL or approved target exists. Missing-configuration smoke made no external request. Compatibility is an assessment supported by documentation/code, not a passed hosted test. Embedded regression results are recorded in BUILD_STATUS.md.

Local prerequisite: psql was not found on PATH during this audit. The SQL editor can apply approved migrations; the hidden-prompt password workflow requires a free PostgreSQL client installation or an equivalent secure administrator tool. No client was installed automatically.
