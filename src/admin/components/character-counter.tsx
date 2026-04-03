import React from "react";
import { colors } from "../tokens.js";

interface CharacterCounterProps {
  value: string;
  min: number;
  max: number;
  fieldName?: string;
}

export function CharacterCounter({ value, min, max, fieldName }: CharacterCounterProps) {
  const len = value.length;
  const pct = Math.min((len / max) * 100, 100);

  const state = len === 0 ? "empty" : len < min ? "short" : len > max ? "over" : "good";

  const cfg = {
    empty: { color: colors.textTertiary, bar: colors.borderDefault, label: "Empty" },
    short: { color: colors.warningText, bar: colors.warning, label: "Too short" },
    good: { color: colors.successText, bar: colors.success, label: "Good" },
    over: { color: colors.errorText, bar: colors.error, label: "Too long" },
  }[state];

  return (
    <span
      role="status"
      aria-label={fieldName ? `${fieldName}: ${len} of ${max} characters, ${cfg.label}` : undefined}
      style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem" }}
    >
      <span style={{
        width: 48, height: 3, borderRadius: 2, background: colors.borderDefault, overflow: "hidden",
      }}>
        <span style={{
          display: "block", height: "100%", width: `${pct}%`, background: cfg.bar,
          borderRadius: 2, transition: "width 150ms, background 150ms",
        }} />
      </span>
      <span style={{ color: cfg.color, fontVariantNumeric: "tabular-nums" }}>
        {len}/{max}
      </span>
    </span>
  );
}
