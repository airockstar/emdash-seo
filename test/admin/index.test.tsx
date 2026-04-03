import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { pages, widgets } from "../../src/admin/index.js";
import { globalStyles } from "../../src/admin/styles.js";

// Mock the page/widget components so we don't pull in their full trees
vi.mock("../../src/admin/pages/seo-overrides.js", () => ({
  SeoOverridesPage: (_props: Record<string, unknown>) => (
    <div data-testid="seo-overrides">SeoOverridesPage</div>
  ),
}));
vi.mock("../../src/admin/pages/content-analysis.js", () => ({
  ContentAnalysisPage: (_props: Record<string, unknown>) => (
    <div data-testid="content-analysis">ContentAnalysisPage</div>
  ),
}));
vi.mock("../../src/admin/widgets/seo-status.js", () => ({
  SeoStatusWidget: (_props: Record<string, unknown>) => (
    <div data-testid="seo-status">SeoStatusWidget</div>
  ),
}));
vi.mock("../../src/admin/widgets/seo-score.js", () => ({
  SeoScoreWidget: (_props: Record<string, unknown>) => (
    <div data-testid="seo-score">SeoScoreWidget</div>
  ),
}));

const mockCallRoute = vi.fn(() => Promise.resolve({ ok: true }));
const defaultProps = { callRoute: mockCallRoute as any, siteUrl: "https://example.com" };

describe("admin entry point — pages export", () => {
  it("contains 'seo-overrides' key", () => {
    expect(pages).toHaveProperty("seo-overrides");
    expect(typeof pages["seo-overrides"]).toBe("function");
  });

  it("contains 'content-analysis' key", () => {
    expect(pages).toHaveProperty("content-analysis");
    expect(typeof pages["content-analysis"]).toBe("function");
  });
});

describe("admin entry point — widgets export", () => {
  it("contains 'seo-status' key", () => {
    expect(widgets).toHaveProperty("seo-status");
    expect(typeof widgets["seo-status"]).toBe("function");
  });

  it("contains 'seo-score' key", () => {
    expect(widgets).toHaveProperty("seo-score");
    expect(typeof widgets["seo-score"]).toBe("function");
  });
});

describe("withStyles — style injection", () => {
  beforeEach(() => {
    // Remove any previously injected style elements
    document.head.querySelectorAll("style[data-seo-plugin]").forEach((el) => el.remove());
    // Reset the module-level styleRef by re-importing fresh module
    vi.resetModules();
  });

  async function loadFreshModule() {
    const mod = await import("../../src/admin/index.js");
    return mod;
  }

  it("injects a <style> element into document.head", async () => {
    const { pages: freshPages } = await loadFreshModule();
    const Page = freshPages["seo-overrides"];
    render(<Page {...defaultProps} />);

    const styleEl = document.head.querySelector("style[data-seo-plugin]");
    expect(styleEl).not.toBeNull();
  });

  it("style element has data-seo-plugin attribute", async () => {
    const { pages: freshPages } = await loadFreshModule();
    const Page = freshPages["seo-overrides"];
    render(<Page {...defaultProps} />);

    const styleEl = document.head.querySelector("style[data-seo-plugin]");
    expect(styleEl).not.toBeNull();
    expect(styleEl!.hasAttribute("data-seo-plugin")).toBe(true);
  });

  it("injects the style only once even with multiple wrapped components", async () => {
    const { pages: freshPages, widgets: freshWidgets } = await loadFreshModule();
    const PageA = freshPages["seo-overrides"];
    const PageB = freshPages["content-analysis"];
    const WidgetA = freshWidgets["seo-status"];

    render(
      <div>
        <PageA {...defaultProps} />
        <PageB {...defaultProps} />
        <WidgetA {...defaultProps} />
      </div>,
    );

    const styles = document.head.querySelectorAll("style[data-seo-plugin]");
    expect(styles.length).toBe(1);
  });

  it("wrapped components still render their content", async () => {
    const { pages: freshPages, widgets: freshWidgets } = await loadFreshModule();
    const Page = freshPages["seo-overrides"];
    const Widget = freshWidgets["seo-score"];

    const { container } = render(
      <div>
        <Page {...defaultProps} />
        <Widget {...defaultProps} />
      </div>,
    );

    expect(container.querySelector("[data-testid='seo-overrides']")).not.toBeNull();
    expect(container.textContent).toContain("SeoOverridesPage");
    expect(container.querySelector("[data-testid='seo-score']")).not.toBeNull();
    expect(container.textContent).toContain("SeoScoreWidget");
  });
});

describe("globalStyles", () => {
  it("contains .seo-input class", () => {
    expect(globalStyles).toContain(".seo-input");
  });

  it("contains .seo-btn class", () => {
    expect(globalStyles).toContain(".seo-btn");
  });

  it("contains .seo-table class", () => {
    expect(globalStyles).toContain(".seo-table");
  });

  it("contains .seo-card class", () => {
    expect(globalStyles).toContain(".seo-card");
  });

  it("contains .seo-empty class", () => {
    expect(globalStyles).toContain(".seo-empty");
  });

  it("contains .seo-badge class", () => {
    expect(globalStyles).toContain(".seo-badge");
  });

  it("uses the accent color token #6366f1", () => {
    expect(globalStyles).toContain("#6366f1");
  });
});
