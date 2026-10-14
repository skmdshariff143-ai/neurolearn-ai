import type { Activity, TutorRequest } from "./domain";
import type { Course } from "./courses";
import { questions, topicKey } from "./content";

type Evidence = {
  id: string;
  topic: string;
  concept: string;
  passed: boolean;
  at: string;
};
export type Revision = {
  topic: string;
  concept: string;
  dueAt: string;
  due: boolean;
  consecutiveChecks: number;
  evidenceCount: number;
};
const day = 86_400_000;
const intervals = [1, 3, 7, 14];

/** Suggested intervals, not measured forgetting probabilities or mastery. */
export function revisionQueue(
  activities: Activity[],
  courses: Course[],
  now = Date.now(),
): Revision[] {
  const evidence: Evidence[] = [];
  for (const a of activities) {
    const concepts = topicKey(a.topic)
      ? questions(a.topic, a.kind === "practice").map((q) => q.concept)
      : a.weak;
    for (const concept of new Set(concepts))
      evidence.push({
        id: a.id,
        topic: a.topic,
        concept,
        passed: !a.weak.includes(concept),
        at: a.at,
      });
  }
  for (const c of courses)
    for (const lesson of c.modules.flatMap((m) => m.lessons))
      for (const a of lesson.attempts)
        for (const q of lesson[a.kind]?.questions ?? [])
          evidence.push({
            id: a.id,
            topic: lesson.topic,
            concept: q.concept,
            passed: !a.weak.includes(q.concept),
            at: a.at,
          });
  const groups = new Map<string, Evidence[]>();
  const seen = new Set<string>();
  for (const e of evidence) {
    const time = Date.parse(e.at);
    const key = JSON.stringify([e.topic, e.concept]);
    const identity = JSON.stringify([e.id, e.topic, e.concept]);
    if (!Number.isFinite(time) || time > now || seen.has(identity)) continue;
    seen.add(identity);
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }
  return [...groups.values()]
    .map((items) => {
      items.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
      let consecutiveChecks = 0;
      let lastSuccessfulAt: number | undefined;
      for (const e of items) {
        const time = Date.parse(e.at);
        if (!e.passed) {
          consecutiveChecks = 0;
          lastSuccessfulAt = undefined;
        } else if (
          lastSuccessfulAt === undefined ||
          time - lastSuccessfulAt >= day
        ) {
          consecutiveChecks++;
          lastSuccessfulAt = time;
        }
      }
      const latest = items.at(-1)!;
      const interval =
        intervals[Math.min(consecutiveChecks, intervals.length - 1)];
      const dueAt = new Date(
        Date.parse(latest.at) + interval * day,
      ).toISOString();
      return {
        topic: latest.topic,
        concept: latest.concept,
        dueAt,
        due: Date.parse(dueAt) <= now,
        consecutiveChecks,
        evidenceCount: items.length,
      };
    })
    .sort(
      (a, b) =>
        Date.parse(a.dueAt) - Date.parse(b.dueAt) ||
        a.concept.localeCompare(b.concept),
    );
}

export function reteachingStrategy(
  retries: number,
  simpler = false,
): TutorRequest["strategy"] {
  if (simpler || retries === 1) return "simple";
  return retries >= 2 ? "worked" : "steps";
}

export function recallPrompt(topic: string, concept: string) {
  return `Without looking at the lesson, explain ${concept} in ${topic} in your own words. Give a new example, state an assumption, and explain why a tempting alternative would be wrong.`;
}
