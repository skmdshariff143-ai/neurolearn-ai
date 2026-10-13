import { mkdir, writeFile } from "node:fs/promises";
import { randomBytes, randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { traceable } from "langsmith/traceable";
import { provider, research } from "../src/lib/providers";
import { requestSchema } from "../src/lib/domain";
import { outlineToCourse } from "../src/lib/courses";
import {
  saveCourse,
  saveResource,
  loadLibrary,
} from "../src/lib/learning-store";
import { telemetryClient, tracingEnabled } from "../src/lib/telemetry";
import {
  loadGuest,
  saveGuestAssessment,
  deleteGuest,
  databasePool,
} from "../src/lib/postgres";
type Service = "nebius" | "tavily" | "langsmith" | "postgres";
async function main() {
  const service = process.argv
    .find((s) =>
      ["--nebius", "--tavily", "--langsmith", "--postgres"].includes(s),
    )
    ?.slice(2) as Service | undefined;
  if (!service) {
    console.error("Choose --nebius, --tavily, --langsmith, or --postgres");
    process.exit(2);
  }
  const required: Record<Service, string[]> = {
    nebius: ["NEBIUS_API_KEY", "NEBIUS_MODEL"],
    tavily: ["TAVILY_API_KEY"],
    langsmith: ["LANGSMITH_API_KEY"],
    postgres: ["DATABASE_URL"],
  };
  const evidence: Record<string, unknown> = {
    service,
    verifiedAt: new Date().toISOString(),
    scope: "integration smoke; not learner outcome evaluation",
    status: "blocked",
  };
  let exitCode = 2;
  try {
    const missing = required[service].filter((n) => !process.env[n]);
    if (missing.length)
      evidence.reason = `Missing configuration: ${missing.join(", ")}. No external request made.`;
    else if (!process.argv.includes("--confirm-live"))
      evidence.reason =
        "Add --confirm-live to authorize the bounded external verification. No external request made.";
    else {
      if (service === "nebius") {
        const model = process.env.NEBIUS_MODEL!;
        if (!/^nvidia\/.*nemotron/i.test(model))
          throw new Error("Expected NVIDIA Nemotron model");
        const listed = await fetch(
          "https://api.tokenfactory.nebius.com/v1/models",
          {
            headers: { Authorization: `Bearer ${process.env.NEBIUS_API_KEY}` },
            signal: AbortSignal.timeout(15000),
          },
        );
        if (!listed.ok) throw new Error("Model catalog unavailable");
        const catalog = (await listed.json()) as { data?: { id: string }[] };
        if (!catalog.data?.some((item) => item.id === model))
          throw new Error("Configured model not present in account catalog");
        process.env.AI_PROVIDER = "nebius";
        const p = provider();
        const start = Date.now();
        const lesson = await p.generate(
          requestSchema.parse({
            topic: "Electrical transformers",
            strategy: "simple",
          }),
          [],
        );
        Object.assign(evidence, {
          model,
          catalogConfirmed: true,
          structuredLessonValid: true,
          latencyMs: Date.now() - start,
          usage: p.usage,
          responseExcerpt: lesson.explanation.slice(0, 600),
        });
      } else if (service === "tavily") {
        const start = Date.now();
        const sources = await research(
          "electromagnetic induction transformer alternating current",
        );
        if (!sources.length)
          throw new Error("No relevant HTTPS educational sources");
        Object.assign(evidence, {
          latencyMs: Date.now() - start,
          sourceCount: sources.length,
          sources: sources.map((s) => ({ title: s.title, url: s.url })),
        });
      } else if (service === "langsmith") {
        if (!tracingEnabled) throw new Error("LANGSMITH_TRACING must be true");
        let runId = "";
        const sentinel = "PRIVATE-SMOKE-SENTINEL-DO-NOT-STORE";
        const smoke = traceable(
          async (input: { sentinel: string }) => ({
            sentinel: input.sentinel,
            contractValid: true,
          }),
          {
            name: "neurolearn-privacy-visibility-smoke",
            client: telemetryClient,
            tracingEnabled: true,
            processInputs: () => ({ redacted: true }),
            processOutputs: () => ({ redacted: true, contractValid: true }),
            on_end: (run) => {
              runId = run.id;
            },
          },
        );
        await smoke({ sentinel });
        await telemetryClient.awaitPendingTraceBatches();
        if (!runId) throw new Error("No trace ID");
        let run:
          Awaited<ReturnType<typeof telemetryClient.readRun>> | undefined;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            run = await telemetryClient.readRun(runId);
            break;
          } catch {
            if (attempt === 2) throw new Error("Trace not readable");
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
        if (
          !run ||
          JSON.stringify(run.inputs).includes(sentinel) ||
          JSON.stringify(run.outputs).includes(sentinel) ||
          run.inputs.redacted !== true ||
          run.outputs?.redacted !== true
        )
          throw new Error("Trace redaction check failed");
        if (!run.session_id) throw new Error("Trace project not readable");
        const feedback = await telemetryClient.createFeedback({
          runId,
          sessionId: run.session_id,
          key: "synthetic_smoke_contract",
          score: 1,
          comment:
            "Synthetic trace visibility/redaction check; not educational efficacy.",
        });
        if ((await telemetryClient.readFeedback(feedback.id)).score !== 1)
          throw new Error("Feedback not readable");
        Object.assign(evidence, {
          traceId: runId,
          traceVisible: true,
          inputsAndOutputsRedacted: true,
          syntheticFeedbackVisible: true,
        });
      } else {
        const a = randomBytes(32).toString("hex"),
          b = randomBytes(32).toString("hex");
        try {
          await loadGuest(a);
          await saveGuestAssessment(a, {
            id: randomUUID(),
            topic: "Electrical transformers",
            kind: "diagnostic",
            answers: [1, 2],
          });
          const own = await loadGuest(a),
            other = await loadGuest(b);
          const course = outlineToCourse(
            {
              title: "Synthetic persistence test",
              prerequisites: [],
              objectives: [{ conceptId: "flux", description: "Changing flux" }],
              units: [1, 2, 3].map((day) => ({
                day,
                topic: "Electrical transformers",
                activity: "Synthetic smoke check",
                revision: false,
              })),
            },
            {
              goal: "Verify repository isolation",
              language: "English",
              level: "Beginner",
              minutes: 20,
              provenance: "curated-demo",
            },
          );
          await saveCourse(a, course);
          await saveResource(a, {
            id: randomUUID(),
            title: "Synthetic smoke notes",
            provenance: "learner-upload",
            bytes: 100,
            createdAt: new Date().toISOString(),
            pages: [
              { page: 1, text: "Synthetic non-personal educational passage." },
            ],
          });
          const library = await loadLibrary(a),
            otherLibrary = await loadLibrary(b);
          if (
            library.courses.length !== 1 ||
            library.resources.length !== 1 ||
            otherLibrary.courses.length ||
            otherLibrary.resources.length
          )
            throw new Error("Library isolation failed");
          if (
            own.activities.length !== 1 ||
            own.activities[0].score !== 100 ||
            other.activities.length !== 0
          )
            throw new Error("Persistence isolation failed");
          Object.assign(evidence, {
            serverGradingVerified: true,
            writeReadVerified: true,
            crossGuestIsolationVerified: true,
            courseAndDocumentIsolationVerified: true,
          });
        } finally {
          const cleanup = await Promise.allSettled([
            deleteGuest(a),
            deleteGuest(b),
          ]);
          await databasePool().end();
          if (cleanup.some((r) => r.status === "rejected"))
            throw new Error("Scratch guest cleanup could not be verified");
        }
      }
      evidence.status = "passed";
      exitCode = 0;
    }
  } catch {
    evidence.status = "failed";
    evidence.reason =
      "Live verification failed. Check private configuration, role grants, provider access, and service logs. Sensitive exception details are deliberately not printed.";
    exitCode = 1;
  } finally {
    await telemetryClient.awaitPendingTraceBatches().catch(() => {});
  }
  const directory = resolve(".integration-evidence");
  await mkdir(directory, { recursive: true });
  const path = resolve(directory, `${service}.json`);
  await writeFile(path, JSON.stringify(evidence, null, 2) + "\n");
  console.log(
    `${String(evidence.status).toUpperCase()}: ${service}. Evidence: ${path}`,
  );
  if (evidence.reason) console.log(evidence.reason);
  process.exit(exitCode);
}
void main().catch(() => {
  console.error(
    "FAIL: verification runner could not complete. No success is claimed.",
  );
  process.exit(1);
});
