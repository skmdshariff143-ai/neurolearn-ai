import { afterEach, expect, it, vi } from "vitest";
const captured = vi.hoisted(() => ({
  creates: [] as Record<string, unknown>[],
  updates: [] as Record<string, unknown>[],
}));
vi.mock("../src/lib/telemetry", () => ({
  telemetryClient: {
    createRun: async (run: Record<string, unknown>) => {
      captured.creates.push(run);
    },
    updateRun: async (_id: string, run: Record<string, unknown>) => {
      captured.updates.push(run);
    },
  },
  tracingEnabled: true,
  tokenMetrics: () => ({
    input_tokens: 10,
    output_tokens: 20,
    total_tokens: 30,
  }),
}));
import { generateLesson } from "../src/lib/providers";
import { runStructuredTask } from "../src/lib/workflow";
import { requestSchema } from "../src/lib/domain";
import { workflowRequestSchema } from "../src/lib/learning-schemas";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  captured.creates.length = 0;
  captured.updates.length = 0;
});
it("redacts actual tutor, diagnostic, misconception evaluation and reteaching trace boundaries under synthetic transport", async () => {
  vi.stubEnv("AI_PROVIDER", "local");
  vi.stubEnv("LOCAL_AI_MODEL", "synthetic-privacy-test");
  const sentinel = "PRIVATE-LEARNER-SENTINEL";
  const lesson = {
    title: sentinel,
    explanation: `Changing magnetic flux induces voltage. ${sentinel}`,
    check: sentinel,
    concepts: ["flux"],
  };
  const diagnostic = {
    title: sentinel,
    objectives: [{ conceptId: "flux", description: sentinel }],
    questions: [1, 2].map((id) => ({
      id: String(id),
      concept: "flux",
      prompt: sentinel,
      options: ["AC", "DC"],
      correct: 0,
      reason: sentinel,
    })),
  };
  const evaluation = {
    criteria: [{ conceptId: "flux", earned: 0, possible: 1, reason: sentinel }],
    misconceptions: [
      {
        conceptId: "flux",
        classification: "conceptual misunderstanding",
        evidence: sentinel,
        confidence: "medium",
        recommendation: sentinel,
      },
    ],
    feedback: sentinel,
  };
  const outputs = [lesson, diagnostic, evaluation, lesson];
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementation(
        async () =>
          new Response(
            JSON.stringify({
              choices: [
                { message: { content: JSON.stringify(outputs.shift()) } },
              ],
              usage: { prompt_tokens: 10, completion_tokens: 20 },
            }),
          ),
      ),
  );
  await generateLesson(
    requestSchema.parse({ topic: "Transformers", message: sentinel }),
  );
  await runStructuredTask(
    workflowRequestSchema.parse({
      task: "diagnostic",
      topic: sentinel,
      language: "English",
    }),
  );
  await runStructuredTask(
    workflowRequestSchema.parse({
      task: "evaluate",
      topic: "Transformers",
      language: "English",
      question: sentinel,
      answer: sentinel,
      rubric: [{ conceptId: "flux", criterion: sentinel, points: 1 }],
    }),
  );
  await generateLesson(
    requestSchema.parse({
      topic: "Transformers",
      strategy: "simple",
      message: sentinel,
    }),
  );
  expect(captured.creates).toHaveLength(8);
  expect(captured.updates).toHaveLength(8);
  for (const run of captured.creates)
    expect(run.inputs).toEqual({ redacted: true });
  for (const run of captured.updates)
    expect(run.outputs).toMatchObject({ redacted: true });
  expect(
    JSON.stringify([...captured.creates, ...captured.updates]),
  ).not.toContain(sentinel);
  expect(
    captured.updates.some(
      (run) =>
        (run.outputs as Record<string, unknown>).evaluationMetrics &&
        JSON.stringify(run.outputs).includes('"possibleMisconceptions":1'),
    ),
  ).toBe(true);
});
