import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SeoStatusWidget } from "../../../src/admin/widgets/seo-status.js";
import { apiFetch } from "../../../src/admin/api.js";

vi.mock("../../../src/admin/api.js", () => ({
  apiFetch: vi.fn(),
}));

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

const STATUS_DATA = {
  total: 42,
  missingTitle: 3,
  missingDescription: 7,
  missingOgImage: 5,
  withOverrides: 10,
  withoutOverrides: 32,
};

function mockSuccessResponse(data = STATUS_DATA) {
  mockApiFetch.mockResolvedValue(data);
}

function mockFailingResponse() {
  mockApiFetch.mockRejectedValue(new Error("Network error"));
}

function getBadgeForLabel(container: HTMLElement, label: string): Element {
  const labels = container.querySelectorAll("span");
  for (const span of labels) {
    if (span.textContent === label) {
      const row = span.closest("div")!;
      return row.querySelector(".seo-badge")!;
    }
  }
  throw new Error(`Label "${label}" not found`);
}

describe("SeoStatusWidget", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  it("shows skeleton loading state before data arrives", () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    const { container } = render(<SeoStatusWidget />);

    const skeletons = container.querySelectorAll(".seo-skeleton");
    expect(skeletons.length).toBe(4);
  });

  it("shows error message when API fails", async () => {
    mockFailingResponse();
    render(<SeoStatusWidget />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load status.")).toBeDefined();
    });
  });

  it("renders total content count", async () => {
    mockSuccessResponse();
    render(<SeoStatusWidget />);

    await waitFor(() => {
      expect(screen.getByText("42 content items total")).toBeDefined();
    });
  });

  it("shows Missing title count", async () => {
    mockSuccessResponse();
    const { container } = render(<SeoStatusWidget />);

    await waitFor(() => {
      expect(screen.getByText("42 content items total")).toBeDefined();
    });

    const badge = getBadgeForLabel(container, "Missing title");
    expect(badge.textContent).toBe("3");
  });

  it("shows Missing description count", async () => {
    mockSuccessResponse();
    const { container } = render(<SeoStatusWidget />);

    await waitFor(() => {
      expect(screen.getByText("42 content items total")).toBeDefined();
    });

    const badge = getBadgeForLabel(container, "Missing description");
    expect(badge.textContent).toBe("7");
  });

  it("shows Missing OG image count", async () => {
    mockSuccessResponse();
    const { container } = render(<SeoStatusWidget />);

    await waitFor(() => {
      expect(screen.getByText("42 content items total")).toBeDefined();
    });

    const badge = getBadgeForLabel(container, "Missing OG image");
    expect(badge.textContent).toBe("5");
  });

  it("shows With SEO overrides count", async () => {
    mockSuccessResponse();
    const { container } = render(<SeoStatusWidget />);

    await waitFor(() => {
      expect(screen.getByText("42 content items total")).toBeDefined();
    });

    const badge = getBadgeForLabel(container, "With SEO overrides");
    expect(badge.textContent).toBe("10");
  });

  it("uses error badge class when count > 0 for missing fields", async () => {
    mockSuccessResponse();
    const { container } = render(<SeoStatusWidget />);

    await waitFor(() => {
      expect(screen.getByText("42 content items total")).toBeDefined();
    });

    const titleBadge = getBadgeForLabel(container, "Missing title");
    expect(titleBadge.classList.contains("seo-badge-error")).toBe(true);
    expect(titleBadge.classList.contains("seo-badge-success")).toBe(false);

    const descBadge = getBadgeForLabel(container, "Missing description");
    expect(descBadge.classList.contains("seo-badge-error")).toBe(true);

    const ogBadge = getBadgeForLabel(container, "Missing OG image");
    expect(ogBadge.classList.contains("seo-badge-error")).toBe(true);
  });

  it("uses success badge class when count is 0", async () => {
    mockSuccessResponse({
      ...STATUS_DATA,
      missingTitle: 0,
      missingDescription: 0,
      missingOgImage: 0,
    });
    const { container } = render(<SeoStatusWidget />);

    await waitFor(() => {
      expect(screen.getByText("42 content items total")).toBeDefined();
    });

    const titleBadge = getBadgeForLabel(container, "Missing title");
    expect(titleBadge.classList.contains("seo-badge-success")).toBe(true);
    expect(titleBadge.classList.contains("seo-badge-error")).toBe(false);

    const descBadge = getBadgeForLabel(container, "Missing description");
    expect(descBadge.classList.contains("seo-badge-success")).toBe(true);

    const ogBadge = getBadgeForLabel(container, "Missing OG image");
    expect(ogBadge.classList.contains("seo-badge-success")).toBe(true);
  });

  it("With SEO overrides always uses success badge class", async () => {
    mockSuccessResponse();
    const { container } = render(<SeoStatusWidget />);

    await waitFor(() => {
      expect(screen.getByText("42 content items total")).toBeDefined();
    });

    const badge = getBadgeForLabel(container, "With SEO overrides");
    expect(badge.classList.contains("seo-badge-success")).toBe(true);
    expect(badge.classList.contains("seo-badge-error")).toBe(false);
  });

  it("calls apiFetch('analytics/status') on mount", () => {
    mockSuccessResponse();
    render(<SeoStatusWidget />);

    expect(mockApiFetch).toHaveBeenCalledTimes(1);
    expect(mockApiFetch).toHaveBeenCalledWith("analytics/status");
  });
});
