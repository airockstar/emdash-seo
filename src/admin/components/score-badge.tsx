import React from "react";

interface ScoreBadgeProps {
  score: number;
  size?: number;
}

export function ScoreBadge({ score, size = 60 }: ScoreBadgeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = clamped >= 70 ? "#00b894" : clamped >= 40 ? "#e67700" : "#d63031";
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`SEO score: ${clamped} out of 100`}>
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="#e0e0e0" strokeWidth={4}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle" dominantBaseline="central"
        fontSize={size * 0.3} fontWeight="bold" fill={color}
      >
        {clamped}
      </text>
    </svg>
  );
}
