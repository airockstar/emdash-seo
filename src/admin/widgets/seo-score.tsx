import React, { useState, useEffect } from "react";
import { ScoreBadge } from "../components/score-badge.js";
import { Skeleton, EmptyState } from "../components/shared.js";
import { colors } from "../tokens.js";
import { apiFetch } from "../api.js";

interface ScoreItem {
  id: string;
  data: { score: number; collection: string };
}

export function SeoScoreWidget() {
  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiFetch("scores/list", { limit: 100 })
      .then((d: any) => {
        setScores(d.items ?? []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <div style={{ color: colors.errorText, fontSize: "0.8125rem" }}>Failed to load scores.</div>;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Skeleton width={72} height={72} circle />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Skeleton width={80} height={14} />
          <Skeleton width={120} height={12} />
        </div>
      </div>
    );
  }

  if (scores.length === 0) {
    return <EmptyState title="No scores yet" description="Analyze content to see site-wide SEO scores." />;
  }

  const avg = Math.round(scores.reduce((sum, s) => sum + s.data.score, 0) / scores.length);
  let good = 0, fair = 0, poor = 0;
  for (const s of scores) {
    if (s.data.score >= 70) good++;
    else if (s.data.score >= 40) fair++;
    else poor++;
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <ScoreBadge score={avg} size={72} />
        <div>
          <div style={{ fontSize: "0.75rem", color: colors.textSecondary, marginBottom: 8 }}>
            Site Average ({scores.length} pages)
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: "0.8125rem" }}>
            <span className="seo-badge seo-badge-success">{good} good</span>
            <span className="seo-badge seo-badge-warning">{fair} fair</span>
            <span className="seo-badge seo-badge-error">{poor} poor</span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: "0.75rem", textAlign: "center" }}>
        <a href="https://emdashseo.app/#pricing" target="_blank" rel="noopener" style={{ color: "#0bd68f", textDecoration: "none" }}>
          Upgrade to Pro for advanced checks →
        </a>
      </div>
    </div>
  );
}
