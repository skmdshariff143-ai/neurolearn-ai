-- Phase 10 standalone PostgreSQL migration. Apply once using an administrator.
-- The old authenticated Supabase proposal is retained under db/proposals, not applied.
begin;
create schema neurolearn;
revoke all on schema neurolearn from public;
create role neurolearn_app nologin nosuperuser nobypassrls;
grant usage on schema neurolearn to neurolearn_app;
create table neurolearn.guests (
 id uuid primary key default gen_random_uuid(),
 token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
 profile jsonb, created_at timestamptz not null default now()
);
create table neurolearn.activities (
 id uuid primary key, learner_id uuid not null references neurolearn.guests(id) on delete cascade,
 topic text not null, kind text not null check(kind in ('diagnostic','practice')),
 score integer not null check(score between 0 and 100), weak jsonb not null,
 iterations integer not null check(iterations>0), at timestamptz not null default now(),
 provenance text not null default 'server-graded-curated' check(provenance='server-graded-curated')
);
create index activities_owner_time on neurolearn.activities(learner_id,at desc);
alter table neurolearn.guests enable row level security;
alter table neurolearn.guests force row level security;
alter table neurolearn.activities enable row level security;
alter table neurolearn.activities force row level security;
create policy guest_owner on neurolearn.guests for all to neurolearn_app
 using(token_hash=current_setting('neurolearn.token_hash',true))
 with check(token_hash=current_setting('neurolearn.token_hash',true));
create policy activity_owner on neurolearn.activities for all to neurolearn_app
 using(exists(select 1 from neurolearn.guests g where g.id=learner_id))
 with check(exists(select 1 from neurolearn.guests g where g.id=learner_id));
grant select,insert,update,delete on neurolearn.guests to neurolearn_app;
grant select,insert,delete on neurolearn.activities to neurolearn_app;
create table neurolearn.request_buckets(key text not null,bucket_window bigint not null, count integer not null,primary key(key,bucket_window));
revoke all on neurolearn.request_buckets from public,neurolearn_app;
-- Only this bounded operation is exposed; bucket contents cannot be read by app role.
create function neurolearn.consume_budget(bucket text,cap integer) returns boolean
language plpgsql security definer set search_path=pg_catalog,neurolearn as $$
declare current_window bigint:=floor(extract(epoch from clock_timestamp())/60); hits integer;
begin
 if cap<1 or cap>120 or length(bucket)>100 then raise exception 'invalid budget'; end if;
 delete from neurolearn.request_buckets where bucket_window<current_window-2;
 insert into neurolearn.request_buckets(key,bucket_window,count) values(bucket,current_window,1)
 on conflict(key,bucket_window) do update set count=neurolearn.request_buckets.count+1 returning count into hits;
 return hits<=cap;
end $$;
revoke all on function neurolearn.consume_budget(text,integer) from public;
grant execute on function neurolearn.consume_budget(text,integer) to neurolearn_app;
commit;
