-- Apply after 002 as the migration administrator. No automatic cloud operation.
begin;
create table neurolearn.courses (
 id uuid primary key, learner_id uuid not null references neurolearn.guests(id) on delete cascade,
 outline jsonb not null, created_at timestamptz not null default now(), unique(id,learner_id),
 check(octet_length(outline::text)<=500000)
);
create table neurolearn.modules (
 id uuid primary key, learner_id uuid not null references neurolearn.guests(id) on delete cascade,
 course_id uuid not null, position integer not null check(position between 1 and 30), title text not null,
 unique(id,learner_id), unique(course_id,position),
 foreign key(course_id,learner_id) references neurolearn.courses(id,learner_id) on delete cascade
);
create table neurolearn.lessons (
 id uuid primary key, learner_id uuid not null references neurolearn.guests(id) on delete cascade,
 module_id uuid not null, position integer not null check(position between 1 and 5), data jsonb not null,
 unique(id,learner_id), unique(module_id,position),
 foreign key(module_id,learner_id) references neurolearn.modules(id,learner_id) on delete cascade,
 check(octet_length(data::text)<=100000)
);
create table neurolearn.learning_sessions (
 id uuid primary key default gen_random_uuid(), learner_id uuid not null references neurolearn.guests(id) on delete cascade,
 lesson_id uuid not null, state text not null check(state in ('ASSESS','DIAGNOSE','PLAN','TEACH','PRACTICE','EVALUATE','ADAPT','COMPLETE','REVIEW')),
 retries integer not null check(retries between 0 and 2), updated_at timestamptz not null default now(),
 foreign key(lesson_id,learner_id) references neurolearn.lessons(id,learner_id) on delete cascade
);
create table neurolearn.assessments (
 id uuid primary key default gen_random_uuid(), learner_id uuid not null references neurolearn.guests(id) on delete cascade,
 lesson_id uuid not null, kind text not null check(kind in ('diagnostic','practice')), questions jsonb not null,
 provenance text not null check(provenance in ('curated','ai-generated-unreviewed')), unique(id,learner_id),
 foreign key(lesson_id,learner_id) references neurolearn.lessons(id,learner_id) on delete cascade
);
create table neurolearn.attempts (
 id uuid primary key, learner_id uuid not null references neurolearn.guests(id) on delete cascade,
 assessment_id uuid not null, answers jsonb not null, score integer not null check(score between 0 and 100),
 created_at timestamptz not null default now(), unique(id,learner_id),
 foreign key(assessment_id,learner_id) references neurolearn.assessments(id,learner_id) on delete cascade
);
create table neurolearn.concept_mastery (
 learner_id uuid not null references neurolearn.guests(id) on delete cascade, concept_id text not null,
 evidence_attempt_id uuid not null,
 status text not null check(status in ('needs-review','passed-check')), primary key(learner_id,concept_id),
 foreign key(evidence_attempt_id,learner_id) references neurolearn.attempts(id,learner_id) on delete cascade
);
create table neurolearn.resources (
 id uuid primary key, learner_id uuid not null references neurolearn.guests(id) on delete cascade,
 title text not null, provenance text not null check(provenance='learner-upload'),
 extracted_pages jsonb not null, metadata jsonb not null, created_at timestamptz not null default now(),
 check(octet_length(extracted_pages::text)<=500000)
);
create table neurolearn.revisions (
 id uuid primary key default gen_random_uuid(), learner_id uuid not null references neurolearn.guests(id) on delete cascade,
 lesson_id uuid not null, concept_id text not null, due_at timestamptz not null,
 foreign key(lesson_id,learner_id) references neurolearn.lessons(id,learner_id) on delete cascade
);
do $$ declare t text; begin
 foreach t in array array['courses','modules','lessons','learning_sessions','assessments','attempts','concept_mastery','resources','revisions'] loop
  execute format('alter table neurolearn.%I enable row level security',t);
  execute format('alter table neurolearn.%I force row level security',t);
  execute format('create policy owned_record on neurolearn.%I for all to neurolearn_app using(exists(select 1 from neurolearn.guests g where g.id=learner_id)) with check(exists(select 1 from neurolearn.guests g where g.id=learner_id))',t);
  execute format('grant select,insert,update,delete on neurolearn.%I to neurolearn_app',t);
  execute format('create index on neurolearn.%I(learner_id)',t);
 end loop;
end $$;
commit;
