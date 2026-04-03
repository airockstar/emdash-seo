import { describe, it, expect } from "vitest";
import { calculateScore } from "../../src/analysis/score.js";
import type { SeoCheck } from "../../src/types.js";

describe("calculateScore", () => {
  it("returns 100 for all passing checks", () => {
    const checks: SeoCheck[] = [
      { id: "a", label: "A", status: "pass", message: "", weight: 10 },
      { id: "b", label: "B", status: "pass", message: "", weight: 10 },
    ];
    expect(calculateScore(checks)).toBe(100);
  });

  it("returns 0 for all failing checks", () => {
    const checks: SeoCheck[] = [
      { id: "a", label: "A", status: "fail", message: "", weight: 10 },
      { id: "b", label: "B", status: "fail", message: "", weight: 10 },
    ];
    expect(calculateScore(checks)).toBe(0);
  });

  it("returns 50 for all warnings", () => {
    const checks: SeoCheck[] = [
      { id: "a", label: "A", status: "warn", message: "", weight: 10 },
      { id: "b", label: "B", status: "warn", message: "", weight: 10 },
    ];
    expect(calculateScore(checks)).toBe(50);
  });

  it("weights checks correctly", () => {
    const checks: SeoCheck[] = [
      { id: "a", label: "A", status: "pass", message: "", weight: 30 },
      { id: "b", label: "B", status: "fail", message: "", weight: 10 },
    ];
    // (30*1 + 10*0) / 40 * 100 = 75
    expect(calculateScore(checks)).toBe(75);
  });

  it("returns 0 for empty checks", () => {
    expect(calculateScore([])).toBe(0);
  });

  it("handles mixed statuses", () => {
    const checks: SeoCheck[] = [
      { id: "a", label: "A", status: "pass", message: "", weight: 10 },
      { id: "b", label: "B", status: "warn", message: "", weight: 10 },
      { id: "c", label: "C", status: "fail", message: "", weight: 10 },
    ];
    // (10*1 + 10*0.5 + 10*0) / 30 * 100 = 50
    expect(calculateScore(checks)).toBe(50);
  });
});
