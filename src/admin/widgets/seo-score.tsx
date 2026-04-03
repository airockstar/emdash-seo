import React, { useState, useEffect } from "react";
import { ScoreBadge } from "../components/score-badge.js";
import { colors } from "../tokens.js";

interface ScoreItem {
  id: string;
  data: { score: number; collection: string };
}

export interface SeoScoreWidgetProps {
  callRoute: (route: string, input?: unknown) => Promise<unknown>;
}

export function SeoScoreWidget({ callRoute }: SeoScoreWidgetProps) {
  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    callRoute("scores/list", { limit: 100 })
      .then((d: any) => setScores(d.items ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <div style={{ color: colors.errorText, fontSize: "0.8125rem" }}>Failed to load scores.</div>;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div className="seo-skeleton" style={{ width: 72, height: 72, borderRadius: "50%" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="seo-skeleton" style={{ width: 80, height: 14 }} />
          <div className="seo-skeleton" style={{ width: 120, height: 12 }} />
        </div>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="seo-empty" style={{ padding: "1.5rem" }}>
        <div style={{ fontSize: "0.875rem", marginBottom: 4 }}>No scores yet</div>
        <div style={{ fontSize: "0.75rem" }}>Analyze content to see site-wide SEO scores.</div>
      </div>
    );
  }

  const avg = Math.round(scores.reduce((sum, s) => sum + s.data.score, 0) / scores.length);
  const good = scores.filter((s) => s.data.score >= 70).length;
  const fair = scores.filter((s) => s.data.score >= 40 && s.data.score < 70).length;
  const poor = scores.filter((s) => s.data.score < 40).length;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <ScoreBadge score={avg} size={72} />
      <div>
        <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 8 }}>
          Site Average ({scores.length} pages)
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: "0.8125rem" }}>
          <span className="seo-badge seo-badge-success">{good} good</span>
          <span className="seo-badge seo-badge-warning">{fair} fair</span>
          <span className="seo-badge seo-badge-error">{poor} poor</span>
        </div>
      </div>
    </div>
  );
}
