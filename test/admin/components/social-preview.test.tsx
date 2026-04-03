import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SocialPreview } from "../../../src/admin/components/social-preview.js";


const defaults = {
  title: "My Page Title",
  description: "A short description of the page content.",
  url: "https://example.com/blog/post",
  platform: "facebook" as const,
};

describe("SocialPreview", () => {
  // 1. Renders title, description, domain
  it("renders title, description, and domain extracted from url", () => {
    render(<SocialPreview {...defaults} />);

    expect(screen.getByText("My Page Title")).toBeDefined();
    expect(screen.getByText("A short description of the page content.")).toBeDefined();
    expect(screen.getByText("example.com")).toBeDefined();
  });

  // 2. Truncates title at 70 chars
  it("truncates title longer than 70 characters", () => {
    const longTitle = "A".repeat(80);
    render(<SocialPreview {...defaults} title={longTitle} />);

    const truncated = "A".repeat(67) + "...";
    expect(screen.getByText(truncated)).toBeDefined();
    expect(screen.queryByText(longTitle)).toBeNull();
  });

  it("does not truncate title of exactly 70 characters", () => {
    const title70 = "B".repeat(70);
    render(<SocialPreview {...defaults} title={title70} />);

    expect(screen.getByText(title70)).toBeDefined();
  });

  // 3. Truncates description at 100 chars
  it("truncates description longer than 100 characters", () => {
    const longDesc = "D".repeat(110);
    render(<SocialPreview {...defaults} description={longDesc} />);

    const truncated = "D".repeat(97) + "...";
    expect(screen.getByText(truncated)).toBeDefined();
    expect(screen.queryByText(longDesc)).toBeNull();
  });

  it("does not truncate description of exactly 100 characters", () => {
    const desc100 = "E".repeat(100);
    render(<SocialPreview {...defaults} description={desc100} />);

    expect(screen.getByText(desc100)).toBeDefined();
  });

  // 4. Shows image when provided
  it("shows the OG image when image prop is provided", () => {
    render(<SocialPreview {...defaults} image="https://example.com/og.png" />);

    const img = screen.getByRole("img", { name: /OG image preview/i });
    expect(img.getAttribute("src")).toBe("https://example.com/og.png");
  });

  // 5. Shows "No image set" placeholder when no image
  it('shows "No image set" placeholder when no image is provided', () => {
    render(<SocialPreview {...defaults} />);

    expect(screen.getByText("No image set")).toBeDefined();
  });

  it('does not show "No image set" when an image is provided', () => {
    render(<SocialPreview {...defaults} image="https://example.com/og.png" />);

    expect(screen.queryByText("No image set")).toBeNull();
  });

  // 6. Has proper alt text on OG image
  it("sets alt text on the OG image that includes the page title", () => {
    render(<SocialPreview {...defaults} image="https://example.com/og.png" />);

    const img = screen.getByAltText(`OG image preview for ${defaults.title}`);
    expect(img).toBeDefined();
    expect(img.tagName).toBe("IMG");
  });

  // 7. Has role="img" with platform-specific aria-label
  it.each([
    ["facebook", "facebook card preview"],
    ["twitter", "twitter card preview"],
    ["linkedin", "linkedin card preview"],
  ] as const)('has role="img" with aria-label "%s card preview" for %s platform', (platform, expectedLabel) => {
    render(<SocialPreview {...defaults} platform={platform} />);

    const container = screen.getByRole("img", { name: expectedLabel });
    expect(container).toBeDefined();
  });

  // 8. Renders for each platform
  describe("renders correctly for each platform", () => {
    it("renders facebook preview with title and description", () => {
      render(<SocialPreview {...defaults} platform="facebook" />);

      expect(screen.getByRole("img", { name: "facebook card preview" })).toBeDefined();
      expect(screen.getByText(defaults.title)).toBeDefined();
    });

    it("renders twitter preview with title and description", () => {
      render(<SocialPreview {...defaults} platform="twitter" />);

      expect(screen.getByRole("img", { name: "twitter card preview" })).toBeDefined();
      expect(screen.getByText(defaults.title)).toBeDefined();
    });

    it("renders linkedin preview with title and description", () => {
      render(<SocialPreview {...defaults} platform="linkedin" />);

      expect(screen.getByRole("img", { name: "linkedin card preview" })).toBeDefined();
      expect(screen.getByText(defaults.title)).toBeDefined();
    });
  });

  // 9. Handles invalid URL gracefully
  it("displays the raw string when the URL is invalid", () => {
    render(<SocialPreview {...defaults} url="not-a-valid-url" />);

    expect(screen.getByText("not-a-valid-url")).toBeDefined();
  });

  it("handles an empty string URL without crashing", () => {
    render(<SocialPreview {...defaults} url="" />);

    expect(screen.getByText(defaults.title)).toBeDefined();
  });

  // 10. Shows placeholder when title is empty
  it('shows "Page title" placeholder when title is an empty string', () => {
    render(<SocialPreview {...defaults} title="" />);

    expect(screen.getByText("Page title")).toBeDefined();
  });

  it('does not show "Page title" placeholder when title has content', () => {
    render(<SocialPreview {...defaults} />);

    expect(screen.queryByText("Page title")).toBeNull();
  });
});
