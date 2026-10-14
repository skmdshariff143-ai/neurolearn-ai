import { guestStorage } from "@/lib/preview";
import { z } from "zod";
import { activitySchema, profileSchema, type Profile } from "./domain";
import { browserRepository } from "./repository";
const snapshotSchema = z.object({
  profile: profileSchema.nullable(),
  activities: z.array(activitySchema),
});
async function call(method: string, body?: unknown) {
  const response = await fetch("/api/progress", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error ?? "Hosted progress unavailable");
  return data;
}
export const cloudEnabled = () =>
  guestStorage.getItem("nl-cloud-enabled") === "true";
export const remoteRepository = {
  async load() {
    const data = snapshotSchema.parse(await call("GET"));
    const combined = [...browserRepository.activities()];
    for (const record of data.activities) {
      const existing = combined.findIndex((a) => a.id === record.id);
      if (existing === -1) combined.push(record);
      else combined[existing] = record;
    }
    combined.sort((a, b) => (Date.parse(a.at) || 0) - (Date.parse(b.at) || 0));
    guestStorage.setItem("nl-activities", JSON.stringify(combined.slice(-500)));
    if (data.profile) browserRepository.saveProfile(data.profile);
    return data;
  },
  async saveProfile(profile: Profile) {
    await call("PUT", profileSchema.parse(profile));
  },
  async saveAssessment(input: {
    id: string;
    topic: string;
    kind: "diagnostic" | "practice";
    answers: number[];
  }) {
    const data = await call("POST", input);
    return activitySchema.parse(data.activity);
  },
  async clear() {
    await call("DELETE");
    guestStorage.removeItem("nl-cloud-enabled");
  },
};
