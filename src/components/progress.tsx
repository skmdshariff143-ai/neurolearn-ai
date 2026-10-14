"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { browserRepository } from "@/lib/repository";
import type { Activity } from "@/lib/domain";
import { remoteRepository, cloudEnabled } from "@/lib/remote-repository";
import { courseRepository, type Course } from "@/lib/courses";
import { revisionQueue, recallPrompt } from "@/lib/revision";
import { topicKey } from "@/lib/content";
export function Progress() {
  const [records, setRecords] = useState<Activity[]>([]);
  const [syncError, setSyncError] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => {
    queueMicrotask(() => {
      setRecords(browserRepository.activities());
      setCourses(courseRepository.load());
      if (cloudEnabled())
        void remoteRepository
          .load()
          .then(() => setRecords(browserRepository.activities()))
          .catch(() =>
            setSyncError(
              "Hosted progress could not be loaded. Showing saved browser records.",
            ),
          );
    });
  }, []);
  const topics = [...new Set(records.map((r) => r.topic))];
  const reviews = revisionQueue(records, courses);
  const chart = topics.map((topic) => ({
    topic,
    diagnostic: records.find(
      (r) => r.topic === topic && r.kind === "diagnostic",
    )?.score,
    practice: records.findLast(
      (r) => r.topic === topic && r.kind === "practice",
    )?.score,
  }));
  return (
    <>
      <div className="eyebrow">Reflect · Review · Grow</div>
      <h1 className="page-title">Your progress, honestly recorded.</h1>
      {courses.length > 0 && (
        <section className="card" aria-label="Recorded course progress">
          <h2>Your course checks</h2>
          {courses.map((c) => {
            const lessons = c.modules.flatMap((m) => m.lessons);
            return (
              <div key={c.id}>
                <h3>{c.title}</h3>
                <p>
                  {lessons.filter((l) => l.cycle.state === "COMPLETE").length}/
                  {lessons.length} completed lesson checks ·{" "}
                  {lessons.reduce((n, l) => n + l.attempts.length, 0)} recorded
                  attempts ·{" "}
                  {c.provenance === "curated-demo"
                    ? "Curated demonstration"
                    : "Generated answer keys require review"}
                </p>
                <Link href="/roadmap">
                  Resume course or review targeted gaps
                </Link>
              </div>
            );
          })}
        </section>
      )}
      {syncError && (
        <p role="status" className="notice">
          {syncError}
        </p>
      )}
      <p className="page-intro">
        Scores come from completed concept checks in this browser. They are
        indicators for review, not proof of subject mastery.
      </p>
      {reviews.length > 0 && (
        <section className="card stack" aria-labelledby="revision-title">
          <h2 id="revision-title">Recall before you reread</h2>
          <p>
            Suggested reviews use recorded concept checks. Checks less than 24
            hours apart do not extend the interval. These are practice
            suggestions, not proof of mastery.
          </p>
          {reviews.slice(0, 12).map((review) => (
            <div key={JSON.stringify([review.topic, review.concept])}>
              <h3>
                {review.topic} · {review.concept}
              </h3>
              <p>
                {review.due ? "Review due" : "Next suggested review"}:{" "}
                <time dateTime={review.dueAt}>
                  {new Date(review.dueAt).toLocaleDateString()}
                </time>
              </p>
              <p>{recallPrompt(review.topic, review.concept)}</p>
              <details>
                <summary>Show a self-check guide</summary>
                <p>
                  Compare your reasoning with the lesson: check the core rule,
                  each step, units or assumptions, and where your example stops
                  applying. If unsure, ask for a worked example. This self-check
                  does not record a score.
                </p>
                <Link
                  className="button secondary"
                  href={`/classroom?topic=${encodeURIComponent(review.topic)}&reteach=true`}
                >
                  Revisit this concept
                </Link>
              </details>
              <Link
                className="button secondary"
                href={
                  topicKey(review.topic)
                    ? `/assessment?topic=${encodeURIComponent(review.topic)}&mode=practice`
                    : "/roadmap"
                }
              >
                {topicKey(review.topic)
                  ? "Take a graded check"
                  : "Resume course checks"}
              </Link>
            </div>
          ))}
        </section>
      )}
      {records.length === 0 ? (
        <div className="card">
          <h2>Your first chapter is waiting.</h2>
          <p>
            Complete a diagnostic to see your starting point and review
            recommendations here.
          </p>
          <Link className="button" href="/assessment">
            Take a diagnostic
          </Link>
        </div>
      ) : (
        <>
          <div className="grid3">
            <div className="card">
              <span className="metric">{topics.length}</span>Topics assessed
            </div>
            <div className="card">
              <span className="metric">{records.length}</span>Completed
              assessments
            </div>
            <div className="card">
              <span className="metric">
                {records.filter((r) => r.kind === "practice").length}
              </span>
              Practice attempts
            </div>
          </div>
          <div className="card" style={{ marginTop: 20 }}>
            <h2>Starting point & latest practice</h2>
            <p className="fine">
              The two question sets are different but cover the same concepts.
            </p>
            <div
              role="group"
              style={{ height: 300 }}
              aria-label="Assessment scores chart"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar name="Diagnostic" dataKey="diagnostic" fill="#687e42" />
                  <Bar
                    name="Latest practice"
                    dataKey="practice"
                    fill="#b37b4c"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table style={{ width: "100%", textAlign: "left" }}>
              <caption className="fine">Accessible score table</caption>
              <thead>
                <tr>
                  <th scope="col">Topic</th>
                  <th scope="col">Diagnostic</th>
                  <th scope="col">Latest practice</th>
                </tr>
              </thead>
              <tbody>
                {chart.map((r) => (
                  <tr key={r.topic}>
                    <th scope="row">{r.topic}</th>
                    <td>{r.diagnostic ?? "Not taken"}</td>
                    <td>{r.practice ?? "Not taken"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="section-head">
            <h2>What to revisit next</h2>
          </div>
          <div className="stack">
            {topics.map((topic) => {
              const latest = records.findLast((r) => r.topic === topic)!;
              return (
                <div className="card" key={topic}>
                  <h3>{topic}</h3>
                  <p>
                    {latest.weak.length
                      ? `Review: ${latest.weak.join(", ")}. Try a worked example, then revisit practice.`
                      : "These checks are correct. Try the lab and explain the concept in your own words."}
                  </p>
                  <Link
                    className="card-link"
                    href={`/classroom?topic=${encodeURIComponent(topic)}&reteach=true`}
                  >
                    Return to the concept →
                  </Link>
                </div>
              );
            })}
          </div>
          <details className="card" style={{ marginTop: 20 }}>
            <summary>Assessment history</summary>
            {records.map((r) => (
              <p key={r.id}>
                {r.topic} · {r.kind} · {r.score}% ·{" "}
                {new Date(r.at).toLocaleString()}
              </p>
            ))}
          </details>
        </>
      )}
    </>
  );
}
