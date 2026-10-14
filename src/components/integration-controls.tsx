"use client";
import { guestStorage } from "@/lib/preview";

import { useState, useEffect } from "react";
import { safePreview } from "@/lib/preview";
import { Button } from "./ui/button";
import { remoteRepository, cloudEnabled } from "@/lib/remote-repository";
import { browserRepository } from "@/lib/repository";
export function IntegrationControls() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setEnabled(cloudEnabled()));
  }, []);
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setStatus("");
    try {
      await action();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Operation failed");
    } finally {
      setBusy(false);
    }
  }
  if (safePreview)
    return (
      <section className="card">
        <h2>Live integrations disabled</h2>
        <p>
          Nebius inference, Tavily research, LangSmith tracing and hosted
          persistence are disabled. Genuine runtime verification remains
          blocked.
        </p>
      </section>
    );
  return (
    <section className="card stack" style={{ marginTop: 20 }}>
      <h2>Live demonstration access</h2>
      <p>
        Guest demonstrations remain open. An organizer code unlocks configured
        live inference for one hour. Never enter an API key here.
      </p>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            const response = await fetch("/api/access", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code }),
            });
            const data = await response.json();
            setCode("");
            if (!response.ok) throw new Error(data.error);
            setStatus("Live access unlocked for one hour.");
          });
        }}
      >
        <label htmlFor="organizer-code">Organizer access code</label>
        <input
          id="organizer-code"
          type="password"
          autoComplete="off"
          value={code}
          maxLength={128}
          required
          onChange={(e) => setCode(e.target.value)}
        />
        <Button disabled={busy}>Unlock live access</Button>
      </form>
      <Button
        className="secondary"
        disabled={busy}
        onClick={() =>
          void run(async () => {
            const response = await fetch("/api/access", { method: "DELETE" });
            if (!response.ok) throw new Error("Could not lock live access");
            setStatus("Live access locked.");
          })
        }
      >
        Lock live access
      </Button>
      <h2>Optional hosted guest progress</h2>
      <p>
        Hosted storage requires a configured PostgreSQL database and, in
        production, an organizer access code. With your consent, new curated
        assessment answers are graded and stored on the server. A private
        browser cookie controls access; losing it loses access to that guest
        record. Earlier browser-only scores are not uploaded.
      </p>
      <div className="actions">
        <Button
          disabled={busy}
          className="secondary"
          onClick={() =>
            void run(async () => {
              await remoteRepository.load();
              await remoteRepository.saveProfile(browserRepository.profile());
              guestStorage.setItem("nl-cloud-enabled", "true");
              setEnabled(true);
              setStatus(
                "Hosted guest storage enabled for this browser. New assessments will sync.",
              );
            })
          }
        >
          {enabled ? "Reload hosted progress" : "Enable hosted guest storage"}
        </Button>
        <Button
          disabled={busy}
          className="secondary"
          onClick={() => {
            guestStorage.removeItem("nl-cloud-enabled");
            setEnabled(false);
            setStatus("Hosted sync paused; stored data is retained.");
          }}
        >
          Pause hosted sync
        </Button>
        <Button
          disabled={busy}
          className="secondary"
          onClick={() => {
            if (
              window.confirm("Permanently delete your hosted guest progress?")
            )
              void run(async () => {
                await remoteRepository.clear();
                setEnabled(false);
                setStatus(
                  "Hosted guest record deleted. Browser data is unchanged.",
                );
              });
          }}
        >
          Delete hosted guest data
        </Button>
      </div>
      <p role="status">{status}</p>
    </section>
  );
}
