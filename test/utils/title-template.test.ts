import { describe, it, expect } from "vitest";
import { formatTitle } from "../../src/utils/title-template.js";

describe("formatTitle", () => {
  it("replaces {title} and {site} placeholders", () => {
    expect(formatTitle("{title} | {site}", "My Page", "My Site")).toBe(
      "My Page | My Site",
    );
  });

  it("replaces {sep} placeholder with given separator", () => {
    expect(formatTitle("{title} {sep} {site}", "My Page", "My Site", "-")).toBe(
      "My Page - My Site",
    );
  });

  it("uses default separator when none provided", () => {
    expect(formatTitle("{title} {sep} {site}", "My Page", "My Site")).toBe(
      "My Page | My Site",
    );
  });

  it("removes dangling separator when title is empty", () => {
    expect(formatTitle("{title} | {site}", "", "My Site")).toBe("My Site");
  });

  it("removes dangling separator when site is empty", () => {
    expect(formatTitle("{title} | {site}", "My Page", "")).toBe("My Page");
  });

  it("returns empty string when both are empty", () => {
    expect(formatTitle("{title} | {site}", "", "")).toBe("");
  });

  it("handles template with no placeholders", () => {
    expect(formatTitle("Static Title", "ignored", "ignored")).toBe(
      "Static Title",
    );
  });

  it("collapses extra whitespace", () => {
    expect(formatTitle("{title}  {site}", "Hello", "World")).toBe(
      "Hello World",
    );
  });
});
