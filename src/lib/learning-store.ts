import { guestTransaction } from "./postgres";
import { courseSchema, type Course } from "./courses";
import { resourceSchema, type Resource } from "./resources";
import { questions } from "./content";
import { z } from "zod";
export const libraryWriteSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("course"), data: courseSchema }),
  z.object({ kind: z.literal("resource"), data: resourceSchema }),
]);
export async function loadLibrary(token: string) {
  return guestTransaction(token, async (client, owner) => ({
    courses: z
      .array(courseSchema)
      .parse(
        (
          await client.query(
            "select outline from neurolearn.courses where learner_id=$1 order by created_at limit 10",
            [owner],
          )
        ).rows.map((r) => r.outline),
      ),
    resources: z
      .array(resourceSchema)
      .parse(
        (
          await client.query(
            "select metadata,extracted_pages from neurolearn.resources where learner_id=$1 order by created_at limit 5",
            [owner],
          )
        ).rows.map((r) => ({ ...r.metadata, pages: r.extracted_pages })),
      ),
  }));
}
export async function saveCourse(token: string, input: Course) {
  const course = courseSchema.parse(input);
  if (course.provenance === "curated-demo")
    for (const lesson of course.modules.flatMap((m) => m.lessons))
      for (const [post, quiz] of [
        [false, lesson.diagnostic],
        [true, lesson.practice],
      ] as const)
        if (
          quiz &&
          JSON.stringify(quiz.questions) !==
            JSON.stringify(questions(lesson.topic, post))
        )
          throw new Error("Curated question bank mismatch");
  return guestTransaction(token, async (client, owner) => {
    await client.query(
      "select id from neurolearn.guests where id=$1 for update",
      [owner],
    );
    const count = await client.query(
      "select count(*)::int as n from neurolearn.courses where learner_id=$1 and id<>$2",
      [owner, course.id],
    );
    if (count.rows[0].n >= 10) throw new Error("Course limit reached");
    await client.query(
      "insert into neurolearn.courses(id,learner_id,outline) values($1,$2,$3::jsonb) on conflict(id) do update set outline=excluded.outline",
      [course.id, owner, JSON.stringify(course)],
    );
    await client.query(
      "delete from neurolearn.modules where course_id=$1 and learner_id=$2",
      [course.id, owner],
    );
    for (const [mi, module] of course.modules.entries()) {
      await client.query(
        "insert into neurolearn.modules(id,learner_id,course_id,position,title) values($1,$2,$3,$4,$5)",
        [module.id, owner, course.id, mi + 1, module.title],
      );
      for (const [li, lesson] of module.lessons.entries()) {
        await client.query(
          "insert into neurolearn.lessons(id,learner_id,module_id,position,data) values($1,$2,$3,$4,$5::jsonb)",
          [lesson.id, owner, module.id, li + 1, JSON.stringify(lesson)],
        );
        await client.query(
          "insert into neurolearn.learning_sessions(learner_id,lesson_id,state,retries) values($1,$2,$3,$4)",
          [owner, lesson.id, lesson.cycle.state, lesson.cycle.retries],
        );
        for (const kind of ["diagnostic", "practice"] as const) {
          const quiz = lesson[kind];
          if (!quiz) continue;
          const id = crypto.randomUUID();
          await client.query(
            "insert into neurolearn.assessments(id,learner_id,lesson_id,kind,questions,provenance) values($1,$2,$3,$4,$5::jsonb,$6)",
            [
              id,
              owner,
              lesson.id,
              kind,
              JSON.stringify(quiz.questions),
              course.provenance === "curated-demo"
                ? "curated"
                : "ai-generated-unreviewed",
            ],
          );
          for (const a of lesson.attempts.filter((a) => a.kind === kind))
            await client.query(
              "insert into neurolearn.attempts(id,learner_id,assessment_id,answers,score,created_at) values($1,$2,$3,$4::jsonb,$5,$6)",
              [a.id, owner, id, JSON.stringify(a.answers), a.score, a.at],
            );
        }
        const latest = lesson.attempts.at(-1);
        if (latest) {
          const quiz = lesson[latest.kind]!;
          for (const q of quiz.questions) {
            const needsReview = latest.weak.includes(q.concept);
            await client.query(
              "insert into neurolearn.concept_mastery(learner_id,concept_id,evidence_attempt_id,status) values($1,$2,$3,$4) on conflict(learner_id,concept_id) do update set evidence_attempt_id=excluded.evidence_attempt_id,status=excluded.status",
              [
                owner,
                q.concept,
                latest.id,
                needsReview ? "needs-review" : "passed-check",
              ],
            );
            if (needsReview)
              await client.query(
                "insert into neurolearn.revisions(learner_id,lesson_id,concept_id,due_at) values($1,$2,$3,$4)",
                [
                  owner,
                  lesson.id,
                  q.concept,
                  new Date(
                    new Date(latest.at).getTime() + 86400000,
                  ).toISOString(),
                ],
              );
          }
        }
      }
    }
  });
}
export async function saveResource(token: string, input: Resource) {
  const r = resourceSchema.parse(input);
  return guestTransaction(token, async (client, owner) => {
    await client.query(
      "select id from neurolearn.guests where id=$1 for update",
      [owner],
    );
    const count = await client.query(
      "select count(*)::int as n from neurolearn.resources where learner_id=$1 and id<>$2",
      [owner, r.id],
    );
    if (count.rows[0].n >= 5) throw new Error("Document limit reached");
    const { pages, ...metadata } = r;
    await client.query(
      "insert into neurolearn.resources(id,learner_id,title,provenance,extracted_pages,metadata) values($1,$2,$3,'learner-upload',$4::jsonb,$5::jsonb) on conflict(id) do update set extracted_pages=excluded.extracted_pages,metadata=excluded.metadata",
      [r.id, owner, r.title, JSON.stringify(pages), JSON.stringify(metadata)],
    );
  });
}
