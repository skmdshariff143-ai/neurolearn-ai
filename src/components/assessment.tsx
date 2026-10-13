"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { questions, subjects } from "@/lib/content";
import { grade, transition, type State } from "@/lib/domain";
import { browserRepository } from "@/lib/repository";
import { Button } from "./ui/button";
import { remoteRepository, cloudEnabled } from "@/lib/remote-repository";
export function Assessment() {
  const [topic, setTopic] = useState(subjects[0].name);
  const [post, setPost] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<ReturnType<typeof grade> | null>(null);
  const [state, setState] = useState<State>("INITIAL");
  const [error, setError] = useState("");
  useEffect(() => {
    queueMicrotask(() => {
      setTopic(localStorage.getItem("nl-topic") ?? subjects[0].name);
      setPost(
        new URLSearchParams(window.location.search).get("mode") === "practice",
      );
    });
  }, []);
  const qs = questions(topic, post);
  function submit() {
    try {
      const r = grade(qs, answers);
      let current: State = "INITIAL";
      if (post) {
        current = transition(current, "LESSON");
        current = transition(current, "PRACTICE");
        current = transition(current, "EVALUATION");
        current = transition(current, r.score === 100 ? "MASTERED" : "RETEACH");
      } else {
        current = transition(current, "DIAGNOSTIC");
        current = transition(current, "ANALYSIS");
      }
      const earlier = browserRepository
        .activities()
        .filter((a) => a.topic === topic && a.kind === "practice").length;
      const activityId = crypto.randomUUID();
      browserRepository.saveActivity({
        id: activityId,
        topic,
        kind: post ? "practice" : "diagnostic",
        score: r.score,
        weak: r.diagnoses.map((d) => d.concept),
        at: new Date().toISOString(),
        iterations: earlier + 1,
      });
      localStorage.setItem(
        "nl-workflow",
        JSON.stringify({
          topic,
          state: current,
          weak: r.diagnoses.map((d) => d.concept),
        }),
      );
      setResult(r);
      setState(current);
      setError("");
      if (cloudEnabled())
        void remoteRepository
          .saveAssessment({
            id: activityId,
            topic,
            kind: post ? "practice" : "diagnostic",
            answers,
          })
          .catch(() =>
            setError(
              "Saved only in this browser; hosted sync failed. Reconnect in Settings and repeat the assessment if you want a server record.",
            ),
          );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cannot save result");
    }
  }
  return (
    <>
      <div className="eyebrow">Assess · Diagnose · Adapt</div>
      <h1 className="page-title">
        {post
          ? "Put your understanding to the test."
          : "Find your starting point."}
      </h1>
      <p className="page-intro">
        Two curated concept checks. Pre- and post-assessments use different
        questions. Results reflect these questions only and do not establish
        overall mastery.
      </p>
      <div className="card stack">
        <div className="form-grid">
          <div>
            <label htmlFor="assessment-topic">Learning path</label>
            <select
              id="assessment-topic"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setAnswers([]);
                setResult(null);
                localStorage.setItem("nl-topic", e.target.value);
              }}
            >
              {!subjects.some((s) => s.name === topic) && (
                <option>{topic}</option>
              )}
              {subjects.map((s) => (
                <option key={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="assessment-mode">Assessment</label>
            <select
              id="assessment-mode"
              value={post ? "post" : "pre"}
              onChange={(e) => {
                setPost(e.target.value === "post");
                setAnswers([]);
                setResult(null);
              }}
            >
              <option value="pre">Diagnostic</option>
              <option value="post">Post-lesson practice</option>
            </select>
          </div>
        </div>
        {qs.length === 0 ? (
          <p>
            No curated assessment is available for this topic. Choose one of the
            three learning paths.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            {qs.map((q, i) => (
              <fieldset
                className="question"
                key={q.id}
                disabled={Boolean(result)}
              >
                <legend>
                  {i + 1}. {q.prompt}
                </legend>
                {q.options.map((o, n) => (
                  <label className="option" key={o}>
                    <input
                      type="radio"
                      name={q.id}
                      value={n}
                      required
                      checked={answers[i] === n}
                      onChange={() =>
                        setAnswers((prev) => {
                          const next = [...prev];
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
            {!result && <Button>Evaluate my answers</Button>}
          </form>
        )}
        {error && (
          <p role="alert" className="notice error">
            {error}
          </p>
        )}
      </div>
      {result && (
        <div className="card" style={{ marginTop: 20 }} role="status">
          <span className="pill">Workflow: {state}</span>
          <h2 style={{ marginTop: 20 }}>
            {result.correct} of {result.total} correct · {result.score}%
          </h2>
          {result.diagnoses.length === 0 ? (
            <p>
              You answered these concept checks correctly. Try applying the
              ideas in a new context.
            </p>
          ) : (
            <>
              <p>
                Your answers suggest areas to revisit. A wrong choice alone
                cannot prove a misconception.
              </p>
              {result.diagnoses.map((d, i) => (
                <div className="check" key={i}>
                  <strong>Possible gap: {d.concept}</strong>
                  {d.recommendation}
                  <p className="fine">
                    Evidence: {d.evidence} · Classification: {d.certainty}
                  </p>
                </div>
              ))}
            </>
          )}
          <div className="actions">
            <Button asChild>
              <Link
                href={`/classroom?topic=${encodeURIComponent(topic)}&reteach=${result.diagnoses.length > 0}`}
              >
                {result.diagnoses.length
                  ? "Revisit with a simpler explanation"
                  : "Continue to your lesson"}
              </Link>
            </Button>
            {post && result.diagnoses.length > 0 && (
              <Button
                className="secondary"
                onClick={() => {
                  setState(transition(transition(state, "LESSON"), "PRACTICE"));
                  setResult(null);
                  setAnswers([]);
                }}
              >
                Try practice again
              </Button>
            )}
            <Button asChild className="secondary">
              <Link href="/progress">View recorded progress</Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
