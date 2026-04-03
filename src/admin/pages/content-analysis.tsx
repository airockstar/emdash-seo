import React, { useState } from "react";
import { ScoreBadge } from "../components/score-badge.js";
import type { SeoCheck } from "../../types.js";

export interface ContentAnalysisPageProps {
  callRoute: (route: string, input?: unknown) => Promise<unknown>;
}

const STATUS_ICON: Record<string, string> = { pass: "\u2713", warn: "\u26A0", fail: "\u2717" };

export function ContentAnalysisPage({ callRoute }: ContentAnalysisPageProps) {
  const [contentId, setContentId] = useState("");
  const [result, setResult] = useState<{ score: number; checks: SeoCheck[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze(advanced = false) {
    if (!contentId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const route = advanced ? "analyze/advanced" : "analyze";
      const data = await callRoute(route, { contentId: contentId.trim() }) as any;
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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") analyze(false);
  }

  return (
    <div className="seo-plugin">
      <h2 style={{ margin: "0 0 16px", fontSize: "1.25rem", fontWeight: 600 }}>Content Analysis</h2>

      <div className="seo-card" style={{ marginBottom: 24 }}>
        <div className="seo-card-body">
          <label htmlFor="analysis-id" className="seo-label">Content ID</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              id="analysis-id" className="seo-input" type="text"
              placeholder="Enter a content ID to analyze..."
              value={contentId} onChange={(e) => setContentId(e.target.value)}
              onKeyDown={handleKeyDown} style={{ flex: 1 }}
            />
            <button className="seo-btn seo-btn-primary" onClick={() => analyze(false)} disabled={loading || !contentId.trim()}>
              {loading ? "Analyzing..." : "Analyze"}
            </button>
            <button className="seo-btn seo-btn-secondary" onClick={() => analyze(true)} disabled={loading || !contentId.trim()}>
              Advanced (Pro)
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="seo-fade-in" style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.375rem", color: "#991b1b", marginBottom: 16, fontSize: "0.8125rem" }}>
          {error}
        </div>
      )}

      {result && (
        <div className="seo-card seo-fade-in">
          <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 20, borderBottom: "1px solid #f3f4f6" }}>
            <ScoreBadge score={result.score} size={72} showLabel />
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>{result.score}/100</div>
              <div style={{ fontSize: "0.8125rem", color: "#6b7280" }}>{result.checks.length} checks performed</div>
            </div>
          </div>
          <div className="seo-card-body" style={{ padding: 0 }}>
            {result.checks.map((check) => {
              const badgeClass = check.status === "pass" ? "seo-badge-success" : check.status === "warn" ? "seo-badge-warning" : "seo-badge-error";
              return (
                <div key={check.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid #f3f4f6" }}>
                  <span className={`seo-badge ${badgeClass}`} aria-label={check.status} style={{ minWidth: 24, justifyContent: "center" }}>
                    {STATUS_ICON[check.status]}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: "0.8125rem", color: "#111827" }}>{check.label}</div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{check.message}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!result && !error && !loading && (
        <div className="seo-empty">
          <div style={{ fontSize: "1rem", marginBottom: 4 }}>Run an analysis</div>
          <div style={{ fontSize: "0.8125rem" }}>Enter a content ID above and click Analyze to see your SEO score.</div>
        </div>
      )}
    </div>
  );
}
