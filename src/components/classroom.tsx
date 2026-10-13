"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BrainCircuit } from "lucide-react";
import { z } from "zod";
import {
  lessonSchema,
  citationSchema,
  type Lesson,
  type Profile,
  type TutorRequest,
} from "@/lib/domain";
import { browserRepository, defaultProfile } from "@/lib/repository";
import { subjects } from "@/lib/content";
import { Button } from "./ui/button";
import { ConceptDiagram } from "./concept-diagram";
type Entry = {
  lesson: Lesson;
  sources: z.infer<typeof citationSchema>[];
  provider: string;
  demo: boolean;
  latencyMs: number;
  topic: string;
  language: Profile["language"];
  strategy: TutorRequest["strategy"];
};
const entrySchema = z.object({
  lesson: lessonSchema,
  sources: z.array(citationSchema),
  provider: z.string(),
  demo: z.boolean(),
  latencyMs: z.number(),
  topic: z.string(),
  language: z.enum(["English", "Telugu", "Hindi"]),
  strategy: z.enum([
    "lesson",
    "simple",
    "example",
    "steps",
    "diagram",
    "analogy",
    "application",
    "worked",
    "test",
  ]),
});
const actions: [TutorRequest["strategy"], string][] = [
  ["simple", "Explain more simply"],
  ["example", "Real-world example"],
  ["steps", "Step by step"],
  ["diagram", "Show a diagram"],
  ["analogy", "Use an analogy"],
  ["application", "Practical application"],
  ["worked", "Worked example"],
  ["test", "Test my understanding"],
];
export function Classroom() {
  const [topic, setTopic] = useState("Electrical transformers");
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [research, setResearch] = useState(false);
  const [clarity, setClarity] = useState("");
  const [reteach, setReteach] = useState(false);
  useEffect(() => {
    queueMicrotask(() => {
      const q = new URLSearchParams(window.location.search).get("topic");
      const selected =
        q ?? localStorage.getItem("nl-topic") ?? "Electrical transformers";
      setTopic(
        q ?? localStorage.getItem("nl-topic") ?? "Electrical transformers",
      );
      setProfile(browserRepository.profile());
      setReteach(
        new URLSearchParams(window.location.search).get("reteach") === "true",
      );
      try {
        setEntries(
          z
            .array(entrySchema)
            .parse(JSON.parse(localStorage.getItem("nl-history") ?? "[]"))
            .filter((e) => e.topic === selected),
        );
      } catch {
        /* Invalid history is discarded. */
      }
    });
  }, []);
  async function teach(
    strategy: TutorRequest["strategy"] = reteach ? "simple" : profile.style,
    language = profile.language,
  ) {
    setBusy(true);
    setError("");
    try {
      localStorage.setItem("nl-topic", topic);
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          language,
          strategy,
          message,
          research,
          level: profile.level,
          context: entries
            .filter((e) => e.topic === topic)
            .slice(-4)
            .map((e) => ({
              role: "assistant",
              content: e.lesson.explanation.slice(0, 1000),
            })),
        }),
      });
      const raw = await response.json();
      if (!response.ok) throw new Error(raw.error ?? "Lesson unavailable");
      const entry = entrySchema.parse(raw);
      const next = [...entries.filter((e) => e.topic === topic), entry].slice(
        -20,
      );
      setEntries(next);
      let saved: Entry[] = [];
      try {
        saved = z
          .array(entrySchema)
          .parse(JSON.parse(localStorage.getItem("nl-history") ?? "[]"));
      } catch {
        /* Reset incompatible history schemas. */
      }
      localStorage.setItem(
        "nl-history",
        JSON.stringify([...saved, entry].slice(-60)),
      );
      setMessage("");
      setClarity("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load lesson");
    } finally {
      setBusy(false);
    }
  }
  const last = entries.at(-1);
  return (
    <>
      <div className="eyebrow">The learning workspace</div>
      <h1 className="page-title">A little curiosity goes a long way.</h1>
      <div className="workspace">
        <aside className="sidebar card">
          <h3>Your learning path</h3>
          <p className="fine">Assess → Teach → Practice → Review</p>
          <Link href="/assessment">01 · Check your starting point</Link>
          <Link href="/classroom">02 · Explore the concept</Link>
          <Link href="/labs">03 · Try an interactive lab</Link>
          <Link href="/assessment?mode=practice">
            04 · Check your understanding
          </Link>
          <Link href="/progress">05 · Reflect on your progress</Link>
          <p className="fine" style={{ marginTop: 20 }}>
            Switch paths
          </p>
          {subjects.map((s) => (
            <Link
              key={s.id}
              href={`/classroom?topic=${encodeURIComponent(s.name)}`}
              onClick={() => {
                setTopic(s.name);
                setEntries([]);
              }}
            >
              {s.name}
            </Link>
          ))}
        </aside>
        <div className="stack">
          <div className="notice">
            Provider responses carry their mode below. Curated demonstrations
            are deterministic fixtures, not live AI. Live Nebius verification is
            blocked until inference access is available.
          </div>
          <form
            className="card stack"
            onSubmit={(e) => {
              e.preventDefault();
              void teach();
            }}
          >
            <div className="form-grid">
              <div>
                <label htmlFor="class-topic">Topic</label>
                <input
                  id="class-topic"
                  value={topic}
                  required
                  minLength={2}
                  maxLength={200}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="class-language">Language</label>
                <select
                  id="class-language"
                  value={profile.language}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      language: e.target.value as Profile["language"],
                    })
                  }
                >
                  {["English", "Telugu", "Hindi"].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                checked={research}
                onChange={(e) => setResearch(e.target.checked)}
              />
              Research with Tavily (requires configured credits)
            </label>
            <Button disabled={busy}>Teach me this topic</Button>
          </form>
          {busy && (
            <div role="status" className="skeleton">
              Preparing your explanation…
            </div>
          )}
          {error && (
            <div role="alert" className="notice error">
              {error}
            </div>
          )}
          {last && (
            <article className="card">
              <div className="tutor-head">
                <span className="tutor-avatar">
                  <BrainCircuit size={23} />
                </span>
                <div>
                  <h3>{last.lesson.title}</h3>
                  <small className="muted">
                    {last.demo
                      ? "Curated demonstration · not live inference"
                      : `Live ${last.provider} response`}{" "}
                    · {last.latencyMs} ms
                  </small>
                </div>
              </div>
              <div
                className="lesson"
                lang={
                  last.language === "Telugu"
                    ? "te"
                    : last.language === "Hindi"
                      ? "hi"
                      : "en"
                }
              >
                {last.lesson.explanation}
              </div>
              {last.strategy === "diagram" && (
                <ConceptDiagram topic={last.topic} />
              )}
              <div className="check">
                <strong>Pause & think</strong>
                {last.lesson.check}
              </div>
              {last.sources.length > 0 && (
                <div>
                  <h3 style={{ marginTop: 24 }}>Retrieved sources</h3>
                  <p className="fine">
                    Retrieved material informs the generated explanation; it is
                    not a verified citation for every claim.
                  </p>
                  {last.sources.map((s) => (
                    <p key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        {s.title} ↗
                      </a>
                    </p>
                  ))}
                </div>
              )}
              <div className="actions">
                <Button
                  className="secondary"
                  onClick={() => {
                    setClarity("Saved: clear");
                    localStorage.setItem("nl-clarity", "clear");
                  }}
                >
                  This is clear
                </Button>
                <Button
                  className="secondary"
                  disabled={busy}
                  onClick={() => {
                    localStorage.setItem("nl-clarity", "unclear");
                    void teach("simple");
                  }}
                >
                  I need another explanation
                </Button>
                <span role="status">{clarity}</span>
              </div>
            </article>
          )}
          <div className="card">
            <h3>Make it click your way</h3>
            <div className="toolbar">
              {actions.map(([strategy, label]) => (
                <Button
                  className="secondary"
                  key={strategy}
                  disabled={busy}
                  onClick={() => void teach(strategy)}
                >
                  {label}
                </Button>
              ))}
              {(["Telugu", "Hindi"] as const).map((l) => (
                <Button
                  key={l}
                  className="secondary"
                  disabled={busy}
                  onClick={() => {
                    setProfile({ ...profile, language: l });
                    void teach("lesson", l);
                  }}
                >
                  Explain in {l}
                </Button>
              ))}
            </div>
            <form
              className="stack"
              style={{ marginTop: 24 }}
              onSubmit={(e) => {
                e.preventDefault();
                void teach();
              }}
            >
              <div>
                <label htmlFor="followup">
                  Your answer or follow-up question
                </label>
                <textarea
                  id="followup"
                  value={message}
                  maxLength={2000}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What part feels unclear?"
                  required
                />
              </div>
              <Button disabled={busy}>Send to tutor</Button>
            </form>
            <p className="fine" style={{ margin: "15px 0 0" }}>
              Fixture mode demonstrates teaching strategies; open-ended answer
              analysis requires live inference.
            </p>
          </div>
          {entries.length > 1 && (
            <details className="card">
              <summary>
                Session history ({entries.length - 1} earlier explanations)
              </summary>
              {entries.slice(0, -1).map((e, i) => (
                <div key={i}>
                  <h3>{e.lesson.title}</h3>
                  <p className="lesson">{e.lesson.explanation}</p>
                </div>
              ))}
            </details>
          )}
        </div>
      </div>
    </>
  );
}
