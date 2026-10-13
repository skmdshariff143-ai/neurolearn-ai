"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { subjects, questions } from "@/lib/content";
import { browserRepository } from "@/lib/repository";
import {
  advance,
  courseRepository,
  outlineToCourse,
  recordCourseAttempt,
  type Course,
  type CourseLesson,
} from "@/lib/courses";
import { diagnosticSchema } from "@/lib/learning-schemas";
import { lessonSchema } from "@/lib/domain";
import { libraryRequest, librarySnapshot } from "@/lib/library-client";

async function api(path: string, body: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(35000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Learning request failed");
  return data;
}
export function CourseWorkspace() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState("");
  const [topic, setTopic] = useState("Electrical transformers");
  const [goal, setGoal] = useState(
    "Understand the core concepts and apply them",
  );
  const [days, setDays] = useState(3);
  const [demo, setDemo] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<number[]>([]);
  useEffect(() => {
    queueMicrotask(() => {
      const all = courseRepository.load();
      setCourses(all);
      setSelected(all.at(-1)?.id ?? "");
    });
  }, []);
  const course = courses.find((c) => c.id === selected);
  const lessons = course?.modules.flatMap((m) => m.lessons) ?? [];
  const lesson = lessons.find((l) => l.id === course?.activeLessonId);
  function save(c: Course) {
    courseRepository.save(c);
    setCourses(courseRepository.load());
    setSelected(c.id);
  }
  function update(l: CourseLesson) {
    if (!course) return;
    save({
      ...course,
      modules: course.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((old) => (old.id === l.id ? l : old)),
      })),
    });
    setAnswers([]);
  }
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to save. Existing progress is preserved.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function create() {
    const profile = browserRepository.profile();
    const plan = demo
      ? {
          title: `${topic} guided demonstration`,
          prerequisites: ["Basic numeracy"],
          objectives: [{ conceptId: "core", description: goal }],
          units: Array.from({ length: 3 }, (_, i) => ({
            day: i + 1,
            topic,
            activity:
              i === 0
                ? "Understand the concept"
                : i === 1
                  ? "Apply it in a worked example"
                  : "Retrieve and revise",
            revision: i === 2,
          })),
        }
      : (
          await api("/api/workflow", {
            task: "roadmap",
            topic,
            language: profile.language,
            days,
            goal,
            level: profile.level,
            minutes: profile.minutes,
          })
        ).result;
    save(
      outlineToCourse(plan, {
        goal,
        language: profile.language,
        level: profile.level,
        minutes: profile.minutes,
        provenance: demo ? "curated-demo" : "ai-generated",
      }),
    );
  }
  async function loadQuestions() {
    if (!course || !lesson) return;
    const post = lesson.cycle.state === "PRACTICE";
    const quiz =
      course.provenance === "curated-demo"
        ? {
            title: post ? "Application check" : "Starting check",
            objectives: [{ conceptId: "core", description: goal }],
            questions: questions(lesson.topic, post),
          }
        : (
            await api("/api/workflow", {
              task: "diagnostic",
              topic: lesson.topic,
              language: course.language,
              post,
            })
          ).result;
    update({
      ...lesson,
      [post ? "practice" : "diagnostic"]: diagnosticSchema.parse(quiz),
    });
  }
  async function teach(simple = false) {
    if (!course || !lesson) return;
    const weak = lesson.attempts.at(-1)?.weak ?? [];
    const response = await api("/api/tutor", {
      topic: lesson.topic,
      language: course.language,
      level: course.level,
      strategy: simple || lesson.cycle.retries ? "simple" : "steps",
      message: `Goal: ${course.goal}. Activity: ${lesson.activity}. Possible gaps: ${weak.join(", ")}`,
    });
    if (course.provenance === "ai-generated" && response.demo)
      throw new Error(
        "Live course requires live inference. Fixture response rejected.",
      );
    update({
      ...lesson,
      lesson: lessonSchema.parse(response.lesson),
      lessonMode: response.demo ? "fixture" : "live",
      cycle:
        lesson.cycle.state === "TEACH"
          ? advance(lesson.cycle, "PRACTICE")
          : lesson.cycle,
    });
  }
  const quiz =
    lesson?.cycle.state === "ASSESS"
      ? lesson.diagnostic
      : lesson?.cycle.state === "PRACTICE"
        ? lesson.practice
        : null;
  return (
    <section
      className="card stack"
      style={{ marginTop: 24 }}
      aria-labelledby="courses-title"
    >
      <h2 id="courses-title">My learning courses</h2>
      <div className="actions">
        <Button
          className="secondary"
          disabled={busy || !course}
          onClick={() =>
            void run(async () => {
              await libraryRequest("POST", { kind: "course", data: course });
            })
          }
        >
          Save selected course to hosted storage
        </Button>
        <Button
          className="secondary"
          disabled={busy}
          onClick={() =>
            void run(async () => {
              const snapshot = await librarySnapshot();
              for (const c of snapshot.courses) courseRepository.save(c);
              setCourses(courseRepository.load());
              setSelected(snapshot.courses.at(-1)?.id ?? selected);
            })
          }
        >
          Load hosted courses
        </Button>
      </div>
      <p className="fine">
        Hosted actions require configured PostgreSQL and organizer access in
        Settings. Loading a hosted course replaces the browser copy with the
        same identifier. Generated scores remain unreviewed.
      </p>
      <p>
        Outlines first; lessons and two-question checks load on demand. Courses
        are saved in this browser. Completion means passing these checks, not
        subject mastery. Generated answer keys need educator review.
      </p>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          void run(create);
        }}
      >
        <label htmlFor="course-mode">Course source</label>
        <select
          id="course-mode"
          value={demo ? "demo" : "live"}
          onChange={(e) => {
            setDemo(e.target.value === "demo");
            setTopic("Electrical transformers");
          }}
        >
          <option value="demo">Curated demonstration (no AI inference)</option>
          <option value="live">
            Live AI outline (configured provider required)
          </option>
        </select>
        <label htmlFor="course-topic">Subject</label>
        {demo ? (
          <select
            id="course-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id}>{s.name}</option>
            ))}
          </select>
        ) : (
          <input
            id="course-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            minLength={2}
            maxLength={200}
          />
        )}
        <label htmlFor="course-goal">Learning goal</label>
        <input
          id="course-goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          required
          minLength={2}
          maxLength={300}
        />
        <label htmlFor="course-days">Study days (live outline)</label>
        <input
          id="course-days"
          type="number"
          min={3}
          max={30}
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          required
        />
        <p className="fine">
          Difficulty, language and daily study time use your{" "}
          <Link href="/settings">Settings preferences</Link>. Demo has three
          revision modules covering the selected topic.
        </p>
        <Button disabled={busy}>Create learning course</Button>
      </form>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      {busy && (
        <p role="status">
          Loading learning material… Previous work remains saved.
        </p>
      )}
      {courses.length > 0 && (
        <>
          <label htmlFor="saved-course">Resume a course</label>
          <select
            id="saved-course"
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              setAnswers([]);
            }}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </>
      )}
      {course && lesson && (
        <>
          <h3>{course.title}</h3>
          <p>
            {course.provenance === "curated-demo"
              ? "Curated demonstration — not live AI"
              : "AI-generated outline"}{" "}
            · {course.language} · {course.level} · {course.minutes} minutes/day
          </p>
          <p>
            {lessons.filter((l) => l.cycle.state === "COMPLETE").length}/
            {lessons.length} lesson checks completed · Prerequisites:{" "}
            {course.prerequisites.join(", ")}
          </p>
          <ol>
            {course.modules.map((m, i) => (
              <li key={m.id}>
                <Button
                  className="secondary"
                  disabled={
                    busy ||
                    lessons
                      .slice(0, i)
                      .some(
                        (l) => !["COMPLETE", "REVIEW"].includes(l.cycle.state),
                      )
                  }
                  onClick={() => {
                    try {
                      save({ ...course, activeLessonId: m.lessons[0].id });
                      setAnswers([]);
                      setError("");
                    } catch (e) {
                      setError(String(e));
                    }
                  }}
                >
                  {m.title}: {m.lessons[0].activity} ({m.lessons[0].cycle.state}
                  )
                </Button>
              </li>
            ))}
          </ol>
          <p role="status">
            Learning stage: {lesson.cycle.state} · Reteaching rounds:{" "}
            {lesson.cycle.retries}/2
          </p>
          {["ASSESS", "PRACTICE"].includes(lesson.cycle.state) && !quiz && (
            <Button disabled={busy} onClick={() => void run(loadQuestions)}>
              Load {lesson.cycle.state === "ASSESS" ? "diagnostic" : "practice"}{" "}
              questions
            </Button>
          )}
          {quiz && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  const next = recordCourseAttempt(
                    lesson,
                    lesson.cycle.state === "ASSESS" ? "diagnostic" : "practice",
                    answers,
                  );
                  update(next);
                });
              }}
            >
              {quiz.questions.map((q, i) => (
                <fieldset className="question" key={q.id}>
                  <legend>{q.prompt}</legend>
                  {q.options.map((o, n) => (
                    <label className="option" key={n}>
                      <input
                        type="radio"
                        required
                        name={`course-${q.id}`}
                        checked={answers[i] === n}
                        onChange={() =>
                          setAnswers((old) => {
                            const next = [...old];
                            next[i] = n;
                            return next;
                          })
                        }
                      />
                      {o}
                    </label>
                  ))}
                </fieldset>
              ))}
              <Button disabled={busy}>Record course assessment</Button>
            </form>
          )}
          {lesson.cycle.state === "TEACH" && (
            <Button disabled={busy} onClick={() => void run(() => teach())}>
              Open personalized lesson
            </Button>
          )}
          {lesson.lesson && (
            <article
              lang={
                course.language === "Telugu"
                  ? "te"
                  : course.language === "Hindi"
                    ? "hi"
                    : "en"
              }
            >
              <h3>{lesson.lesson.title}</h3>
              <p>
                {lesson.lessonMode === "fixture"
                  ? "Curated demonstration · not live inference"
                  : "Live provider lesson"}
              </p>
              <p style={{ whiteSpace: "pre-wrap" }}>
                {lesson.lesson.explanation}
              </p>
              <p>{lesson.lesson.check}</p>
              <Button
                className="secondary"
                disabled={busy}
                onClick={() => void run(() => teach(true))}
              >
                Explain course lesson more simply
              </Button>
            </article>
          )}
          {lesson.attempts.map((a) => (
            <p key={a.id}>
              {a.kind}: {a.score}% · Possible revision concepts:{" "}
              {a.weak.join(", ") || "None on these checks"}
            </p>
          ))}
          {lesson.cycle.state === "REVIEW" && (
            <p className="notice">
              Pause repeated testing. Review prerequisites with a teacher or
              trusted resource before continuing. Your attempts remain saved.
            </p>
          )}
          <Link href={`/classroom?topic=${encodeURIComponent(lesson.topic)}`}>
            Explore this topic in the full classroom
          </Link>
        </>
      )}
    </section>
  );
}
