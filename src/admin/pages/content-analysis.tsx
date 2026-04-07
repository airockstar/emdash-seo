import React, { useState, useEffect } from "react";
import { apiFetch } from "../api.js";
import { ScoreBadge } from "../components/score-badge.js";
import { ErrorBanner, EmptyState, SeoStyleProvider } from "../components/shared.js";
import { colors, fontSize } from "../tokens.js";
import { loadAllContent } from "../utils/content-loader.js";
import type { ContentItem } from "../utils/content-loader.js";
import type { SeoCheck } from "../../types.js";

interface AnalysisResult {
  score: number;
  checks: SeoCheck[];
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  pass: "seo-badge seo-badge-success",
  warn: "seo-badge seo-badge-warning",
  fail: "seo-badge seo-badge-error",
};

const STATUS_LABEL: Record<string, string> = {
  pass: "Pass",
  warn: "Warning",
  fail: "Fail",
};

const STATUS_ORDER: Record<string, number> = { fail: 0, warn: 1, pass: 2 };

function sortChecks(checks: SeoCheck[]): SeoCheck[] {
  return [...checks].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3),
  );
}

function CheckRow({ check }: { check: SeoCheck }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        padding: "0.625rem 0",
        borderBottom: `1px solid ${colors.borderSubtle}`,
      }}
    >
      <span
        className={STATUS_BADGE_CLASS[check.status] ?? "seo-badge"}
        style={{ flexShrink: 0, marginTop: "0.125rem" }}
      >
        {STATUS_LABEL[check.status] ?? check.status}
      </span>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: fontSize.sm,
            fontWeight: 500,
            color: colors.textPrimary,
          }}
        >
          {check.label}
        </div>
        <div
          style={{
            fontSize: fontSize.xs,
            color: colors.textSecondary,
            marginTop: "0.125rem",
            lineHeight: 1.4,
          }}
        >
          {check.message}
        </div>
      </div>
    </div>
  );
}

function AnalysisPanel({
  result,
  contentTitle,
  onClose,
}: {
  result: AnalysisResult;
  contentTitle: string;
  onClose: () => void;
}) {
  const sorted = sortChecks(result.checks);
  const counts = { fail: 0, warn: 0, pass: 0 };
  for (const c of sorted) counts[c.status]++;

  return (
    <div className="seo-fade-in" style={{ padding: "0.25rem 0" }}>
      <div
        className="seo-card-body"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${colors.borderDefault}`,
          paddingBottom: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <ScoreBadge score={result.score} size={56} showLabel />
          <div>
            <div
              style={{
                fontSize: fontSize.base,
                fontWeight: 600,
                color: colors.textPrimary,
              }}
            >
              {contentTitle}
            </div>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                marginTop: "0.25rem",
                fontSize: fontSize.xs,
                color: colors.textSecondary,
              }}
            >
              {counts.fail > 0 && (
                <span style={{ color: colors.errorText }}>
                  {counts.fail} failed
                </span>
              )}
              {counts.warn > 0 && (
                <span style={{ color: colors.warningText }}>
                  {counts.warn} warnings
                </span>
              )}
              <span style={{ color: colors.successText }}>
                {counts.pass} passed
              </span>
            </div>
          </div>
        </div>
        <button
          className="seo-btn seo-btn-secondary seo-btn-sm"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <div className="seo-card-body" style={{ paddingTop: "0.5rem" }}>
        {sorted.map((check) => (
          <CheckRow key={check.id} check={check} />
        ))}
      </div>
    </div>
  );
}

export function ContentAnalysisPage() {
  const [content, setContent] = useState<ContentItem[] | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, AnalysisResult>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAllContent()
      .then((items) => setContent(items))
      .catch((err) => {
        console.error("[emdash-seo] Failed to load content:", err);
        setContent([]);
        setError("Failed to load content");
      });
  }, []);

  async function analyze(contentId: string, collection: string) {
    setAnalyzing(contentId);
    setError("");
    try {
      const data = await apiFetch("analyze", { contentId, collection });
      if (data.error) {
        setError(data.message || data.error);
      } else {
        const result: AnalysisResult = {
          score: data.score ?? 0,
          checks: data.checks ?? [],
        };
        setResults((prev) => ({ ...prev, [contentId]: result }));
        setExpandedId(contentId);
      }
    } catch (e: any) {
      setError(e.message || "Analysis failed");
    } finally {
      setAnalyzing(null);
    }
  }

  // Loading state
  if (content === null) {
    return (
      <SeoStyleProvider>
        <h2
          style={{
            margin: "0 0 1.5rem",
            fontSize: fontSize.xl,
            fontWeight: 600,
            color: colors.textPrimary,
          }}
        >
          Content Analysis
        </h2>
        <p style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
          Loading content...
        </p>
      </SeoStyleProvider>
    );
  }

  return (
    <SeoStyleProvider>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.25rem",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: fontSize.xl,
              fontWeight: 600,
              color: colors.textPrimary,
            }}
          >
            Content Analysis
          </h2>
          <p
            style={{
              margin: "0.25rem 0 0",
              fontSize: fontSize.sm,
              color: colors.textSecondary,
            }}
          >
            Analyze your pages and posts for SEO best practices
          </p>
        </div>
        {content.length > 0 && (
          <span
            style={{
              fontSize: fontSize.xs,
              color: colors.textTertiary,
            }}
          >
            {content.length} item{content.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      {content.length === 0 && !error ? (
        <EmptyState
          title="No content found"
          description="Create some posts or pages first, then come back to analyze them."
        />
      ) : content.length > 0 ? (
        <div className="seo-card">
          <div className="seo-table-wrap">
            <table className="seo-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th style={{ width: 120 }}>Collection</th>
                  <th style={{ width: 100 }}>Score</th>
                  <th style={{ width: 100, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {content.map((item) => {
                  const cached = results[item.id];
                  const isExpanded = expandedId === item.id;
                  const isAnalyzing = analyzing === item.id;

                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        style={{
                          background: isExpanded
                            ? colors.bgSecondary
                            : undefined,
                        }}
                      >
                        <td
                          style={{
                            fontWeight: 500,
                            color: colors.textPrimary,
                          }}
                        >
                          {item.title || item.id}
                        </td>
                        <td>
                          <span
                            className="seo-badge"
                            style={{
                              background: colors.bgTertiary,
                              color: colors.textSecondary,
                            }}
                          >
                            {item.collection}
                          </span>
                        </td>
                        <td>
                          {cached ? (
                            <button
                              onClick={() =>
                                setExpandedId(isExpanded ? null : item.id)
                              }
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                              title={
                                isExpanded
                                  ? "Hide details"
                                  : "Show details"
                              }
                            >
                              <ScoreBadge score={cached.score} size={32} />
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                style={{
                                  transition: "transform 200ms",
                                  transform: isExpanded
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                }}
                              >
                                <path
                                  d="M4 6l4 4 4-4"
                                  stroke={colors.textTertiary}
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          ) : (
                            <span
                              style={{
                                fontSize: fontSize.xs,
                                color: colors.textTertiary,
                              }}
                            >
                              --
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className={`seo-btn ${cached ? "seo-btn-secondary" : "seo-btn-primary"} seo-btn-sm`}
                            onClick={() =>
                              analyze(item.id, item.collection)
                            }
                            disabled={isAnalyzing}
                          >
                            {isAnalyzing
                              ? "Analyzing..."
                              : cached
                                ? "Re-analyze"
                                : "Analyze"}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && cached && (
                        <tr>
                          <td
                            colSpan={4}
                            style={{
                              padding: 0,
                              background: colors.bgSecondary,
                            }}
                          >
                            <AnalysisPanel
                              result={cached}
                              contentTitle={item.title || item.id}
                              onClose={() => setExpandedId(null)}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </SeoStyleProvider>
  );
}
