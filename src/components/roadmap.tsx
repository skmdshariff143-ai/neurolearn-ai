"use client";
import { guestStorage } from "@/lib/preview";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "./ui/button";
const planSchema = z.object({
  topic: z.string(),
  days: z.number().int().min(3).max(30),
  done: z.array(z.number()),
});
const topics = ["Python", "Electrical transformers", "Quadratic equations"];
const units: Record<string, string[]> = {
  Python: [
    "Variables and values",
    "Comparisons and boolean logic",
    "If / elif / else",
    "For loops and range",
    "While loops and stopping conditions",
    "Functions and small projects",
  ],
  "Electrical transformers": [
    "Voltage, current, and AC",
    "Magnetic fields and flux",
    "Electromagnetic induction",
    "Turns ratio",
    "Ideal power and real losses",
    "Applications and safety",
  ],
  "Quadratic equations": [
    "Linear prerequisites",
    "Quadratic forms and graphs",
    "Factoring",
    "Completing the square",
    "Quadratic formula",
    "Discriminant and applications",
  ],
};
export function Roadmap() {
  const [topic, setTopic] = useState("Python");
  const [days, setDays] = useState(30);
  const [plan, setPlan] = useState<z.infer<typeof planSchema> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const p = planSchema.parse(
          JSON.parse(guestStorage.getItem("nl-roadmap") ?? "null"),
        );
        setPlan(p);
        setTopic(p.topic);
        setDays(p.days);
      } catch {
        /* No existing plan. */
      }
    });
  }, []);
  function save(p: z.infer<typeof planSchema>) {
    try {
      guestStorage.setItem("nl-roadmap", JSON.stringify(p));
      setPlan(p);
    } catch {
      setError("Plan could not be saved to browser storage.");
    }
  }
  return (
    <>
      <div className="eyebrow">A direction, not a deadline</div>
      <h1 className="page-title">Turn a goal into small steps.</h1>
      <p className="page-intro">
        Generate an editable study schedule from curated units. This is a
        deterministic planning tool, not an AI-generated course or a guarantee
        of mastery.
      </p>
      <form
        className="card stack"
        onSubmit={(e) => {
          e.preventDefault();
          save({ topic, days, done: [] });
        }}
      >
        <div className="form-grid">
          <div>
            <label htmlFor="plan-topic">Subject</label>
            <select
              id="plan-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              {topics.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="plan-days">Study days</label>
            <input
              id="plan-days"
              type="number"
              min={3}
              max={30}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              required
            />
          </div>
        </div>
        <Button>Generate my schedule</Button>
        {error && <p role="alert">{error}</p>}
      </form>
      {plan && (
        <>
          <div className="section-head">
            <div>
              <h2>
                {plan.topic} · {plan.days} study days
              </h2>
              <p>
                {plan.done.length} activities checked · Edit the subject or
                duration above to rebuild.
              </p>
            </div>
          </div>
          <div className="notice">
            Prerequisites:{" "}
            {plan.topic === "Python"
              ? "Basic computer use; no prior programming required."
              : plan.topic === "Quadratic equations"
                ? "Arithmetic, negative numbers, and solving linear equations."
                : "Basic voltage and current concepts."}{" "}
            Take the diagnostic before beginning. Reserve extra review days if
            needed.
          </div>
          <div className="stack" style={{ marginTop: 20 }}>
            {Array.from({ length: plan.days }, (_, i) => {
              const unit =
                units[plan.topic][Math.min(5, Math.floor((i * 6) / plan.days))];
              return (
                <div className="card roadmap-day" key={i}>
                  <span className="pill">Day {i + 1}</span>
                  <div>
                    <label className="check-label">
                      <input
                        type="checkbox"
                        checked={plan.done.includes(i)}
                        onChange={() =>
                          save({
                            ...plan,
                            done: plan.done.includes(i)
                              ? plan.done.filter((n) => n !== i)
                              : [...plan.done, i],
                          })
                        }
                      />
                      {unit}
                    </label>
                    <p className="fine" style={{ margin: 0 }}>
                      {(i + 1) % 5 === 0
                        ? "Revision checkpoint: retrieve the idea from memory, then check your explanation."
                        : "Explain the idea, work one example, and write a question you still have."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
