"use client";
import { useEffect, useState } from "react";
import { safePreview } from "@/lib/preview";
import { browserRepository, defaultProfile } from "@/lib/repository";
import type { Profile } from "@/lib/domain";
import { Button } from "./ui/button";
import { remoteRepository, cloudEnabled } from "@/lib/remote-repository";
import { courseRepository } from "@/lib/courses";
import { resources } from "@/lib/resources";
export function Settings() {
  const [p, setP] = useState<Profile>(defaultProfile);
  const [status, setStatus] = useState("");
  const [integration, setIntegration] = useState<Record<string, unknown>>({});
  useEffect(() => {
    queueMicrotask(() => {
      setP(browserRepository.profile());
      fetch("/api/status")
        .then((r) => r.json())
        .then(setIntegration)
        .catch(() => setStatus("Unable to read integration status."));
    });
  }, []);
  return (
    <>
      <div className="eyebrow">Your learning preferences</div>
      <h1 className="page-title">Make yourself comfortable.</h1>
      <form
        className="card stack"
        data-reduced-motion={p.reducedMotion}
        onSubmit={(e) => {
          e.preventDefault();
          try {
            browserRepository.saveProfile(p);
            setStatus(
              safePreview
                ? "Preferences kept temporarily; reload resets them."
                : "Preferences saved in this browser.",
            );
            if (cloudEnabled())
              void remoteRepository
                .saveProfile(p)
                .catch(() =>
                  setStatus("Preferences saved locally; hosted sync failed."),
                );
          } catch {
            setStatus("Storage unavailable; preferences could not be saved.");
          }
        }}
      >
        <div className="form-grid">
          <div>
            <label htmlFor="pref-language">Language</label>
            <select
              id="pref-language"
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
            <label htmlFor="pref-level">Level</label>
            <select
              id="pref-level"
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
            <label htmlFor="pref-style">Preferred explanation</label>
            <select
              id="pref-style"
              value={p.style}
              onChange={(e) =>
                setP({ ...p, style: e.target.value as Profile["style"] })
              }
            >
              {[
                "lesson",
                "simple",
                "example",
                "steps",
                "analogy",
                "worked",
              ].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pref-goal">Goal</label>
            <input
              id="pref-goal"
              value={p.goal}
              maxLength={300}
              onChange={(e) => setP({ ...p, goal: e.target.value })}
            />
          </div>
        </div>
        <label htmlFor="pref-minutes">Daily study minutes</label>
        <input
          id="pref-minutes"
          type="number"
          min={5}
          max={120}
          required
          value={p.minutes}
          onChange={(e) => setP({ ...p, minutes: Number(e.target.value) })}
        />
        <label className="check-label">
          <input
            type="checkbox"
            checked={p.reducedMotion}
            onChange={(e) => setP({ ...p, reducedMotion: e.target.checked })}
          />
          Reduce motion (system preference also respected)
        </label>
        <p className="language-note">
          <span lang="te">తెలుగులో నేర్చుకోండి.</span> ·{" "}
          <span lang="hi">हिन्दी में सीखें।</span>
        </p>
        <Button>Save preferences</Button>
        <p role="status">{status}</p>
      </form>
      <div className="card" style={{ marginTop: 20 }}>
        <h2>Integration status</h2>
        <div className="status-grid">
          {Object.entries(integration).map(([key, value]) => (
            <span key={key}>
              <strong>{key}</strong>
              <br />
              {String(value)}
            </span>
          ))}
        </div>
        <p className="fine" style={{ marginTop: 15 }}>
          Configured does not mean live verified. No account authentication is
          enabled.
        </p>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <h3>Guest data</h3>
        <p>
          This browser stores your preferences, assessment results, and session
          history. Export is available before clearing.
        </p>
        <div className="actions">
          <Button
            className="secondary"
            disabled={safePreview}
            onClick={() => {
              const blob = new Blob(
                [
                  JSON.stringify(
                    {
                      profile: browserRepository.profile(),
                      activities: browserRepository.activities(),
                      courses: courseRepository.load(),
                      resources: resources.load(),
                    },
                    null,
                    2,
                  ),
                ],
                { type: "application/json" },
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "neurolearn-progress.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export my progress
          </Button>
          <Button
            className="secondary"
            onClick={() => {
              if (
                window.confirm(
                  safePreview
                    ? "Reset temporary preview activity? Existing saved records remain untouched."
                    : "Delete your NeuroLearn guest data from this browser?",
                )
              ) {
                browserRepository.clear();
                setP(defaultProfile);
                setStatus(
                  safePreview
                    ? "Temporary activity reset; existing stored records unchanged."
                    : "Guest data cleared.",
                );
              }
            }}
          >
            {safePreview ? "Clear temporary activity" : "Clear guest data"}
          </Button>
        </div>
      </div>
    </>
  );
}
