"use client";
import { useEffect, useState } from "react";
import { safePreview } from "@/lib/preview";
import {
  extractPDF,
  resources,
  retrieve,
  type Resource,
} from "@/lib/resources";
import { Button } from "./ui/button";
import { libraryRequest, librarySnapshot } from "@/lib/library-client";
export function ResourceLibrary() {
  const [all, setAll] = useState<Resource[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState("");
  useEffect(() => {
    queueMicrotask(() => setAll(resources.load()));
  }, []);
  if (safePreview)
    return (
      <section className="card" style={{ marginTop: 24 }}>
        <h2>Document uploads disabled</h2>
        <p>
          Uploads and private document storage are unavailable in this fixture
          preview. Hosted access isolation has not been verified.
        </p>
      </section>
    );
  return (
    <section
      className="card stack"
      style={{ marginTop: 24 }}
      aria-labelledby="resource-title"
    >
      <h2 id="resource-title">Your PDF notes</h2>
      <details>
        <summary>Trusted public references (curated links)</summary>
        <ul>
          <li>
            <a
              href="https://docs.python.org/3/tutorial/controlflow.html"
              target="_blank"
              rel="noreferrer"
            >
              [public-python] Python official control-flow tutorial
            </a>
          </li>
          <li>
            <a
              href="https://openstax.org/books/college-algebra-2e/pages/2-5-quadratic-equations"
              target="_blank"
              rel="noreferrer"
            >
              [public-quadratics] OpenStax quadratic equations
            </a>
          </li>
          <li>
            <a
              href="https://openstax.org/books/university-physics-volume-2/pages/15-6-transformers"
              target="_blank"
              rel="noreferrer"
            >
              [public-transformers] OpenStax transformers
            </a>
          </li>
        </ul>
        <p>
          These are external reference links checked on 13 October 2026. Their
          full contents are not copied into the application.
        </p>
      </details>
      <Button
        className="secondary"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          setError("");
          void librarySnapshot()
            .then((snapshot) => {
              for (const r of snapshot.resources) {
                if (!resources.load().some((old) => old.id === r.id))
                  resources.save(r);
              }
              setAll(resources.load());
            })
            .catch((e) =>
              setError(
                e instanceof Error ? e.message : "Hosted notes unavailable",
              ),
            )
            .finally(() => setBusy(false));
        }}
      >
        Load hosted notes
      </Button>
      <p className="fine">
        Hosted storage is optional and requires organizer access in Settings.
        Save buttons explicitly upload extracted text, not the original PDF.
      </p>
      <p>
        Only upload educational material you have permission to use. Text is
        extracted locally; original files are not uploaded or retained. Up to
        five PDFs, 2 MiB and 20 pages each. This browser profile stores
        extracted text; avoid sensitive information and shared devices. No OCR
        or password-protected documents.
      </p>
      <label htmlFor="pdf-notes">Add a text-based PDF</label>
      <input
        id="pdf-notes"
        type="file"
        accept="application/pdf,.pdf"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setBusy(true);
          setError("");
          void extractPDF(f)
            .then((r) => {
              resources.save(r);
              setAll(resources.load());
            })
            .catch(() =>
              setError(
                "Unable to read or save this PDF. Check that it has selectable text, no password, at most 20 pages and 2 MiB. Storage may also be full.",
              ),
            )
            .finally(() => setBusy(false));
        }}
      />
      {busy && <p role="status">Extracting PDF text locally…</p>}
      {error && <p role="alert">{error}</p>}
      <label htmlFor="resource-query">Find a passage in your notes</label>
      <input
        id="resource-query"
        value={query}
        maxLength={200}
        onChange={(e) => setQuery(e.target.value)}
      />
      {all.length === 0 && <p>No saved notes yet.</p>}
      {all.map((r) => (
        <article key={r.id}>
          <h3>{r.title}</h3>
          <p>Learner upload · {r.pages.length} pages</p>
          <Button
            className="secondary"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setError("");
              void libraryRequest("POST", { kind: "resource", data: r })
                .catch((e) =>
                  setError(
                    e instanceof Error ? e.message : "Hosted save failed",
                  ),
                )
                .finally(() => setBusy(false));
            }}
          >
            Save {r.title} to hosted storage
          </Button>
          <Button
            className="secondary"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setError("");
              void libraryRequest("DELETE", undefined, r.id)
                .catch((e) =>
                  setError(
                    e instanceof Error ? e.message : "Hosted deletion failed",
                  ),
                )
                .finally(() => setBusy(false));
            }}
          >
            Delete hosted copy of {r.title}
          </Button>
          <Button
            className="secondary"
            onClick={() => {
              try {
                resources.remove(r.id);
                setAll(resources.load());
              } catch {
                setError("Document could not be deleted from storage.");
              }
            }}
          >
            Delete {r.title}
          </Button>
          {query &&
            retrieve(r, query).map((p, i) => (
              <blockquote key={i}>
                <p>{p.text}</p>
                <cite>
                  [{p.resourceId}:p{p.page}] · {p.title}
                </cite>
              </blockquote>
            ))}
        </article>
      ))}
      <p>
        In the classroom, select a document and explicitly consent to send
        matching passages to the configured inference provider. PDF contents are
        excluded from LangSmith tracing.
      </p>
    </section>
  );
}
