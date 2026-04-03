import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SeoScoreWidget } from "../../../src/admin/widgets/seo-score.js";


function makeScores(scores: number[]) {
  return scores.map((score, i) => ({
    id: `item-${i}`,
    data: { score, collection: "pages" },
  }));
}

describe("SeoScoreWidget", () => {
  // 1. Shows skeleton loading state initially
  it("shows skeleton loading state initially", () => {
    const callRoute = vi.fn(() => new Promise(() => {})); // never resolves
    const { container } = render(<SeoScoreWidget callRoute={callRoute} />);

    const skeletons = container.querySelectorAll(".seo-skeleton");
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  // 2. Shows error message when API fails
  it("shows error message when API fails", async () => {
    const callRoute = vi.fn(() => Promise.reject(new Error("network")));
    render(<SeoScoreWidget callRoute={callRoute} />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load scores.")).toBeDefined();
    });
  });

  // 3. Shows empty state when no scores
  it("shows empty state when no scores", async () => {
    const callRoute = vi.fn(() => Promise.resolve({ items: [] }));
    render(<SeoScoreWidget callRoute={callRoute} />);

    await waitFor(() => {
      expect(screen.getByText("No scores yet")).toBeDefined();
      expect(
        screen.getByText("Analyze content to see site-wide SEO scores.")
      ).toBeDefined();
    });
  });

  // 4. Renders ScoreBadge with average score
  it("renders ScoreBadge with average score", async () => {
    const callRoute = vi.fn(() =>
      Promise.resolve({ items: makeScores([80, 60, 40]) })
    );
    render(<SeoScoreWidget callRoute={callRoute} />);

    await waitFor(() => {
      // ScoreBadge renders an SVG with role="img" and aria-label
      const badge = screen.getByRole("img", {
        name: "SEO score: 60 out of 100",
      });
      expect(badge).toBeDefined();
    });
  });

  // 5. Shows "Site Average" with page count
  it('shows "Site Average" with page count', async () => {
    const callRoute = vi.fn(() =>
      Promise.resolve({ items: makeScores([90, 50]) })
    );
    render(<SeoScoreWidget callRoute={callRoute} />);

    await waitFor(() => {
      expect(screen.getByText("Site Average (2 pages)")).toBeDefined();
    });
  });

  // 6. Shows good/fair/poor distribution counts
  it("shows good/fair/poor distribution counts", async () => {
    // 80 >= 70 => good, 55 >= 40 => fair, 20 < 40 => poor
    const callRoute = vi.fn(() =>
      Promise.resolve({ items: makeScores([80, 55, 20]) })
    );
    render(<SeoScoreWidget callRoute={callRoute} />);

    await waitFor(() => {
      expect(screen.getByText("1 good")).toBeDefined();
      expect(screen.getByText("1 fair")).toBeDefined();
      expect(screen.getByText("1 poor")).toBeDefined();
    });
  });

  // 7. Calculates average correctly (e.g., [80, 60, 40] = 60)
  it("calculates average correctly", async () => {
    const callRoute = vi.fn(() =>
      Promise.resolve({ items: makeScores([80, 60, 40]) })
    );
    render(<SeoScoreWidget callRoute={callRoute} />);

    await waitFor(() => {
      // The ScoreBadge SVG text element shows the numeric score
      const badge = screen.getByRole("img", {
        name: "SEO score: 60 out of 100",
      });
      expect(badge).toBeDefined();
    });
  });

  // 8. Counts categories correctly (good >= 70, fair 40-69, poor < 40)
  it("counts categories correctly with boundary values", async () => {
    // 70 => good (boundary), 69 => fair (boundary), 40 => fair (boundary), 39 => poor (boundary)
    const callRoute = vi.fn(() =>
      Promise.resolve({ items: makeScores([70, 69, 40, 39]) })
    );
    render(<SeoScoreWidget callRoute={callRoute} />);

    await waitFor(() => {
      expect(screen.getByText("1 good")).toBeDefined();
      expect(screen.getByText("2 fair")).toBeDefined();
      expect(screen.getByText("1 poor")).toBeDefined();
    });
  });

  // 9. Calls callRoute("scores/list", { limit: 100 }) on mount
  it('calls callRoute("scores/list", { limit: 100 }) on mount', async () => {
    const callRoute = vi.fn(() => Promise.resolve({ items: [] }));
    render(<SeoScoreWidget callRoute={callRoute} />);

    await waitFor(() => {
      expect(callRoute).toHaveBeenCalledTimes(1);
      expect(callRoute).toHaveBeenCalledWith("scores/list", { limit: 100 });
    });
  });

  // 10. Uses correct badge classes for good/fair/poor
  it("uses correct badge classes for good/fair/poor", async () => {
    const callRoute = vi.fn(() =>
      Promise.resolve({ items: makeScores([90, 50, 10]) })
    );
    render(<SeoScoreWidget callRoute={callRoute} />);

    await waitFor(() => {
      const good = screen.getByText("1 good");
      expect(good.className).toContain("seo-badge");
      expect(good.className).toContain("seo-badge-success");

      const fair = screen.getByText("1 fair");
      expect(fair.className).toContain("seo-badge");
      expect(fair.className).toContain("seo-badge-warning");

      const poor = screen.getByText("1 poor");
      expect(poor.className).toContain("seo-badge");
      expect(poor.className).toContain("seo-badge-error");
    });
  });
});
