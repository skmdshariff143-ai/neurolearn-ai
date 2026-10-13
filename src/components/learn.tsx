"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { subjects } from "@/lib/content";
import { browserRepository, defaultProfile } from "@/lib/repository";
import type { Profile } from "@/lib/domain";
import { Button } from "./ui/button";
export function Learn() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [p, setP] = useState<Profile>(defaultProfile);
  const [error, setError] = useState("");
  useEffect(() => {
    queueMicrotask(() => {
      setP(browserRepository.profile());
    });
  }, []);
  return (
    <>
      <div className="eyebrow">Your next discovery</div>
      <h1 className="page-title">What would you like to understand?</h1>
      <p className="page-intro">
        Start as a guest. Set your starting point and choose a topic. The
        demonstration includes three curated paths; arbitrary topics need a
        configured live provider.
      </p>
      <form
        className="card stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (topic.trim().length < 2) return;
          try {
            browserRepository.saveProfile(p);
            localStorage.setItem("nl-topic", topic.trim());
            router.push(`/classroom?topic=${encodeURIComponent(topic.trim())}`);
          } catch {
            setError(
              "Browser storage is unavailable. Enable storage to keep your guest journey.",
            );
          }
        }}
      >
        <div>
          <label htmlFor="topic">Learning topic</label>
          <input
            id="topic"
            required
            minLength={2}
            maxLength={200}
            placeholder="e.g. Electrical transformers from zero"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div className="form-grid">
          <div>
            <label htmlFor="language">Explanation language</label>
            <select
              id="language"
              value={p.language}
              onChange={(e) =>
                setP({ ...p, language: e.target.value as Profile["language"] })
              }
            >
              {["English", "Telugu", "Hindi"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="level">Starting level</label>
            <select
              id="level"
              value={p.level}
              onChange={(e) =>
                setP({ ...p, level: e.target.value as Profile["level"] })
              }
            >
              {["Beginner", "Intermediate", "Advanced"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="goal">Learning goal (no personal details)</label>
            <input
              id="goal"
              maxLength={300}
              value={p.goal}
              onChange={(e) => setP({ ...p, goal: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="time">Minutes per study session</label>
            <input
              id="time"
              type="number"
              min={5}
              max={120}
              value={p.minutes}
              onChange={(e) => setP({ ...p, minutes: Number(e.target.value) })}
            />
          </div>
        </div>
        <Button type="submit">Open my classroom →</Button>
        {error && <p role="alert">{error}</p>}
      </form>
      <div className="section-head">
        <h2>Or try a guided path</h2>
      </div>
      <div className="grid3">
        {subjects.map((s) => (
          <button className="card" key={s.id} onClick={() => setTopic(s.name)}>
            <h3>{s.name}</h3>
            <p>{s.description}</p>
          </button>
        ))}
      </div>
    </>
  );
}
