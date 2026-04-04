import React, { useState } from "react";
import { ScoreBadge } from "../components/score-badge.js";
import { ErrorBanner, EmptyState } from "../components/shared.js";
import { colors } from "../tokens.js";
import type { SeoCheck } from "../../types.js";

export interface ContentAnalysisPageProps {
  callRoute: (route: string, input?: unknown) => Promise<unknown>;
}

const STATUS_ICON: Record<string, string> = { pass: "\u2713", warn: "\u26A0", fail: "\u2717" };

export function ContentAnalysisPage({ callRoute }: ContentAnalysisPageProps) {
  const [contentId, setContentId] = useState("");
  const [result, setResult] = useState<{ score: number; checks: SeoCheck[]; altSuggestions?: Array<{ src?: string; imageIndex: number; suggestedAlt: string }> } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [linkSuggestions, setLinkSuggestions] = useState<any[]>([]);

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
        setLinkSuggestions([]);
        if (advanced) {
          callRoute("analyze/link-suggestions", { contentId: contentId.trim() })
            .then((d: any) => setLinkSuggestions(d.suggestions ?? []))
            .catch(() => setLinkSuggestions([]));
        }
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

      {error && <ErrorBanner message={error} />}

      {result && (
        <div className="seo-card seo-fade-in">
          <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 20, borderBottom: `1px solid ${colors.borderSubtle}` }}>
            <ScoreBadge score={result.score} size={72} showLabel />
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: colors.textPrimary }}>{result.score}/100</div>
              <div style={{ fontSize: "0.8125rem", color: colors.textSecondary }}>{result.checks.length} checks performed</div>
            </div>
          </div>
          <div className="seo-card-body" style={{ padding: 0 }}>
            {result.checks.map((check) => {
              const badgeClass = check.status === "pass" ? "seo-badge-success" : check.status === "warn" ? "seo-badge-warning" : "seo-badge-error";
              return (
                <div key={check.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: `1px solid ${colors.borderSubtle}` }}>
                  <span className={`seo-badge ${badgeClass}`} aria-label={check.status} style={{ minWidth: 24, justifyContent: "center" }}>
                    {STATUS_ICON[check.status]}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: "0.8125rem", color: colors.textPrimary }}>{check.label}</div>
                    <div style={{ fontSize: "0.75rem", color: colors.textSecondary }}>{check.message}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result && (
        <div className="seo-card seo-fade-in" style={{ marginTop: 16 }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.borderSubtle}` }}>
            <h4 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600 }}>Internal Link Suggestions</h4>
          </div>
          <div className="seo-card-body">
            {linkSuggestions.length === 0 ? (
              <div style={{ color: colors.textTertiary, fontSize: "0.8125rem" }}>No link suggestions available. Run Advanced analysis for suggestions.</div>
            ) : (
              linkSuggestions.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${colors.borderSubtle}` }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: "0.8125rem" }}>{s.targetTitle}</div>
                    <div style={{ fontSize: "0.75rem", color: colors.textTertiary }}>{s.targetUrl}</div>
                  </div>
                  <span className="seo-badge seo-badge-success">{Math.round(s.relevanceScore * 100)}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {result?.altSuggestions && result.altSuggestions.length > 0 && (
        <div className="seo-card seo-fade-in" style={{ marginTop: 16 }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.borderSubtle}` }}>
            <h4 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600 }}>Alt Text Suggestions</h4>
          </div>
          <div className="seo-card-body">
            {result.altSuggestions.map((s, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${colors.borderSubtle}` }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: 500 }}>{s.src || `Image ${s.imageIndex + 1}`}</div>
                <div style={{ fontSize: "0.75rem", color: colors.textSecondary }}>Suggested: &quot;{s.suggestedAlt}&quot;</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!result && !error && !loading && (
        <EmptyState title="Run an analysis" description="Enter a content ID above and click Analyze to see your SEO score." />
      )}
    </div>
  );
}
