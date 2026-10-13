import { z } from "zod";
import { courseSchema } from "./courses";
import { resourceSchema } from "./resources";
const snapshotSchema = z.object({
  courses: z.array(courseSchema).max(10),
  resources: z.array(resourceSchema).max(5),
});
export async function libraryRequest(
  method: "GET" | "POST" | "DELETE",
  body?: unknown,
  id?: string,
) {
  const r = await fetch(
    `/api/library${id ? `?resource=${encodeURIComponent(id)}` : ""}`,
    {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    },
  );
  const data = await r.json();
  if (!r.ok) throw new Error(data.error ?? "Hosted library unavailable");
  return data;
}
export async function librarySnapshot() {
  return snapshotSchema.parse(await libraryRequest("GET"));
}
