import { describe, it, expect, vi, afterEach } from "vitest";
import { runStructuredTask } from "../src/lib/workflow";
import { workflowRequestSchema } from "../src/lib/learning-schemas";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
function setup(output: unknown) {
  vi.stubEnv("AI_PROVIDER", "nebius");
  vi.stubEnv("NEBIUS_API_KEY", "test");
  vi.stubEnv("NEBIUS_MODEL", "nvidia/test-nemotron");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: JSON.stringify(output) } }],
        }),
      ),
    ),
  );
}
describe("structured workflow tasks under mock transport", () => {
  it("never fabricates live evaluations in fixture mode", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("AI_PROVIDER", "fixture");
    await expect(
      runStructuredTask(
        workflowRequestSchema.parse({
          task: "roadmap",
          topic: "Python",
          language: "English",
          days: 3,
        }),
      ),
    ).rejects.toThrow("requires a configured live");
  });
  it("rejects a generated plan with missing days", async () => {
    setup({
      title: "Python",
      prerequisites: [],
      objectives: [{ conceptId: "loop", description: "Understand loops" }],
      units: [1, 2, 3].map((day) => ({
        day,
        topic: "Loops",
        activity: "Trace one example",
        revision: day === 3,
      })),
    });
    await expect(
      runStructuredTask(
        workflowRequestSchema.parse({
          task: "roadmap",
          topic: "Python",
          language: "English",
          days: 4,
        }),
      ),
    ).rejects.toThrow("invalid day sequence");
  });
  it("accepts an ordered plan", async () => {
    setup({
      title: "Python",
      prerequisites: [],
      objectives: [{ conceptId: "loop", description: "Understand loops" }],
      units: [1, 2, 3].map((day) => ({
        day,
        topic: "Loops",
        activity: "Trace one example",
        revision: day === 3,
      })),
    });
    const result = await runStructuredTask(
      workflowRequestSchema.parse({
        task: "roadmap",
        topic: "Python",
        language: "English",
        days: 3,
      }),
    );
    expect(result.demo).toBe(false);
  });
  it("rejects an evaluation with a substituted rubric", async () => {
    setup({
      criteria: [
        { conceptId: "other", earned: 2, possible: 2, reason: "Evidence" },
      ],
      misconceptions: [],
      feedback: "Review",
    });
    await expect(
      runStructuredTask(
        workflowRequestSchema.parse({
          task: "evaluate",
          topic: "Transformers",
          language: "English",
          question: "Why changing flux?",
          answer: "Because AC changes flux",
          rubric: [
            {
              conceptId: "flux",
              criterion: "Identifies changing flux",
              points: 2,
            },
          ],
        }),
      ),
    ).rejects.toThrow("supplied rubric");
  });
  it("accepts reviewable rubric evidence", async () => {
    setup({
      criteria: [
        {
          conceptId: "flux",
          earned: 2,
          possible: 2,
          reason: "The answer explicitly says AC changes flux.",
        },
      ],
      misconceptions: [],
      feedback: "Correct key idea.",
    });
    const r = await runStructuredTask(
      workflowRequestSchema.parse({
        task: "evaluate",
        topic: "Transformers",
        language: "English",
        question: "Why changing flux?",
        answer: "Because AC changes flux",
        rubric: [
          {
            conceptId: "flux",
            criterion: "Identifies changing flux",
            points: 2,
          },
        ],
      }),
    );
    expect(r.provider).toBe("nebius");
  });
});
