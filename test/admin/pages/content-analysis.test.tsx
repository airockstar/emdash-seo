import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContentAnalysisPage } from "../../../src/admin/pages/content-analysis.js";
import { apiFetch } from "../../../src/admin/api.js";

vi.mock("../../../src/admin/api.js", () => ({
  apiFetch: vi.fn(),
}));

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;
const mockFetch = vi.fn();

const MANIFEST = {
  data: {
    collections: { posts: {}, pages: {} },
  },
};

const POSTS = [
  { id: "post-1", data: { title: "Hello World" } },
  { id: "post-2", data: { title: "Second Post" } },
];

const PAGES = [
  { id: "page-1", data: { title: "About Us" } },
];

function mockContentLoad() {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes("/manifest")) {
      return Promise.resolve(new Response(JSON.stringify(MANIFEST)));
    }
    if (url.includes("/content/posts")) {
      return Promise.resolve(new Response(JSON.stringify({ data: { items: POSTS } })));
    }
    if (url.includes("/content/pages")) {
      return Promise.resolve(new Response(JSON.stringify({ data: { items: PAGES } })));
    }
    return Promise.resolve(new Response(JSON.stringify({})));
  });
}

function makeChecks(): Array<{ id: string; label: string; status: "pass" | "warn" | "fail"; message: string; weight: number }> {
  return [
    { id: "title-length", label: "Title Length", status: "pass", message: "Title is between 30-60 characters", weight: 10 },
    { id: "meta-desc", label: "Meta Description", status: "warn", message: "Description is a bit short", weight: 8 },
    { id: "h1-missing", label: "H1 Tag", status: "fail", message: "No H1 tag found on the page", weight: 10 },
  ];
}

describe("ContentAnalysisPage", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
  });

  it("shows loading state initially", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<ContentAnalysisPage />);
    expect(screen.getByText("Loading content...")).toBeDefined();
  });

  it("fetches manifest and content on mount", async () => {
    mockContentLoad();
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/_emdash/api/manifest");
    });
  });

  it("displays content items from all collections", async () => {
    mockContentLoad();
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeDefined();
      expect(screen.getByText("Second Post")).toBeDefined();
      expect(screen.getByText("About Us")).toBeDefined();
    });
  });

  it("shows collection name for each item", async () => {
    mockContentLoad();
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getAllByText("posts")).toHaveLength(2);
      expect(screen.getAllByText("pages")).toHaveLength(1);
    });
  });

  it("shows empty message when no collections exist", async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ data: { collections: {} } })));
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("No content found")).toBeDefined();
    });
  });

  it("shows empty state when manifest fetch fails", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("No content found")).toBeDefined();
    });
  });

  it("has an Analyze button for each content item", async () => {
    mockContentLoad();
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      const buttons = screen.getAllByText("Analyze");
      expect(buttons).toHaveLength(3);
    });
  });

  it("calls plugin apiFetch with analyze route when Analyze is clicked", async () => {
    mockContentLoad();
    mockApiFetch.mockResolvedValue({ score: 75, checks: makeChecks() });
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeDefined();
    });

    fireEvent.click(screen.getAllByText("Analyze")[0]);

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith("analyze", { contentId: "post-1", collection: "posts" });
    });
  });

  it("shows score and checks after successful analysis", async () => {
    mockContentLoad();
    mockApiFetch.mockResolvedValue({ score: 75, checks: makeChecks() });
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeDefined();
    });

    fireEvent.click(screen.getAllByText("Analyze")[0]);

    await waitFor(() => {
      // ScoreBadge renders score as SVG text; both table row and expanded panel show it
      const badges = screen.getAllByLabelText("SEO score: 75 out of 100");
      expect(badges.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Title Length")).toBeDefined();
      expect(screen.getByText("Meta Description")).toBeDefined();
      expect(screen.getByText("H1 Tag")).toBeDefined();
    });
  });

  it("shows check messages", async () => {
    mockContentLoad();
    mockApiFetch.mockResolvedValue({ score: 75, checks: makeChecks() });
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeDefined();
    });

    fireEvent.click(screen.getAllByText("Analyze")[0]);

    await waitFor(() => {
      expect(screen.getByText("Title is between 30-60 characters")).toBeDefined();
      expect(screen.getByText("Description is a bit short")).toBeDefined();
      expect(screen.getByText("No H1 tag found on the page")).toBeDefined();
    });
  });

  it("shows error from analysis response", async () => {
    mockContentLoad();
    mockApiFetch.mockResolvedValue({ error: "analysis_error", message: "Content not found" });
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeDefined();
    });

    fireEvent.click(screen.getAllByText("Analyze")[0]);

    await waitFor(() => {
      expect(screen.getByText("Content not found")).toBeDefined();
    });
  });

  it("shows error when analysis fetch rejects", async () => {
    mockContentLoad();
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeDefined();
    });

    mockApiFetch.mockRejectedValue(new Error("Network error"));
    fireEvent.click(screen.getAllByText("Analyze")[0]);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeDefined();
    });
  });

  it("renders error with role='alert'", async () => {
    mockContentLoad();
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeDefined();
    });

    mockApiFetch.mockRejectedValue(new Error("Something went wrong"));
    fireEvent.click(screen.getAllByText("Analyze")[0]);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeDefined();
      expect(alert.textContent).toBe("Something went wrong");
    });
  });

  it("highlights the selected row", async () => {
    mockContentLoad();
    mockApiFetch.mockResolvedValue({ score: 80, checks: [] });
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeDefined();
    });

    fireEvent.click(screen.getAllByText("Analyze")[0]);

    await waitFor(() => {
      // "Hello World" appears in both the table row and the expanded panel title
      const rows = screen.getAllByText("Hello World").map((el) => el.closest("tr"));
      const dataRow = rows.find((r) => r?.querySelector("button.seo-btn"));
      expect(dataRow?.style.background).toBe("rgb(249, 250, 251)");
    });
  });

  it("shows loading indicator on the clicked button", async () => {
    mockContentLoad();
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeDefined();
    });

    let resolveAnalysis: (value: unknown) => void;
    mockApiFetch.mockReturnValue(new Promise((resolve) => { resolveAnalysis = resolve; }));

    fireEvent.click(screen.getAllByText("Analyze")[0]);

    await waitFor(() => {
      expect(screen.getByText("Analyzing...")).toBeDefined();
    });

    resolveAnalysis!({ score: 80, checks: [] });

    await waitFor(() => {
      expect(screen.queryByText("Analyzing...")).toBeNull();
    });
  });
});
