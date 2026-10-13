-- Supabase-compatible schema proposal. Not applied or verified on a hosted database.
create table public.learner_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 language text not null check (language in ('English','Telugu','Hindi')),
 level text not null, preferences jsonb not null default '{}', created_at timestamptz not null default now()
);
create table public.learning_sessions (
 id uuid primary key default gen_random_uuid(), learner_id uuid not null references public.learner_profiles(id) on delete cascade,
 topic text not null, workflow_state text not null default 'INITIAL', created_at timestamptz not null default now()
);
create table public.learning_content (
 id uuid primary key default gen_random_uuid(), session_id uuid not null references public.learning_sessions(id) on delete cascade,
 provenance text not null check (provenance in ('ai-generated','curated','fixture','retrieved')),
 provider text, content jsonb not null, created_at timestamptz not null default now()
);
create table public.assessments (
 id uuid primary key default gen_random_uuid(), session_id uuid not null references public.learning_sessions(id) on delete cascade,
 kind text not null check (kind in ('diagnostic','practice')), questions jsonb not null, answers jsonb not null,
 score numeric not null check (score between 0 and 100), diagnosis jsonb not null default '[]', created_at timestamptz not null default now()
);
create table public.mastery_records (
 learner_id uuid not null references public.learner_profiles(id) on delete cascade, concept_id text not null,
 evidence_assessment_id uuid not null references public.assessments(id) on delete cascade,
 indicator numeric not null check (indicator between 0 and 100), updated_at timestamptz not null default now(), primary key (learner_id,concept_id)
);
alter table public.learner_profiles enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.learning_content enable row level security;
alter table public.assessments enable row level security;
alter table public.mastery_records enable row level security;
create policy own_profile on public.learner_profiles for all using (id=auth.uid()) with check (id=auth.uid());
create policy own_session on public.learning_sessions for all using (learner_id=auth.uid()) with check (learner_id=auth.uid());
create policy own_content on public.learning_content for all using (exists(select 1 from public.learning_sessions s where s.id=session_id and s.learner_id=auth.uid())) with check (exists(select 1 from public.learning_sessions s where s.id=session_id and s.learner_id=auth.uid()));
create policy own_assessment on public.assessments for all using (exists(select 1 from public.learning_sessions s where s.id=session_id and s.learner_id=auth.uid())) with check (exists(select 1 from public.learning_sessions s where s.id=session_id and s.learner_id=auth.uid()));
create policy own_mastery on public.mastery_records for all using (learner_id=auth.uid()) with check (learner_id=auth.uid() and exists(select 1 from public.assessments a join public.learning_sessions s on s.id=a.session_id where a.id=evidence_assessment_id and s.learner_id=auth.uid()));
