import React, { useState, useEffect } from "react";
import { apiFetch } from "../api.js";
import { apiFetch as baseFetch } from "emdash/plugin-utils";
import type { SeoCheck } from "../../types.js";

interface ContentItem {
  id: string;
  data: { title?: string; slug?: string };
  collection?: string;
}

interface AnalysisResult {
  score: number;
  checks: SeoCheck[];
}

const STATUS_ICON: Record<string, string> = { pass: "\u2713", warn: "\u26A0", fail: "\u2717" };
const STATUS_COLOR: Record<string, string> = { pass: "#10b981", warn: "#f59e0b", fail: "#ef4444" };

export function ContentAnalysisPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    baseFetch("/_emdash/api/content?limit=100", { method: "GET" })
      .then((res) => res.json())
      .then((data: any) => {
        setContent(data.data || data.items || []);
        setContentLoading(false);
      })
      .catch(() => {
        setContentLoading(false);
        setError("Failed to load content");
      });
  }, []);

  async function analyze(contentId: string) {
    setAnalyzing(contentId);
    setSelectedId(contentId);
    setResult(null);
    setError("");
    try {
      const res = await apiFetch("analyze", { contentId });
      const data = (await res.json()) as any;
      if (data.error) {
        setError(data.message || data.error);
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setError(e.message || "Analysis failed");
    } finally {
      setAnalyzing(null);
    }
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 1.5rem", fontSize: "1.25rem" }}>Content Analysis</h2>

      {error && (
        <div
          role="alert"
          style={{
            padding: "12px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            color: "#991b1b",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      {contentLoading ? (
        <p style={{ color: "#6b7280" }}>Loading content...</p>
      ) : content.length === 0 && !error ? (
        <p style={{ color: "#6b7280" }}>No content found. Create some posts or pages first.</p>
      ) : content.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
              <th style={{ padding: "8px 12px", fontWeight: 600 }}>Title</th>
              <th style={{ padding: "8px 12px", fontWeight: 600 }}>Collection</th>
              <th style={{ padding: "8px 12px", fontWeight: 600, width: 100 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {content.map((item) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: "1px solid #f3f4f6",
                  background: selectedId === item.id ? "#f0fdf4" : "transparent",
                }}
              >
                <td style={{ padding: "8px 12px" }}>{item.data?.title || item.id}</td>
                <td style={{ padding: "8px 12px", color: "#6b7280" }}>{item.collection || "\u2014"}</td>
                <td style={{ padding: "8px 12px" }}>
                  <button
                    onClick={() => analyze(item.id)}
                    disabled={analyzing === item.id}
                    style={{
                      padding: "4px 12px",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      background: analyzing === item.id ? "#f3f4f6" : "#fff",
                    }}
                  >
                    {analyzing === item.id ? "..." : "Analyze"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {result && (
        <div style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: result.score >= 70 ? "#10b981" : result.score >= 40 ? "#f59e0b" : "#ef4444",
              }}
            >
              {result.score}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>SEO Score</div>
              <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{result.checks.length} checks performed</div>
            </div>
          </div>
          <div>
            {result.checks.map((check) => (
              <div
                key={check.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <span
                  style={{
                    color: STATUS_COLOR[check.status] || "#6b7280",
                    fontWeight: 700,
                    width: 20,
                  }}
                >
                  {STATUS_ICON[check.status] || "?"}
                </span>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{check.label}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{check.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
