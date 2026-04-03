import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SerpPreview } from "../../../src/admin/components/serp-preview.js";

describe("SerpPreview", () => {

  const defaults = {
    title: "Example Page Title",
    url: "https://example.com/blog/my-post",
    description: "This is a short meta description for the page.",
  };

  // 1. Renders title, URL, and description
  it("renders the provided title, URL, and description", () => {
    render(<SerpPreview {...defaults} />);

    expect(screen.getByText(defaults.title)).toBeDefined();
    expect(screen.getByText(defaults.description)).toBeDefined();
    expect(screen.getByText("example.com › blog › my-post")).toBeDefined();
  });

  // 2. Truncates title at 60 chars with "..."
  it("truncates title longer than 60 characters", () => {
    const longTitle = "A".repeat(65);
    render(<SerpPreview {...defaults} title={longTitle} />);

    const expected = "A".repeat(57) + "...";
    expect(screen.getByText(expected)).toBeDefined();
    expect(screen.queryByText(longTitle)).toBeNull();
  });

  // 3. Truncates description at 160 chars with "..."
  it("truncates description longer than 160 characters", () => {
    const longDesc = "B".repeat(170);
    render(<SerpPreview {...defaults} description={longDesc} />);

    const expected = "B".repeat(157) + "...";
    expect(screen.getByText(expected)).toBeDefined();
    expect(screen.queryByText(longDesc)).toBeNull();
  });

  // 4. Shows placeholder text when title is empty
  it("shows placeholder when title is empty", () => {
    render(<SerpPreview {...defaults} title="" />);

    expect(screen.getByText("Add a page title...")).toBeDefined();
  });

  // 5. Shows placeholder text when description is empty
  it("shows placeholder when description is empty", () => {
    render(<SerpPreview {...defaults} description="" />);

    expect(
      screen.getByText(
        "Add a meta description to control how this page appears in search results."
      )
    ).toBeDefined();
  });

  // 6. Parses URL into hostname + breadcrumb format
  it("parses URL into hostname and breadcrumb path segments", () => {
    render(
      <SerpPreview
        {...defaults}
        url="https://www.example.com/docs/getting-started/install"
      />
    );

    expect(
      screen.getByText("www.example.com › docs › getting-started › install")
    ).toBeDefined();
  });

  it("shows only hostname when URL path is /", () => {
    render(<SerpPreview {...defaults} url="https://example.com/" />);

    expect(screen.getByText("example.com")).toBeDefined();
  });

  // 7. Handles invalid URLs gracefully (falls back to raw string)
  it("falls back to raw string for invalid URLs", () => {
    render(<SerpPreview {...defaults} url="not-a-valid-url" />);

    expect(screen.getByText("not-a-valid-url")).toBeDefined();
  });

  // 8. Has role="img" and aria-label for accessibility
  it("has role='img' and an aria-label for accessibility", () => {
    render(<SerpPreview {...defaults} />);

    const el = screen.getByRole("img", {
      name: "Google search result preview",
    });
    expect(el).toBeDefined();
  });

  // 9. Renders the favicon placeholder circle
  it("renders the favicon placeholder circle", () => {
    const { container } = render(<SerpPreview {...defaults} />);

    const circle = container.querySelector(
      'span[style*="border-radius: 50%"]'
    );
    expect(circle).not.toBeNull();
    expect((circle as HTMLElement).style.width).toBe("18px");
    expect((circle as HTMLElement).style.height).toBe("18px");
  });

  // 10. Short title/desc renders without truncation
  it("renders short title and description without truncation", () => {
    const shortTitle = "Short";
    const shortDesc = "Brief description.";
    render(
      <SerpPreview {...defaults} title={shortTitle} description={shortDesc} />
    );

    expect(screen.getByText(shortTitle)).toBeDefined();
    expect(screen.getByText(shortDesc)).toBeDefined();
    // Ensure no ellipsis was added
    expect(screen.queryByText(/\.\.\./)).toBeNull();
  });
});
