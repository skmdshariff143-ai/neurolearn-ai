"use client";
import { useState } from "react";
import { safePreview } from "@/lib/preview";
import {
  diagnosticSchema,
  roadmapSchema,
  writtenEvaluationSchema,
  type WorkflowRequest,
} from "@/lib/learning-schemas";
import { grade } from "@/lib/domain";
import { Button } from "./ui/button";
export function StructuredTools({ task }: { task: WorkflowRequest["task"] }) {
  const [topic, setTopic] = useState("Electrical transformers");
  const [answer, setAnswer] = useState("");
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState("");
  async function run() {
    setBusy(true);
    setError("");
    setResult(null);
    setScore("");
    try {
      const input: WorkflowRequest =
        task === "evaluate"
          ? {
              task,
              topic,
              language: "English",
              question:
                "Explain why a conventional transformer requires changing magnetic flux rather than steady DC.",
              answer,
              rubric: [
                {
                  conceptId: "changing-flux",
                  criterion:
                    "Recognizes that induced voltage requires changing magnetic flux.",
                  points: 2,
                },
                {
                  conceptId: "steady-dc",
                  criterion:
                    "Explains that settled DC does not continuously change the core flux, while AC does.",
                  points: 2,
                },
              ],
            }
          : task === "roadmap"
            ? { task, topic, language: "English", days }
            : { task, topic, language: "English", post: false };
      const response = await fetch("/api/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const schema =
        task === "diagnostic"
          ? diagnosticSchema
          : task === "roadmap"
            ? roadmapSchema
            : writtenEvaluationSchema;
      setResult(schema.parse(data.result));
      setAnswers([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Task unavailable");
    } finally {
      setBusy(false);
    }
  }
  const diagnostic =
    task === "diagnostic" && result ? diagnosticSchema.parse(result) : null;
  const roadmap =
    task === "roadmap" && result ? roadmapSchema.parse(result) : null;
  const evaluation =
    task === "evaluate" && result
      ? writtenEvaluationSchema.parse(result)
      : null;
  if (safePreview)
    return (
      <section className="card" style={{ marginTop: 24 }}>
        <h2>Live {task} unavailable</h2>
        <p>
          This fixture preview does not generate AI assessments, evaluations or
          course outlines. Curated demonstrations remain available.
        </p>
      </section>
    );
  return (
    <section className="card stack" style={{ marginTop: 24 }}>
      <h2>
        {task === "evaluate"
          ? "Review a written explanation"
          : task === "roadmap"
            ? "Generate a live AI course plan"
            : "Generate a live diagnostic"}
      </h2>
      <p className="fine">
        Live provider required. Responses are model-generated and need review.
        No fixture evaluations are substituted.
      </p>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          void run();
        }}
      >
        {task !== "evaluate" && (
          <div>
            <label htmlFor={`structured-${task}`}>Topic</label>
            <input
              id={`structured-${task}`}
              value={topic}
              minLength={2}
              maxLength={200}
              required
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
        )}
        {task === "roadmap" && (
          <div>
            <label htmlFor="live-days">Number of study days</label>
            <input
              id="live-days"
              type="number"
              min={3}
              max={30}
              required
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </div>
        )}
        {task === "evaluate" && (
          <>
            <p>
              Why does a conventional transformer require changing magnetic flux
              rather than steady DC?
            </p>
            <div className="notice">
              Rubric: changing flux is needed for induced voltage (2 points);
              settled DC versus AC explanation (2 points). AI scores are
              suggestions, not authoritative grades.
            </div>
            <div>
              <label htmlFor="written-answer">Your explanation</label>
              <textarea
                id="written-answer"
                required
                maxLength={2000}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>
          </>
        )}
        <Button disabled={busy}>
          {busy ? "Generating…" : "Request live model response"}
        </Button>
      </form>
      {error && (
        <div role="alert" className="notice error">
          {error}
        </div>
      )}
      {diagnostic && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            try {
              const r = grade(diagnostic.questions, answers);
              setScore(
                `${r.correct}/${r.total} correct. Review: ${r.diagnoses.map((d) => d.recommendation).join(" ")}`,
              );
            } catch (e) {
              setError(String(e));
            }
          }}
        >
          <h3>{diagnostic.title}</h3>
          {diagnostic.questions.map((q, i) => (
            <fieldset className="question" key={q.id}>
              <legend>{q.prompt}</legend>
              {q.options.map((o, n) => (
                <label className="option" key={n}>
                  <input
                    type="radio"
                    name={`generated-${q.id}`}
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
          <Button>Check generated questions</Button>
          <p role="status">{score}</p>
          <p className="fine">
            Generated answer keys have not been independently verified; this
            preview result is not stored as curated progress.
          </p>
        </form>
      )}
      {roadmap && (
        <div>
          <h3>{roadmap.title}</h3>
          <p>Prerequisites: {roadmap.prerequisites.join(", ")}</p>
          {roadmap.units.map((u) => (
            <div key={u.day} className="check">
              <strong>
                Day {u.day}: {u.topic}
              </strong>
              <textarea
                aria-label={`Edit day ${u.day} activity`}
                value={u.activity}
                onChange={(e) =>
                  setResult({
                    ...roadmap,
                    units: roadmap.units.map((unit) =>
                      unit.day === u.day
                        ? { ...unit, activity: e.target.value }
                        : unit,
                    ),
                  })
                }
              />
              {u.revision && <small>Revision checkpoint</small>}
            </div>
          ))}
          <p className="fine">
            Edits stay on this page. Export a plan before navigating away.
          </p>
          <Button
            className="secondary"
            onClick={() => {
              const url = URL.createObjectURL(
                new Blob([JSON.stringify(roadmap, null, 2)], {
                  type: "application/json",
                }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = "generated-roadmap.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export generated plan
          </Button>
        </div>
      )}
      {evaluation && (
        <div>
          <p>{evaluation.feedback}</p>
          {evaluation.criteria.map((c) => (
            <div className="check" key={c.conceptId}>
              <strong>
                {c.conceptId}: {c.earned}/{c.possible}
              </strong>
              {c.reason}
            </div>
          ))}
          {evaluation.misconceptions.map((m, i) => (
            <p key={i}>
              Possible {m.classification} ({m.confidence} confidence):{" "}
              {m.evidence}. {m.recommendation}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
