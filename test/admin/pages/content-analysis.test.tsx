import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContentAnalysisPage } from "../../../src/admin/pages/content-analysis.js";
import { apiFetch } from "../../../src/admin/api.js";
import { apiFetch as baseFetch } from "emdash/plugin-utils";

vi.mock("../../../src/admin/api.js", () => ({
  apiFetch: vi.fn(),
}));

vi.mock("emdash/plugin-utils", () => ({
  apiFetch: vi.fn(),
}));

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;
const mockBaseFetch = baseFetch as ReturnType<typeof vi.fn>;

const CONTENT_ITEMS = [
  { id: "post-1", data: { title: "Hello World", slug: "hello-world" }, collection: "blog" },
  { id: "post-2", data: { title: "About Us", slug: "about-us" }, collection: "pages" },
  { id: "post-3", data: { slug: "no-title" } },
];

function mockContentList(items = CONTENT_ITEMS) {
  mockBaseFetch.mockResolvedValue(new Response(JSON.stringify({ data: items })));
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
    mockBaseFetch.mockReset();
  });

  it("shows loading state initially", () => {
    mockBaseFetch.mockReturnValue(new Promise(() => {})); // never resolves
    render(<ContentAnalysisPage />);
    expect(screen.getByText("Loading content...")).toBeDefined();
  });

  it("fetches content from Emdash API on mount", async () => {
    mockContentList();
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(mockBaseFetch).toHaveBeenCalledWith("/_emdash/api/content?limit=100", { method: "GET" });
    });
  });

  it("displays content items in a table", async () => {
    mockContentList();
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeDefined();
      expect(screen.getByText("About Us")).toBeDefined();
      expect(screen.getByText("blog")).toBeDefined();
      expect(screen.getByText("pages")).toBeDefined();
    });
  });

  it("shows content ID as fallback when title is missing", async () => {
    mockContentList();
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("post-3")).toBeDefined();
    });
  });

  it("shows empty message when no content exists", async () => {
    mockContentList([]);
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("No content found. Create some posts or pages first.")).toBeDefined();
    });
  });

  it("shows error when content fetch fails", async () => {
    mockBaseFetch.mockRejectedValue(new Error("Network error"));
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load content")).toBeDefined();
    });
  });

  it("has an Analyze button for each content item", async () => {
    mockContentList();
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      const buttons = screen.getAllByText("Analyze");
      expect(buttons).toHaveLength(3);
    });
  });

  it("calls apiFetch with analyze route when Analyze is clicked", async () => {
    mockContentList();
    mockApiFetch.mockResolvedValue(new Response(JSON.stringify({ score: 75, checks: makeChecks() })));
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeDefined();
    });

    const buttons = screen.getAllByText("Analyze");
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith("analyze", { contentId: "post-1" });
    });
  });

  it("shows score and checks after successful analysis", async () => {
    mockContentList();
    mockApiFetch.mockResolvedValue(new Response(JSON.stringify({ score: 75, checks: makeChecks() })));
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeDefined();
    });

    fireEvent.click(screen.getAllByText("Analyze")[0]);

    await waitFor(() => {
      expect(screen.getByText("75")).toBeDefined();
      expect(screen.getByText("SEO Score")).toBeDefined();
      expect(screen.getByText("3 checks performed")).toBeDefined();
      expect(screen.getByText("Title Length")).toBeDefined();
      expect(screen.getByText("Meta Description")).toBeDefined();
      expect(screen.getByText("H1 Tag")).toBeDefined();
    });
  });

  it("shows check messages", async () => {
    mockContentList();
    mockApiFetch.mockResolvedValue(new Response(JSON.stringify({ score: 75, checks: makeChecks() })));
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
    mockContentList();
    mockApiFetch.mockResolvedValue(new Response(JSON.stringify({ error: "analysis_error", message: "Content not found" })));
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
    mockContentList();
    mockApiFetch.mockRejectedValue(new Error("Network error"));
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeDefined();
    });

    fireEvent.click(screen.getAllByText("Analyze")[0]);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeDefined();
    });
  });

  it("renders error with role='alert'", async () => {
    mockContentList();
    mockApiFetch.mockRejectedValue(new Error("Something went wrong"));
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeDefined();
    });

    fireEvent.click(screen.getAllByText("Analyze")[0]);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeDefined();
      expect(alert.textContent).toBe("Something went wrong");
    });
  });

  it("highlights the selected row", async () => {
    mockContentList();
    mockApiFetch.mockResolvedValue(new Response(JSON.stringify({ score: 80, checks: [] })));
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeDefined();
    });

    fireEvent.click(screen.getAllByText("Analyze")[0]);

    await waitFor(() => {
      const row = screen.getByText("Hello World").closest("tr");
      expect(row?.style.background).toBe("rgb(240, 253, 244)");
    });
  });

  it("shows loading indicator on the clicked button", async () => {
    mockContentList();
    let resolveAnalysis: (value: unknown) => void;
    mockApiFetch.mockReturnValue(new Promise((resolve) => { resolveAnalysis = resolve; }));
    render(<ContentAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeDefined();
    });

    fireEvent.click(screen.getAllByText("Analyze")[0]);

    await waitFor(() => {
      expect(screen.getByText("...")).toBeDefined();
    });

    resolveAnalysis!(new Response(JSON.stringify({ score: 80, checks: [] })));

    await waitFor(() => {
      expect(screen.queryByText("...")).toBeNull();
    });
  });
});
