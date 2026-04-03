import type { SeoCheck } from "../types.js";

const STATUS_MULTIPLIER: Record<SeoCheck["status"], number> = {
  pass: 1.0,
  warn: 0.5,
  fail: 0.0,
};

export function calculateScore(checks: SeoCheck[]): number {
  if (checks.length === 0) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const check of checks) {
    weightedSum += check.weight * STATUS_MULTIPLIER[check.status];
    totalWeight += check.weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round((weightedSum / totalWeight) * 100);
}
