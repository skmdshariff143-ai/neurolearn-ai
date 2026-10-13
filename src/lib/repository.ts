import { z } from "zod";
import {
  activitySchema,
  profileSchema,
  type Activity,
  type Profile,
} from "./domain";
export interface LearningRepository {
  activities(): Activity[];
  saveActivity(activity: Activity): void;
  profile(): Profile;
  saveProfile(profile: Profile): void;
  clear(): void;
}
export const defaultProfile: Profile = {
  language: "English",
  level: "Beginner",
  goal: "Build a clear understanding",
  minutes: 20,
  style: "lesson",
  reducedMotion: false,
};
function read<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  try {
    return schema.parse(JSON.parse(localStorage.getItem(key) ?? "null"));
  } catch {
    return fallback;
  }
}
export const browserRepository: LearningRepository = {
  activities: () => read("nl-activities", z.array(activitySchema), []),
  saveActivity(a) {
    localStorage.setItem(
      "nl-activities",
      JSON.stringify(
        [...this.activities(), activitySchema.parse(a)].slice(-500),
      ),
    );
  },
  profile: () => read("nl-profile", profileSchema, defaultProfile),
  saveProfile: (p) =>
    localStorage.setItem("nl-profile", JSON.stringify(profileSchema.parse(p))),
  clear() {
    for (const key of [
      "nl-activities",
      "nl-profile",
      "nl-history",
      "nl-topic",
      "nl-workflow",
      "nl-roadmap",
      "nl-clarity",
      "nl-cloud-enabled",
    ])
      localStorage.removeItem(key);
  },
};
