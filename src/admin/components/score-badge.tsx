import React from "react";
import { colors } from "../tokens.js";

interface ScoreBadgeProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

export function ScoreBadge({ score, size = 60, showLabel = false }: ScoreBadgeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = clamped >= 70 ? colors.scoreGood : clamped >= 40 ? colors.scoreFair : colors.scorePoor;
  const label = clamped >= 70 ? "Good" : clamped >= 40 ? "Fair" : "Needs work";
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg
        width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        role="img" aria-label={`SEO score: ${clamped} out of 100`}
      >
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 500ms cubic-bezier(0.34,1.56,0.64,1), stroke 300ms" }}
        />
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="central"
          fontSize={size * 0.3} fontWeight="700" fill={color}
          style={{ transition: "fill 300ms" }}
        >
          {clamped}
        </text>
      </svg>
      {showLabel && (
        <span style={{ fontSize: "0.75rem", fontWeight: 500, color, transition: "color 300ms" }}>
          {label}
        </span>
      )}
    </div>
  );
}
