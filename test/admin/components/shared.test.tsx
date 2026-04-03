import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  EmptyState,
  ErrorBanner,
  Skeleton,
  truncate,
  parseDomain,
} from "../../../src/admin/components/shared.js";


describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="No results" description="Try a different query" />);
    expect(screen.getByText("No results")).toBeDefined();
    expect(screen.getByText("Try a different query")).toBeDefined();
  });

  it("has seo-empty class", () => {
    const { container } = render(
      <EmptyState title="Empty" description="Nothing here" />,
    );
    expect(container.querySelector(".seo-empty")).not.toBeNull();
  });
});

describe("ErrorBanner", () => {
  it("renders error message", () => {
    render(<ErrorBanner message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeDefined();
  });

  it('has role="alert" for accessibility', () => {
    render(<ErrorBanner message="Oops" />);
    expect(screen.getByRole("alert")).toBeDefined();
  });

  it("has seo-fade-in animation class", () => {
    render(<ErrorBanner message="Error" />);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("seo-fade-in");
  });
});

describe("Skeleton", () => {
  it("renders with given width and height", () => {
    const { container } = render(<Skeleton width={200} height={20} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe("200px");
    expect(el.style.height).toBe("20px");
  });

  it("has seo-skeleton class", () => {
    const { container } = render(<Skeleton width={100} height={10} />);
    expect(container.querySelector(".seo-skeleton")).not.toBeNull();
  });

  it("renders circular when circle=true", () => {
    const { container } = render(
      <Skeleton width={40} height={40} circle={true} />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.borderRadius).toBe("50%");
  });

  it("renders rounded rect when circle=false", () => {
    const { container } = render(
      <Skeleton width={100} height={20} circle={false} />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.borderRadius).toBe("0.25rem");
  });
});

describe("truncate", () => {
  it("returns string unchanged when under max", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it('truncates with "..." when over max', () => {
    expect(truncate("hello world", 8)).toBe("hello...");
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });

  it("handles exact max length (no truncation)", () => {
    expect(truncate("abcde", 5)).toBe("abcde");
  });
});

describe("parseDomain", () => {
  it("extracts hostname from valid URL", () => {
    expect(parseDomain("http://example.com")).toBe("example.com");
  });

  it("returns raw string for invalid URL", () => {
    expect(parseDomain("not-a-url")).toBe("not-a-url");
  });

  it("handles HTTPS URLs", () => {
    expect(parseDomain("https://secure.example.com")).toBe("secure.example.com");
  });

  it("handles URLs with paths", () => {
    expect(parseDomain("https://example.com/path/to/page")).toBe("example.com");
  });
});
