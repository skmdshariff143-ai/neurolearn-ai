"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { browserRepository } from "@/lib/repository";
import type { Activity } from "@/lib/domain";
import { remoteRepository, cloudEnabled } from "@/lib/remote-repository";
export function Progress() {
  const [records, setRecords] = useState<Activity[]>([]);
  const [syncError, setSyncError] = useState("");
  useEffect(() => {
    queueMicrotask(() => {
      setRecords(browserRepository.activities());
      if (cloudEnabled())
        void remoteRepository
          .load()
          .then(() => setRecords(browserRepository.activities()))
          .catch(() =>
            setSyncError(
              "Hosted progress could not be loaded. Showing saved browser records.",
            ),
          );
    });
  }, []);
  const topics = [...new Set(records.map((r) => r.topic))];
  const chart = topics.map((topic) => ({
    topic,
    diagnostic: records.find(
      (r) => r.topic === topic && r.kind === "diagnostic",
    )?.score,
    practice: records.findLast(
      (r) => r.topic === topic && r.kind === "practice",
    )?.score,
  }));
  return (
    <>
      <div className="eyebrow">Reflect · Review · Grow</div>
      <h1 className="page-title">Your progress, honestly recorded.</h1>
      {syncError && (
        <p role="status" className="notice">
          {syncError}
        </p>
      )}
      <p className="page-intro">
        Scores come from completed concept checks in this browser. They are
        indicators for review, not proof of subject mastery.
      </p>
      {records.length === 0 ? (
        <div className="card">
          <h2>Your first chapter is waiting.</h2>
          <p>
            Complete a diagnostic to see your starting point and review
            recommendations here.
          </p>
          <Link className="button" href="/assessment">
            Take a diagnostic
          </Link>
        </div>
      ) : (
        <>
          <div className="grid3">
            <div className="card">
              <span className="metric">{topics.length}</span>Topics assessed
            </div>
            <div className="card">
              <span className="metric">{records.length}</span>Completed
              assessments
            </div>
            <div className="card">
              <span className="metric">
                {records.filter((r) => r.kind === "practice").length}
              </span>
              Practice attempts
            </div>
          </div>
          <div className="card" style={{ marginTop: 20 }}>
            <h2>Starting point & latest practice</h2>
            <p className="fine">
              The two question sets are different but cover the same concepts.
            </p>
            <div style={{ height: 300 }} aria-label="Assessment scores chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar name="Diagnostic" dataKey="diagnostic" fill="#687e42" />
                  <Bar
                    name="Latest practice"
                    dataKey="practice"
                    fill="#b37b4c"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table style={{ width: "100%", textAlign: "left" }}>
              <caption className="fine">Accessible score table</caption>
              <thead>
                <tr>
                  <th scope="col">Topic</th>
                  <th scope="col">Diagnostic</th>
                  <th scope="col">Latest practice</th>
                </tr>
              </thead>
              <tbody>
                {chart.map((r) => (
                  <tr key={r.topic}>
                    <th scope="row">{r.topic}</th>
                    <td>{r.diagnostic ?? "Not taken"}</td>
                    <td>{r.practice ?? "Not taken"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="section-head">
            <h2>What to revisit next</h2>
          </div>
          <div className="stack">
            {topics.map((topic) => {
              const latest = records.findLast((r) => r.topic === topic)!;
              return (
                <div className="card" key={topic}>
                  <h3>{topic}</h3>
                  <p>
                    {latest.weak.length
                      ? `Review: ${latest.weak.join(", ")}. Try a worked example, then revisit practice.`
                      : "These checks are correct. Try the lab and explain the concept in your own words."}
                  </p>
                  <Link
                    className="card-link"
                    href={`/classroom?topic=${encodeURIComponent(topic)}&reteach=true`}
                  >
                    Return to the concept →
                  </Link>
                </div>
              );
            })}
          </div>
          <details className="card" style={{ marginTop: 20 }}>
            <summary>Assessment history</summary>
            {records.map((r) => (
              <p key={r.id}>
                {r.topic} · {r.kind} · {r.score}% ·{" "}
                {new Date(r.at).toLocaleString()}
              </p>
            ))}
          </details>
        </>
      )}
    </>
  );
}
