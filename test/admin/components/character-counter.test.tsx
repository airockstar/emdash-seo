import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CharacterCounter } from "../../../src/admin/components/character-counter.js";

/**
 * Convert hex color to the rgb() format that jsdom uses in computed styles.
 */
function hexToRgb(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

// Token values from src/admin/tokens.ts — kept as hex for readability.
const TOKEN = {
  textTertiary: "#9ca3af",
  warningText: "#92400e",
  successText: "#065f46",
  errorText: "#991b1b",
};

describe("CharacterCounter", () => {
  const defaults = { min: 30, max: 60 };

  // 1. Shows count/max format
  it("displays count/max format (e.g. 5/60)", () => {
    render(<CharacterCounter value="hello" {...defaults} />);
    expect(screen.getByText("5/60")).toBeDefined();
  });

  // 2. Shows "empty" state when value is ""
  it('shows empty state styling when value is ""', () => {
    render(<CharacterCounter value="" {...defaults} />);
    const counter = screen.getByText("0/60");
    expect(counter.style.color).toBe(hexToRgb(TOKEN.textTertiary));
  });

  // 3. Shows "short" warning color when below min
  it("shows warning color when below min", () => {
    render(<CharacterCounter value="short" {...defaults} />);
    const counter = screen.getByText("5/60");
    expect(counter.style.color).toBe(hexToRgb(TOKEN.warningText));
  });

  // 4. Shows "good" success color when in optimal range
  it("shows success color when in optimal range", () => {
    const value = "a".repeat(45);
    render(<CharacterCounter value={value} {...defaults} />);
    const counter = screen.getByText("45/60");
    expect(counter.style.color).toBe(hexToRgb(TOKEN.successText));
  });

  // 5. Shows "over" error color when above max
  it("shows error color when above max", () => {
    const value = "a".repeat(65);
    render(<CharacterCounter value={value} {...defaults} />);
    const counter = screen.getByText("65/60");
    expect(counter.style.color).toBe(hexToRgb(TOKEN.errorText));
  });

  // 6. Progress bar width reflects percentage
  it("progress bar width reflects percentage", () => {
    render(<CharacterCounter value={"a".repeat(30)} {...defaults} />);
    const status = screen.getByRole("status");
    // Structure: status > track(span) > bar(span)
    const track = status.querySelector("span > span") as HTMLElement;
    const bar = track.querySelector("span") as HTMLElement;
    expect(bar.style.width).toBe("50%"); // 30/60 = 50%
  });

  // 7. Progress bar width caps at 100%
  it("progress bar width caps at 100%", () => {
    render(<CharacterCounter value={"a".repeat(120)} {...defaults} />);
    const status = screen.getByRole("status");
    const track = status.querySelector("span > span") as HTMLElement;
    const bar = track.querySelector("span") as HTMLElement;
    expect(bar.style.width).toBe("100%");
  });

  // 8. Has role="status" for screen reader announcements
  it('has role="status" for screen reader announcements', () => {
    render(<CharacterCounter value="test" {...defaults} />);
    expect(screen.getByRole("status")).toBeDefined();
  });

  // 9. Has aria-label when fieldName is provided
  it("has aria-label when fieldName is provided", () => {
    render(
      <CharacterCounter value="test" {...defaults} fieldName="Meta title" />,
    );
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-label")).toBe(
      "Meta title: 4 of 60 characters, Too short",
    );
  });

  it("has no aria-label when fieldName is omitted", () => {
    render(<CharacterCounter value="test" {...defaults} />);
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-label")).toBeNull();
  });

  // 10. Updates correctly when value changes
  it("updates correctly when value changes", () => {
    const { rerender } = render(
      <CharacterCounter value="short" {...defaults} />,
    );
    expect(screen.getByText("5/60")).toBeDefined();
    expect(screen.getByText("5/60").style.color).toBe(
      hexToRgb(TOKEN.warningText),
    );

    const goodValue = "a".repeat(45);
    rerender(<CharacterCounter value={goodValue} {...defaults} />);
    expect(screen.getByText("45/60")).toBeDefined();
    expect(screen.getByText("45/60").style.color).toBe(
      hexToRgb(TOKEN.successText),
    );
  });

  // Boundary: exactly at min
  it("shows good at exactly min length", () => {
    const value = "a".repeat(30);
    render(<CharacterCounter value={value} {...defaults} />);
    expect(screen.getByText("30/60").style.color).toBe(
      hexToRgb(TOKEN.successText),
    );
  });

  // Boundary: exactly at max
  it("shows good at exactly max length", () => {
    const value = "a".repeat(60);
    render(<CharacterCounter value={value} {...defaults} />);
    expect(screen.getByText("60/60").style.color).toBe(
      hexToRgb(TOKEN.successText),
    );
  });

  // aria-label reflects good state
  it("aria-label reflects good state", () => {
    const value = "a".repeat(45);
    render(
      <CharacterCounter value={value} {...defaults} fieldName="Description" />,
    );
    expect(screen.getByRole("status").getAttribute("aria-label")).toBe(
      "Description: 45 of 60 characters, Good",
    );
  });

  // aria-label reflects over state
  it("aria-label reflects over state", () => {
    const value = "a".repeat(65);
    render(
      <CharacterCounter value={value} {...defaults} fieldName="Title" />,
    );
    expect(screen.getByRole("status").getAttribute("aria-label")).toBe(
      "Title: 65 of 60 characters, Too long",
    );
  });
});
