import React from "react";

interface CharacterCounterProps {
  value: string;
  min: number;
  max: number;
}

export function CharacterCounter({ value, min, max }: CharacterCounterProps) {
  const len = value.length;
  const color = len === 0 ? "#999" : len < min ? "#e67700" : len > max ? "#d63031" : "#00b894";

  return (
    <span style={{ fontSize: 12, color, fontFamily: "monospace" }}>
      {len}/{max}
    </span>
  );
}
