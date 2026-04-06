import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { pages, widgets, fields } from "../../src/admin/index.js";

// Mock apiFetch so components don't actually call the API
vi.mock("../../src/admin/api.js", () => ({
  apiFetch: vi.fn(() => Promise.resolve(new Response(JSON.stringify({ items: [] })))),
}));

// Mock the page/widget components so we don't pull in their full trees
vi.mock("../../src/admin/pages/seo-overrides.js", () => ({
  SeoOverridesPage: () => (
    <div data-testid="seo-overrides">SeoOverridesPage</div>
  ),
}));
vi.mock("../../src/admin/pages/content-analysis.js", () => ({
  ContentAnalysisPage: () => (
    <div data-testid="content-analysis">ContentAnalysisPage</div>
  ),
}));
vi.mock("../../src/admin/pages/redirects.js", () => ({
  RedirectsPage: () => (
    <div data-testid="redirects">RedirectsPage</div>
  ),
}));
vi.mock("../../src/admin/widgets/seo-status.js", () => ({
  SeoStatusWidget: () => (
    <div data-testid="seo-status">SeoStatusWidget</div>
  ),
}));
vi.mock("../../src/admin/widgets/seo-score.js", () => ({
  SeoScoreWidget: () => (
    <div data-testid="seo-score">SeoScoreWidget</div>
  ),
}));
vi.mock("../../src/admin/widgets/seo-fields.js", () => ({
  SeoFieldsWidget: () => (
    <div data-testid="seo-fields">SeoFieldsWidget</div>
  ),
}));

describe("admin entry point — pages export", () => {
  it("contains '/' key for SEO Overrides", () => {
    expect(pages).toHaveProperty("/");
    expect(typeof pages["/"]).toBe("function");
  });

  it("contains '/analysis' key", () => {
    expect(pages).toHaveProperty("/analysis");
    expect(typeof pages["/analysis"]).toBe("function");
  });

  it("contains '/redirects' key", () => {
    expect(pages).toHaveProperty("/redirects");
    expect(typeof pages["/redirects"]).toBe("function");
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

describe("admin entry point — fields export", () => {
  it("contains 'seo-fields' key", () => {
    expect(fields).toHaveProperty("seo-fields");
    expect(typeof fields["seo-fields"]).toBe("function");
  });
});

describe("page components render", () => {
  it("renders SEO Overrides page", () => {
    const Page = pages["/"];
    const { container } = render(<Page />);
    expect(container.querySelector("[data-testid='seo-overrides']")).not.toBeNull();
  });

  it("renders Content Analysis page", () => {
    const Page = pages["/analysis"];
    const { container } = render(<Page />);
    expect(container.querySelector("[data-testid='content-analysis']")).not.toBeNull();
  });

  it("renders Redirects page", () => {
    const Page = pages["/redirects"];
    const { container } = render(<Page />);
    expect(container.querySelector("[data-testid='redirects']")).not.toBeNull();
  });
});

describe("widget components render", () => {
  it("renders SEO Status widget", () => {
    const Widget = widgets["seo-status"];
    const { container } = render(<Widget />);
    expect(container.querySelector("[data-testid='seo-status']")).not.toBeNull();
  });

  it("renders SEO Score widget", () => {
    const Widget = widgets["seo-score"];
    const { container } = render(<Widget />);
    expect(container.querySelector("[data-testid='seo-score']")).not.toBeNull();
  });
});
