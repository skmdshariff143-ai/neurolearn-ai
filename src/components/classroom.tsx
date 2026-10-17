"use client";
import { guestStorage } from "@/lib/preview";

import { useEffect, useState } from "react";
import { safePreview } from "@/lib/preview";
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
import { resources, retrieve, type Resource } from "@/lib/resources";
import { normalizedSourceSchema, type NormalizedSource } from "@/lib/research/types";
type Entry = {
  lesson: Lesson;
  sources: z.infer<typeof citationSchema>[];
  normalizedSources?: NormalizedSource[];
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
  normalizedSources: z.array(normalizedSourceSchema).optional(),
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
  const [universalResearch, setUniversalResearch] = useState(false);
  const [stage, setStage] = useState<
    | "idle"
    | "finding_sources"
    | "checking_evidence"
    | "preparing_explanation"
    | "creating_examples"
    | "ready"
  >("idle");
  const [clarity, setClarity] = useState("");
  const [reteach, setReteach] = useState(false);
  const [documents, setDocuments] = useState<Resource[]>([]);
  const [documentId, setDocumentId] = useState("");
  const [consent, setConsent] = useState(false);
  const [usedPassages, setUsedPassages] = useState<ReturnType<typeof retrieve>>(
    [],
  );
  useEffect(() => {
    queueMicrotask(() => {
      const q = new URLSearchParams(window.location.search).get("topic");
      const selected =
        q ?? guestStorage.getItem("nl-topic") ?? "Electrical transformers";
      setTopic(
        q ?? guestStorage.getItem("nl-topic") ?? "Electrical transformers",
      );
      setProfile(browserRepository.profile());
      setDocuments(resources.load());
      setReteach(
        new URLSearchParams(window.location.search).get("reteach") === "true",
      );
      try {
        setEntries(
          z
            .array(entrySchema)
            .parse(JSON.parse(guestStorage.getItem("nl-history") ?? "[]"))
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
    customMessage?: string,
  ) {
    const outgoingMessage = customMessage ?? message;
    setBusy(true);
    setError("");
    setStage(universalResearch ? "finding_sources" : "preparing_explanation");
    try {
      const document = documents.find((d) => d.id === documentId);
      if (document && !consent)
        throw new Error(
          "Consent is required before sending PDF passages to inference.",
        );
      const passages = document
        ? retrieve(document, `${topic} ${outgoingMessage}`)
        : [];
      if (document && !passages.length)
        throw new Error(
          "No relevant passage found. Try topic words present in your notes.",
        );
      guestStorage.setItem("nl-topic", topic);

      if (universalResearch) {
        setStage("checking_evidence");
      }

      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          language,
          strategy,
          message: outgoingMessage,
          research,
          universalResearch,
          passages,
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
      setStage("creating_examples");
      const raw = await response.json();
      if (!response.ok) throw new Error(raw.error ?? "Lesson unavailable");
      const entry = entrySchema.parse(raw);
      setUsedPassages(passages);
      const next = [...entries.filter((e) => e.topic === topic), entry].slice(
        -20,
      );
      setEntries(next);
      let saved: Entry[] = [];
      try {
        saved = z
          .array(entrySchema)
          .parse(JSON.parse(guestStorage.getItem("nl-history") ?? "[]"));
      } catch {
        /* Reset incompatible history schemas. */
      }
      guestStorage.setItem(
        "nl-history",
        JSON.stringify([...saved, entry].slice(-60)),
      );
      if (!customMessage) setMessage("");
      setClarity("");
      setStage("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load lesson");
    } finally {
      setBusy(false);
      setStage("idle");
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
              <div>
                <label htmlFor="class-level">Level</label>
                <select
                  id="class-level"
                  value={profile.level}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      level: e.target.value as Profile["level"],
                    })
                  }
                >
                  {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                    <option key={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                checked={universalResearch}
                disabled={safePreview}
                onChange={(e) => {
                  setUniversalResearch(e.target.checked);
                  if (e.target.checked) setResearch(false);
                }}
              />
              Universal open research (Wikipedia, OpenAlex, Crossref, OpenStax, Tavily)
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={research}
                disabled={safePreview}
                onChange={(e) => {
                  setResearch(e.target.checked);
                  if (e.target.checked) setUniversalResearch(false);
                }}
              />
              Research with Tavily (requires configured credits)
            </label>
            <Button disabled={busy}>Teach me this topic</Button>
            <label htmlFor="class-document">Use your PDF notes</label>
            <select
              id="class-document"
              disabled={safePreview}
              value={documentId}
              onChange={(e) => {
                setDocumentId(e.target.value);
                setConsent(false);
              }}
            >
              <option value="">No document</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
            {documentId && (
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                I consent to send up to three relevant passages to the
                configured inference provider. Do not send personal or sensitive
                information.
              </label>
            )}
            <Link href="/learn">Manage private browser PDF notes</Link>
          </form>
          {busy && (
            <div role="status" className="skeleton">
              {stage === "finding_sources" &&
                "Finding sources across open educational repositories…"}
              {stage === "checking_evidence" &&
                "Checking evidence, authority, and topic relevance…"}
              {stage === "preparing_explanation" &&
                "Preparing your explanation…"}
              {stage === "creating_examples" &&
                "Creating examples & concept checks…"}
              {stage === "ready" && "Ready to learn!"}
              {stage === "idle" && "Preparing your explanation…"}
            </div>
          )}
          {error && (
            <div role="alert" className="notice error">
              {error}
            </div>
          )}
          {last && (
            <article className="card">
              {usedPassages.length > 0 && (
                <details>
                  <summary>
                    Uploaded source passages used (learner material, unverified)
                  </summary>
                  {usedPassages.map((p, i) => (
                    <blockquote key={i}>
                      {p.text}
                      <p>
                        [{p.resourceId}:p{p.page}] · {p.title}
                      </p>
                    </blockquote>
                  ))}
                </details>
              )}
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
              {last.normalizedSources && last.normalizedSources.length > 0 ? (
                <div>
                  <h3 style={{ marginTop: 24 }}>Verified educational sources</h3>
                  <p className="fine">
                    Grounded in open educational repositories with verified publisher licenses.
                  </p>
                  {last.normalizedSources.map((s) => (
                    <div
                      key={s.sourceId}
                      className="card"
                      style={{ marginTop: 12, padding: 14 }}
                    >
                      <p style={{ fontWeight: 600, margin: "0 0 6px" }}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer">
                          {s.title} ↗
                        </a>
                      </p>
                      <p className="fine" style={{ margin: "0 0 8px" }}>
                        <strong>Publisher:</strong> {s.publisher} ·{" "}
                        <strong>License:</strong> {s.license}
                      </p>
                      <blockquote
                        style={{
                          margin: 0,
                          fontSize: "0.9em",
                          fontStyle: "italic",
                          opacity: 0.9,
                        }}
                      >
                        &ldquo;{s.excerpt}&rdquo;
                      </blockquote>
                    </div>
                  ))}
                </div>
              ) : last.sources.length > 0 ? (
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
              ) : null}
              <div className="actions">
                <Button
                  className="secondary"
                  onClick={() => {
                    setClarity("Saved: clear");
                    guestStorage.setItem("nl-clarity", "clear");
                  }}
                >
                  This is clear
                </Button>
                <Button
                  className="secondary"
                  disabled={busy}
                  onClick={() => {
                    guestStorage.setItem("nl-clarity", "unclear");
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
              <Button
                className="secondary"
                disabled={busy}
                onClick={() =>
                  void teach(
                    "simple",
                    profile.language,
                    "Explain the core prerequisites and foundational knowledge needed for this concept.",
                  )
                }
              >
                Explain prerequisites
              </Button>
              <Button
                className="secondary"
                disabled={busy}
                onClick={() =>
                  void teach(
                    "simple",
                    profile.language,
                    "Please analyze my answer or thought process and explain why it is wrong.",
                  )
                }
              >
                Why my answer is wrong
              </Button>
              <Button
                className="secondary"
                disabled={busy}
                onClick={() =>
                  void teach(
                    "lesson",
                    profile.language,
                    "What should I study next after mastering this concept? Suggest the next lesson.",
                  )
                }
              >
                Suggest next lesson
              </Button>
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
