import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SeoStatusWidget } from "../../../src/admin/widgets/seo-status.js";


const STATUS_DATA = {
  total: 42,
  missingTitle: 3,
  missingDescription: 7,
  missingOgImage: 5,
  withOverrides: 10,
  withoutOverrides: 32,
};

function createCallRoute(data = STATUS_DATA) {
  return vi.fn().mockResolvedValue(data);
}

function createFailingCallRoute() {
  return vi.fn().mockRejectedValue(new Error("Network error"));
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
  it("shows skeleton loading state before data arrives", () => {
    const callRoute = vi.fn().mockReturnValue(new Promise(() => {}));
    const { container } = render(<SeoStatusWidget callRoute={callRoute} />);

    const skeletons = container.querySelectorAll(".seo-skeleton");
    expect(skeletons.length).toBe(4);
  });

  it("shows error message when API fails", async () => {
    const callRoute = createFailingCallRoute();
    render(<SeoStatusWidget callRoute={callRoute} />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load status.")).toBeDefined();
    });
  });

  it("renders total content count", async () => {
    const callRoute = createCallRoute();
    render(<SeoStatusWidget callRoute={callRoute} />);

    await waitFor(() => {
      expect(screen.getByText("42 content items total")).toBeDefined();
    });
  });

  it("shows Missing title count", async () => {
    const callRoute = createCallRoute();
    const { container } = render(<SeoStatusWidget callRoute={callRoute} />);

    await waitFor(() => {
      expect(screen.getByText("42 content items total")).toBeDefined();
    });

    const badge = getBadgeForLabel(container, "Missing title");
    expect(badge.textContent).toBe("3");
  });

  it("shows Missing description count", async () => {
    const callRoute = createCallRoute();
    const { container } = render(<SeoStatusWidget callRoute={callRoute} />);

    await waitFor(() => {
      expect(screen.getByText("42 content items total")).toBeDefined();
    });

    const badge = getBadgeForLabel(container, "Missing description");
    expect(badge.textContent).toBe("7");
  });

  it("shows Missing OG image count", async () => {
    const callRoute = createCallRoute();
    const { container } = render(<SeoStatusWidget callRoute={callRoute} />);

    await waitFor(() => {
      expect(screen.getByText("42 content items total")).toBeDefined();
    });

    const badge = getBadgeForLabel(container, "Missing OG image");
    expect(badge.textContent).toBe("5");
  });

  it("shows With SEO overrides count", async () => {
    const callRoute = createCallRoute();
    const { container } = render(<SeoStatusWidget callRoute={callRoute} />);

    await waitFor(() => {
      expect(screen.getByText("42 content items total")).toBeDefined();
    });

    const badge = getBadgeForLabel(container, "With SEO overrides");
    expect(badge.textContent).toBe("10");
  });

  it("uses error badge class when count > 0 for missing fields", async () => {
    const callRoute = createCallRoute();
    const { container } = render(<SeoStatusWidget callRoute={callRoute} />);

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
    const callRoute = createCallRoute({
      ...STATUS_DATA,
      missingTitle: 0,
      missingDescription: 0,
      missingOgImage: 0,
    });
    const { container } = render(<SeoStatusWidget callRoute={callRoute} />);

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
    const callRoute = createCallRoute();
    const { container } = render(<SeoStatusWidget callRoute={callRoute} />);

    await waitFor(() => {
      expect(screen.getByText("42 content items total")).toBeDefined();
    });

    const badge = getBadgeForLabel(container, "With SEO overrides");
    expect(badge.classList.contains("seo-badge-success")).toBe(true);
    expect(badge.classList.contains("seo-badge-error")).toBe(false);
  });

  it("calls callRoute('analytics/status') on mount", () => {
    const callRoute = createCallRoute();
    render(<SeoStatusWidget callRoute={callRoute} />);

    expect(callRoute).toHaveBeenCalledTimes(1);
    expect(callRoute).toHaveBeenCalledWith("analytics/status");
  });
});
