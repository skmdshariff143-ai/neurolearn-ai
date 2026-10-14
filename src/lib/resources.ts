import { guestStorage } from "@/lib/preview";
import { z } from "zod";
import { safePreview } from "./preview";
export const resourceSchema = z
  .object({
    id: z.uuid(),
    title: z.string().min(1).max(150),
    provenance: z.literal("learner-upload"),
    createdAt: z.iso.datetime(),
    bytes: z
      .number()
      .int()
      .min(1)
      .max(2 * 1024 * 1024),
    pages: z
      .array(
        z.object({
          page: z.number().int().min(1).max(20),
          text: z.string().max(10000),
        }),
      )
      .min(1)
      .max(20),
  })
  .refine(
    (r) => r.pages.reduce((n, p) => n + p.text.length, 0) <= 100000,
    "Document text limit reached",
  );
export type Resource = z.infer<typeof resourceSchema>;
export const resources = {
  load(): Resource[] {
    try {
      return z
        .array(resourceSchema)
        .max(5)
        .parse(JSON.parse(guestStorage.getItem("nl-resources") ?? "[]"));
    } catch {
      return [];
    }
  },
  save(input: Resource) {
    const r = resourceSchema.parse(input),
      all = this.load();
    if (all.length >= 5)
      throw new Error("Five document limit reached. Delete a document first.");
    guestStorage.setItem("nl-resources", JSON.stringify([...all, r]));
  },
  remove(id: string) {
    guestStorage.setItem(
      "nl-resources",
      JSON.stringify(this.load().filter((r) => r.id !== id)),
    );
  },
};
export function retrieve(resource: Resource, query: string) {
  const terms = Array.from(
    new Set(query.toLocaleLowerCase().match(/[\p{L}\p{M}\p{N}]{2,}/gu) ?? []),
  ).slice(0, 20);
  return resource.pages
    .flatMap((p) =>
      Array.from({ length: Math.ceil(p.text.length / 1200) }, (_, i) => ({
        resourceId: resource.id,
        title: resource.title,
        page: p.page,
        text: p.text.slice(i * 1200, (i + 1) * 1200),
      })),
    )
    .map((p) => ({
      ...p,
      relevance: terms.filter((t) => p.text.toLocaleLowerCase().includes(t))
        .length,
    }))
    .filter((p) => p.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3);
}
export async function extractPDF(file: File): Promise<Resource> {
  if (safePreview)
    throw new Error("Document uploads disabled in fixture preview");
  if (
    file.size > 2 * 1024 * 1024 ||
    file.size === 0 ||
    !/\.pdf$/i.test(file.name) ||
    !["", "application/pdf"].includes(file.type)
  )
    throw new Error("Choose a PDF no larger than 2 MiB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-")
    throw new Error("File is not a PDF.");
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const task = pdfjs.getDocument({
    data: bytes,
    useSystemFonts: false,
    stopAtErrors: true,
  });
  const timer = setTimeout(() => {
    void task.destroy();
  }, 15000);
  try {
    const pdf = await task.promise;
    if (pdf.numPages > 20)
      throw new Error("PDF limit is 20 pages. Split the document first.");
    const pages: Resource["pages"] = [];
    for (let page = 1; page <= pdf.numPages; page++) {
      const content = await (await pdf.getPage(page)).getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      if (text.length > 10000)
        throw new Error("Page text exceeds the supported limit.");
      pages.push({ page, text });
    }
    if (pages.every((p) => p.text.trim().length < 10))
      throw new Error(
        "No readable text found. Scanned/image-only PDFs need OCR, which is not supported.",
      );
    return resourceSchema.parse({
      id: crypto.randomUUID(),
      title: file.name.slice(0, 150),
      provenance: "learner-upload",
      bytes: file.size,
      createdAt: new Date().toISOString(),
      pages,
    });
  } finally {
    clearTimeout(timer);
    await task.destroy();
  }
}
