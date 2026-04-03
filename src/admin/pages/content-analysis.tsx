import React, { useState } from "react";
import { ScoreBadge } from "../components/score-badge.js";
import type { SeoCheck } from "../../types.js";

interface ContentAnalysisPageProps {
  callRoute: (route: string, input?: unknown) => Promise<unknown>;
}

const STATUS_ICON: Record<string, string> = {
  pass: "\u2713",
  warn: "\u26A0",
  fail: "\u2717",
};

const STATUS_COLOR: Record<string, string> = {
  pass: "#00b894",
  warn: "#e67700",
  fail: "#d63031",
};

export function ContentAnalysisPage({ callRoute }: ContentAnalysisPageProps) {
  const [contentId, setContentId] = useState("");
  const [result, setResult] = useState<{ score: number; checks: SeoCheck[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze(advanced = false) {
    if (!contentId) return;
    setLoading(true);
    setError("");
    try {
      const route = advanced ? "analyze/advanced" : "analyze";
      const data = await callRoute(route, { contentId }) as any;
      if (data.error) {
        setError(data.message || data.error);
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setError(e.message ?? "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Content Analysis</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Content ID..."
          value={contentId}
          onChange={(e) => setContentId(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={() => analyze(false)} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze (Free)"}
        </button>
        <button onClick={() => analyze(true)} disabled={loading}>
          Advanced (Pro)
        </button>
      </div>

      {error && <div style={{ color: "#d63031", marginBottom: 16 }}>{error}</div>}

      {result && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <ScoreBadge score={result.score} size={80} />
            <div>
              <div style={{ fontSize: 24, fontWeight: "bold" }}>{result.score}/100</div>
              <div style={{ color: "#666" }}>{result.checks.length} checks performed</div>
            </div>
          </div>

          <div>
            {result.checks.map((check) => (
              <div
                key={check.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <span style={{ fontSize: 18, color: STATUS_COLOR[check.status], width: 24, textAlign: "center" }}>
                  {STATUS_ICON[check.status]}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{check.label}</div>
                  <div style={{ fontSize: 13, color: "#666" }}>{check.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
