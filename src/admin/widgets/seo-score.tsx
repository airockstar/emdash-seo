import React, { useState, useEffect } from "react";
import { ScoreBadge } from "../components/score-badge.js";

interface ScoreItem {
  id: string;
  data: { score: number; collection: string };
}

interface SeoScoreWidgetProps {
  callRoute: (route: string, input?: unknown) => Promise<unknown>;
}

export function SeoScoreWidget({ callRoute }: SeoScoreWidgetProps) {
  const [scores, setScores] = useState<ScoreItem[]>([]);

  useEffect(() => {
    callRoute("scores/list", { limit: 100 }).then((d: any) => setScores(d.items ?? []));
  }, []);

  if (scores.length === 0) return <div>No scores yet. Analyze content to see scores.</div>;

  const avg = Math.round(scores.reduce((sum, s) => sum + s.data.score, 0) / scores.length);
  const good = scores.filter((s) => s.data.score >= 70).length;
  const fair = scores.filter((s) => s.data.score >= 40 && s.data.score < 70).length;
  const poor = scores.filter((s) => s.data.score < 40).length;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <ScoreBadge score={avg} size={72} />
      <div>
        <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>Site Average</div>
        <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
          <span style={{ color: "#00b894" }}>{good} good</span>
          <span style={{ color: "#e67700" }}>{fair} fair</span>
          <span style={{ color: "#d63031" }}>{poor} poor</span>
        </div>
      </div>
    </div>
  );
}
