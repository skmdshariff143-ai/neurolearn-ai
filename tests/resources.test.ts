import { describe, it, expect } from "vitest";
import { retrieve, resourceSchema, extractPDF } from "../src/lib/resources";
const resource = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "My notes",
  provenance: "learner-upload" as const,
  bytes: 100,
  createdAt: "2026-10-13T12:00:00.000Z",
  pages: [
    { page: 1, text: "Transformers use changing magnetic flux." },
    { page: 2, text: "Unrelated history lesson." },
  ],
};
describe("private document retrieval boundaries", () => {
  it("retrieves matching passages with genuine page identifiers", () => {
    const matches = retrieve(resource, "magnetic transformers");
    expect(matches).toHaveLength(1);
    expect(matches[0].page).toBe(1);
    expect(retrieve(resource, "quadratics")).toEqual([]);
  });
  it("handles Telugu and Hindi search without stripping Unicode", () => {
    expect(
      retrieve(
        {
          ...resource,
          pages: [{ page: 1, text: "తెలుగు విద్య हिन्दी शिक्षा" }],
        },
        "విద్య शिक्षा",
      ),
    ).toHaveLength(1);
  });
  it("rejects oversized metadata and fake PDF bytes before loading the parser", async () => {
    expect(
      resourceSchema.safeParse({ ...resource, bytes: 3000000 }).success,
    ).toBe(false);
    await expect(
      extractPDF(
        new File(["not a PDF"], "notes.pdf", { type: "application/pdf" }),
      ),
    ).rejects.toThrow(/not a PDF/);
  });
});
