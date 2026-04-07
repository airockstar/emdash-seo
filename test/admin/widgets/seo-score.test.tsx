import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SeoScoreWidget } from "../../../src/admin/widgets/seo-score.js";
import { apiFetch } from "../../../src/admin/api.js";

vi.mock("../../../src/admin/api.js", () => ({
  apiFetch: vi.fn(),
}));

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

function makeScores(scores: number[]) {
  return scores.map((score, i) => ({
    id: `item-${i}`,
    data: { score, collection: "pages" },
  }));
}

describe("SeoScoreWidget", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  // 1. Shows skeleton loading state initially
  it("shows skeleton loading state initially", () => {
    mockApiFetch.mockReturnValue(new Promise(() => {})); // never resolves
    const { container } = render(<SeoScoreWidget />);

    const skeletons = container.querySelectorAll(".seo-skeleton");
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  // 2. Shows error message when API fails
  it("shows error message when API fails", async () => {
    mockApiFetch.mockRejectedValue(new Error("network"));
    render(<SeoScoreWidget />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load scores.")).toBeDefined();
    });
  });

  // 3. Shows empty state when no scores
  it("shows empty state when no scores", async () => {
    mockApiFetch.mockResolvedValue(({ items: [] }));
    render(<SeoScoreWidget />);

    await waitFor(() => {
      expect(screen.getByText("No scores yet")).toBeDefined();
      expect(
        screen.getByText("Analyze content to see site-wide SEO scores.")
      ).toBeDefined();
    });
  });

  // 4. Renders ScoreBadge with average score
  it("renders ScoreBadge with average score", async () => {
    mockApiFetch.mockResolvedValue(({ items: makeScores([80, 60, 40]) }));
    render(<SeoScoreWidget />);

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
    mockApiFetch.mockResolvedValue(({ items: makeScores([90, 50]) }));
    render(<SeoScoreWidget />);

    await waitFor(() => {
      expect(screen.getByText("Site Average (2 pages)")).toBeDefined();
    });
  });

  // 6. Shows good/fair/poor distribution counts
  it("shows good/fair/poor distribution counts", async () => {
    // 80 >= 70 => good, 55 >= 40 => fair, 20 < 40 => poor
    mockApiFetch.mockResolvedValue(({ items: makeScores([80, 55, 20]) }));
    render(<SeoScoreWidget />);

    await waitFor(() => {
      expect(screen.getByText("1 good")).toBeDefined();
      expect(screen.getByText("1 fair")).toBeDefined();
      expect(screen.getByText("1 poor")).toBeDefined();
    });
  });

  // 7. Calculates average correctly (e.g., [80, 60, 40] = 60)
  it("calculates average correctly", async () => {
    mockApiFetch.mockResolvedValue(({ items: makeScores([80, 60, 40]) }));
    render(<SeoScoreWidget />);

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
    mockApiFetch.mockResolvedValue(({ items: makeScores([70, 69, 40, 39]) }));
    render(<SeoScoreWidget />);

    await waitFor(() => {
      expect(screen.getByText("1 good")).toBeDefined();
      expect(screen.getByText("2 fair")).toBeDefined();
      expect(screen.getByText("1 poor")).toBeDefined();
    });
  });

  // 9. Calls apiFetch("scores/list", { limit: 100 }) on mount
  it('calls apiFetch("scores/list", { limit: 100 }) on mount', async () => {
    mockApiFetch.mockResolvedValue(({ items: [] }));
    render(<SeoScoreWidget />);

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledTimes(1);
      expect(mockApiFetch).toHaveBeenCalledWith("scores/list", { limit: 100 });
    });
  });

  // 10. Uses correct badge classes for good/fair/poor
  it("uses correct badge classes for good/fair/poor", async () => {
    mockApiFetch.mockResolvedValue(({ items: makeScores([90, 50, 10]) }));
    render(<SeoScoreWidget />);

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
