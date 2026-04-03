import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ScoreBadge } from "../../../src/admin/components/score-badge.js";
import { colors } from "../../../src/admin/tokens.js";

describe("ScoreBadge", () => {

  // --- Score rendering ---

  it("renders score number inside SVG", () => {
    render(<ScoreBadge score={75} />);
    const svg = screen.getByRole("img");
    expect(svg.querySelector("text")?.textContent).toBe("75");
  });

  it("clamps score to 0 when negative", () => {
    render(<ScoreBadge score={-10} />);
    const svg = screen.getByRole("img");
    expect(svg.querySelector("text")?.textContent).toBe("0");
    expect(svg.getAttribute("aria-label")).toBe("SEO score: 0 out of 100");
  });

  it("clamps score to 100 when over 100", () => {
    render(<ScoreBadge score={150} />);
    const svg = screen.getByRole("img");
    expect(svg.querySelector("text")?.textContent).toBe("100");
    expect(svg.getAttribute("aria-label")).toBe("SEO score: 100 out of 100");
  });

  // --- Color thresholds ---

  it("shows green color for score >= 70", () => {
    render(<ScoreBadge score={70} />);
    const svg = screen.getByRole("img");
    const progressCircle = svg.querySelectorAll("circle")[1];
    expect(progressCircle.getAttribute("stroke")).toBe(colors.scoreGood);

    const text = svg.querySelector("text");
    expect(text?.getAttribute("fill")).toBe(colors.scoreGood);
  });

  it("shows yellow/amber color for score 40-69", () => {
    render(<ScoreBadge score={55} />);
    const svg = screen.getByRole("img");
    const progressCircle = svg.querySelectorAll("circle")[1];
    expect(progressCircle.getAttribute("stroke")).toBe(colors.scoreFair);

    const text = svg.querySelector("text");
    expect(text?.getAttribute("fill")).toBe(colors.scoreFair);
  });

  it("shows red color for score < 40", () => {
    render(<ScoreBadge score={20} />);
    const svg = screen.getByRole("img");
    const progressCircle = svg.querySelectorAll("circle")[1];
    expect(progressCircle.getAttribute("stroke")).toBe(colors.scorePoor);

    const text = svg.querySelector("text");
    expect(text?.getAttribute("fill")).toBe(colors.scorePoor);
  });

  it("uses scoreFair at boundary 40", () => {
    render(<ScoreBadge score={40} />);
    const svg = screen.getByRole("img");
    const progressCircle = svg.querySelectorAll("circle")[1];
    expect(progressCircle.getAttribute("stroke")).toBe(colors.scoreFair);
  });

  it("uses scorePoor at boundary 39", () => {
    render(<ScoreBadge score={39} />);
    const svg = screen.getByRole("img");
    const progressCircle = svg.querySelectorAll("circle")[1];
    expect(progressCircle.getAttribute("stroke")).toBe(colors.scorePoor);
  });

  it("uses scoreGood at boundary 69 vs 70", () => {
    const { unmount } = render(<ScoreBadge score={69} />);
    let svg = screen.getByRole("img");
    expect(svg.querySelectorAll("circle")[1].getAttribute("stroke")).toBe(colors.scoreFair);
    unmount();

    render(<ScoreBadge score={70} />);
    svg = screen.getByRole("img");
    expect(svg.querySelectorAll("circle")[1].getAttribute("stroke")).toBe(colors.scoreGood);
  });

  // --- Accessibility ---

  it("has role='img' on SVG", () => {
    render(<ScoreBadge score={50} />);
    expect(screen.getByRole("img")).toBeTruthy();
  });

  it("has aria-label with score text", () => {
    render(<ScoreBadge score={82} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe(
      "SEO score: 82 out of 100",
    );
  });

  it("uses clamped score in aria-label for out-of-range values", () => {
    render(<ScoreBadge score={-5} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe(
      "SEO score: 0 out of 100",
    );
  });

  // --- Label ---

  it("shows label text when showLabel=true", () => {
    render(<ScoreBadge score={80} showLabel />);
    expect(screen.getByText("Good")).toBeTruthy();
  });

  it("shows 'Fair' label for mid-range score", () => {
    render(<ScoreBadge score={50} showLabel />);
    expect(screen.getByText("Fair")).toBeTruthy();
  });

  it("shows 'Needs work' label for low score", () => {
    render(<ScoreBadge score={20} showLabel />);
    expect(screen.getByText("Needs work")).toBeTruthy();
  });

  it("hides label when showLabel=false (default)", () => {
    render(<ScoreBadge score={80} />);
    expect(screen.queryByText("Good")).toBeNull();
    expect(screen.queryByText("Fair")).toBeNull();
    expect(screen.queryByText("Needs work")).toBeNull();
  });

  // --- Size prop ---

  it("respects custom size prop", () => {
    render(<ScoreBadge score={50} size={100} />);
    const svg = screen.getByRole("img");
    expect(svg.getAttribute("width")).toBe("100");
    expect(svg.getAttribute("height")).toBe("100");
    expect(svg.getAttribute("viewBox")).toBe("0 0 100 100");
  });

  it("uses default size of 60", () => {
    render(<ScoreBadge score={50} />);
    const svg = screen.getByRole("img");
    expect(svg.getAttribute("width")).toBe("60");
    expect(svg.getAttribute("height")).toBe("60");
  });

  // --- Ring geometry ---

  it("score 0 shows empty ring (offset equals circumference)", () => {
    const size = 60;
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;

    render(<ScoreBadge score={0} />);
    const svg = screen.getByRole("img");
    const progressCircle = svg.querySelectorAll("circle")[1];

    expect(progressCircle.getAttribute("stroke-dasharray")).toBe(String(circumference));
    expect(progressCircle.getAttribute("stroke-dashoffset")).toBe(String(circumference));
  });

  it("score 100 shows full ring (offset is 0)", () => {
    const size = 60;
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;

    render(<ScoreBadge score={100} />);
    const svg = screen.getByRole("img");
    const progressCircle = svg.querySelectorAll("circle")[1];

    expect(progressCircle.getAttribute("stroke-dasharray")).toBe(String(circumference));
    expect(progressCircle.getAttribute("stroke-dashoffset")).toBe("0");
  });

  it("score 50 shows half ring", () => {
    const size = 60;
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const expectedOffset = circumference - (50 / 100) * circumference;

    render(<ScoreBadge score={50} />);
    const svg = screen.getByRole("img");
    const progressCircle = svg.querySelectorAll("circle")[1];

    expect(progressCircle.getAttribute("stroke-dashoffset")).toBe(String(expectedOffset));
  });

  it("background circle uses bgTertiary color", () => {
    render(<ScoreBadge score={50} />);
    const svg = screen.getByRole("img");
    const bgCircle = svg.querySelectorAll("circle")[0];
    expect(bgCircle.getAttribute("stroke")).toBe(colors.bgTertiary);
  });
});
