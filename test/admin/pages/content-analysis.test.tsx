import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContentAnalysisPage } from "../../../src/admin/pages/content-analysis.js";
import { apiFetch } from "../../../src/admin/api.js";

vi.mock("../../../src/admin/api.js", () => ({
  apiFetch: vi.fn(),
}));

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

function makeChecks(): Array<{ id: string; label: string; status: "pass" | "warn" | "fail"; message: string; weight: number }> {
  return [
    { id: "title-length", label: "Title Length", status: "pass", message: "Title is between 30-60 characters", weight: 10 },
    { id: "meta-desc", label: "Meta Description", status: "warn", message: "Description is a bit short", weight: 8 },
    { id: "h1-missing", label: "H1 Tag", status: "fail", message: "No H1 tag found on the page", weight: 10 },
  ];
}

function mockSuccess(score = 75, checks = makeChecks(), extra: Record<string, unknown> = {}) {
  mockApiFetch.mockResolvedValue(new Response(JSON.stringify({ score, checks, ...extra })));
}

function mockErrorResponse(message: string) {
  mockApiFetch.mockResolvedValue(new Response(JSON.stringify({ error: "analysis_error", message })));
}

function mockRejection(message: string) {
  mockApiFetch.mockRejectedValue(new Error(message));
}

describe("ContentAnalysisPage", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  // 1. Shows empty state initially (no analysis run)
  it("shows empty state when no analysis has been run", () => {
    render(<ContentAnalysisPage />);

    expect(screen.getByText("Run an analysis")).toBeDefined();
    expect(screen.getByText("Enter a content ID above and click Analyze to see your SEO score.")).toBeDefined();
  });

  // 2. Has content ID input with placeholder
  it("has a content ID input with placeholder text", () => {
    render(<ContentAnalysisPage />);

    const input = screen.getByLabelText("Content ID") as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.placeholder).toBe("Enter a content ID to analyze...");
  });

  // 3. Has "Analyze" and "Advanced (Pro)" buttons
  it("has Analyze and Advanced (Pro) buttons", () => {
    render(<ContentAnalysisPage />);

    expect(screen.getByText("Analyze")).toBeDefined();
    expect(screen.getByText("Advanced (Pro)")).toBeDefined();
  });

  // 4. Buttons are disabled when input is empty
  it("disables both buttons when the input is empty", () => {
    render(<ContentAnalysisPage />);

    const analyzeBtn = screen.getByText("Analyze") as HTMLButtonElement;
    const advancedBtn = screen.getByText("Advanced (Pro)") as HTMLButtonElement;

    expect(analyzeBtn.disabled).toBe(true);
    expect(advancedBtn.disabled).toBe(true);
  });

  // 5. Clicking Analyze calls apiFetch("analyze", { contentId })
  it("calls apiFetch with 'analyze' and the content ID when Analyze is clicked", async () => {
    mockSuccess();
    render(<ContentAnalysisPage />);

    const input = screen.getByLabelText("Content ID");
    fireEvent.change(input, { target: { value: "post-123" } });

    const analyzeBtn = screen.getByText("Analyze");
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith("analyze", { contentId: "post-123" });
    });
  });

  // 6. Shows score badge after successful analysis
  it("shows score badge after successful analysis", async () => {
    mockSuccess(75);
    render(<ContentAnalysisPage />);

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "post-1" } });
    fireEvent.click(screen.getByText("Analyze"));

    await waitFor(() => {
      expect(screen.getByRole("img", { name: "SEO score: 75 out of 100" })).toBeDefined();
    });
  });

  // 7. Shows check list with pass/warn/fail badges
  it("shows check list items with pass, warn, and fail badges", async () => {
    mockSuccess(75);
    render(<ContentAnalysisPage />);

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "post-1" } });
    fireEvent.click(screen.getByText("Analyze"));

    await waitFor(() => {
      expect(screen.getByText("Title Length")).toBeDefined();
      expect(screen.getByText("Meta Description")).toBeDefined();
      expect(screen.getByText("H1 Tag")).toBeDefined();
    });

    // Check status badges via aria-label
    const badges = [
      screen.getByLabelText("pass"),
      screen.getByLabelText("warn"),
      screen.getByLabelText("fail"),
    ];
    expect(badges).toHaveLength(3);

    // Check status icons
    expect(screen.getByLabelText("pass").textContent).toBe("\u2713");
    expect(screen.getByLabelText("warn").textContent).toBe("\u26A0");
    expect(screen.getByLabelText("fail").textContent).toBe("\u2717");
  });

  // 8. Shows score number (e.g., "75/100")
  it("shows the score as a fraction of 100", async () => {
    mockSuccess(75);
    render(<ContentAnalysisPage />);

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "post-1" } });
    fireEvent.click(screen.getByText("Analyze"));

    await waitFor(() => {
      expect(screen.getByText("75/100")).toBeDefined();
    });
  });

  // 9. Shows error message when analysis fails (rejected promise)
  it("shows error message when analysis throws", async () => {
    mockRejection("Network error");
    render(<ContentAnalysisPage />);

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "post-1" } });
    fireEvent.click(screen.getByText("Analyze"));

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeDefined();
    });
  });

  // 10. Shows "pro_required" error for advanced without license
  it("shows pro_required error when advanced analysis is attempted without a license", async () => {
    mockApiFetch.mockResolvedValue(new Response(JSON.stringify({ error: "analysis_error", message: "Advanced analysis requires a Pro license" })));
    render(<ContentAnalysisPage />);

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "post-1" } });
    fireEvent.click(screen.getByText("Advanced (Pro)"));

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith("analyze/advanced", { contentId: "post-1" });
      expect(screen.getByText("Advanced analysis requires a Pro license")).toBeDefined();
    });
  });

  // 11. Enter key triggers analysis
  it("triggers analysis when Enter key is pressed", async () => {
    mockSuccess();
    render(<ContentAnalysisPage />);

    const input = screen.getByLabelText("Content ID");
    fireEvent.change(input, { target: { value: "post-1" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith("analyze", { contentId: "post-1" });
    });
  });

  // 12. Loading state disables buttons
  it("disables buttons and shows loading text while analyzing", async () => {
    let resolvePromise: (value: unknown) => void;
    mockApiFetch.mockReturnValue(new Promise((resolve) => { resolvePromise = resolve; }));
    render(<ContentAnalysisPage />);

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "post-1" } });
    fireEvent.click(screen.getByText("Analyze"));

    // While loading, buttons should be disabled and text should change
    await waitFor(() => {
      expect(screen.getByText("Analyzing...")).toBeDefined();
    });

    const analyzeBtn = screen.getByText("Analyzing...") as HTMLButtonElement;
    const advancedBtn = screen.getByText("Advanced (Pro)") as HTMLButtonElement;
    expect(analyzeBtn.disabled).toBe(true);
    expect(advancedBtn.disabled).toBe(true);

    // Resolve to clean up
    resolvePromise!(new Response(JSON.stringify({ score: 80, checks: [] })));
    await waitFor(() => {
      expect(screen.getByText("Analyze")).toBeDefined();
    });
  });

  // 13. Shows number of checks performed
  it("shows the number of checks performed", async () => {
    mockSuccess(75);
    render(<ContentAnalysisPage />);

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "post-1" } });
    fireEvent.click(screen.getByText("Analyze"));

    await waitFor(() => {
      expect(screen.getByText("3 checks performed")).toBeDefined();
    });
  });

  // 14. Error banner uses ErrorBanner component with role="alert"
  it("renders error using ErrorBanner with role='alert'", async () => {
    mockRejection("Something went wrong");
    render(<ContentAnalysisPage />);

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "post-1" } });
    fireEvent.click(screen.getByText("Analyze"));

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeDefined();
      expect(alert.textContent).toBe("Something went wrong");
    });
  });

  // Additional: empty state disappears after results
  it("hides empty state after a successful analysis", async () => {
    mockSuccess();
    render(<ContentAnalysisPage />);

    // Verify empty state is shown initially
    expect(screen.getByText("Run an analysis")).toBeDefined();

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "post-1" } });
    fireEvent.click(screen.getByText("Analyze"));

    await waitFor(() => {
      expect(screen.queryByText("Run an analysis")).toBeNull();
    });
  });

  // Additional: error response clears previous result
  it("clears previous result when an error response is returned", async () => {
    mockSuccess(80);
    render(<ContentAnalysisPage />);

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "post-1" } });
    fireEvent.click(screen.getByText("Analyze"));

    await waitFor(() => {
      expect(screen.getByText("80/100")).toBeDefined();
    });

    // Now make it return an error
    mockErrorResponse("Content not found");

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "post-bad" } });
    fireEvent.click(screen.getByText("Analyze"));

    await waitFor(() => {
      expect(screen.getByText("Content not found")).toBeDefined();
      expect(screen.queryByText("80/100")).toBeNull();
    });
  });

  // Additional: trims whitespace from content ID
  it("trims whitespace from content ID before sending", async () => {
    mockSuccess();
    render(<ContentAnalysisPage />);

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "  post-1  " } });
    fireEvent.click(screen.getByText("Analyze"));

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith("analyze", { contentId: "post-1" });
    });
  });

  // Additional: whitespace-only input does not trigger analysis
  it("does not trigger analysis when input is whitespace only", () => {
    render(<ContentAnalysisPage />);

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "   " } });

    const analyzeBtn = screen.getByText("Analyze") as HTMLButtonElement;
    expect(analyzeBtn.disabled).toBe(true);
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  // Additional: check messages are displayed
  it("displays check messages alongside labels", async () => {
    mockSuccess(75);
    render(<ContentAnalysisPage />);

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "post-1" } });
    fireEvent.click(screen.getByText("Analyze"));

    await waitFor(() => {
      expect(screen.getByText("Title is between 30-60 characters")).toBeDefined();
      expect(screen.getByText("Description is a bit short")).toBeDefined();
      expect(screen.getByText("No H1 tag found on the page")).toBeDefined();
    });
  });

  // Link Suggestions section appears after analysis
  it("shows Link Suggestions section after analysis", async () => {
    mockSuccess();
    render(<ContentAnalysisPage />);

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "post-1" } });
    fireEvent.click(screen.getByText("Analyze"));

    await waitFor(() => {
      expect(screen.getByText("Internal Link Suggestions")).toBeDefined();
    });
  });

  // Empty link suggestions shows message
  it("shows empty message when no link suggestions available", async () => {
    mockSuccess();
    render(<ContentAnalysisPage />);

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "post-1" } });
    fireEvent.click(screen.getByText("Analyze"));

    await waitFor(() => {
      expect(screen.getByText("No link suggestions available. Run Advanced analysis for suggestions.")).toBeDefined();
    });
  });

  // Link suggestion items show title and URL
  it("shows link suggestion items with title and URL", async () => {
    const suggestions = [
      { targetTitle: "Related Post", targetUrl: "/blog/related", relevanceScore: 0.85 },
      { targetTitle: "Another Post", targetUrl: "/blog/another", relevanceScore: 0.72 },
    ];
    mockApiFetch.mockImplementation((route: string) => {
      if (route === "analyze/advanced") return Promise.resolve(new Response(JSON.stringify({ score: 75, checks: makeChecks() })));
      if (route === "analyze/link-suggestions") return Promise.resolve(new Response(JSON.stringify({ suggestions })));
      return Promise.resolve(new Response(JSON.stringify({})));
    });
    render(<ContentAnalysisPage />);

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "post-1" } });
    fireEvent.click(screen.getByText("Advanced (Pro)"));

    await waitFor(() => {
      expect(screen.getByText("Related Post")).toBeDefined();
      expect(screen.getByText("/blog/related")).toBeDefined();
      expect(screen.getByText("85%")).toBeDefined();
      expect(screen.getByText("Another Post")).toBeDefined();
      expect(screen.getByText("/blog/another")).toBeDefined();
      expect(screen.getByText("72%")).toBeDefined();
    });
  });

  // Orphaned Content section is visible
  it("shows Orphaned Content section", () => {
    render(<ContentAnalysisPage />);
    expect(screen.getByText("Orphaned Content")).toBeDefined();
    expect(screen.getByText("Find Orphaned (Pro)")).toBeDefined();
  });

  // Broken Links section is visible
  it("shows Broken Links section", () => {
    render(<ContentAnalysisPage />);
    expect(screen.getByText("Broken Links")).toBeDefined();
    expect(screen.getByText("Check Links (Pro)")).toBeDefined();
  });

  // Search Stats section is visible
  it("shows Search Stats section", () => {
    render(<ContentAnalysisPage />);
    expect(screen.getByText("Search Stats")).toBeDefined();
    expect(screen.getByText("Fetch Stats (Pro)")).toBeDefined();
  });

  // Orphaned Content button calls analyze/orphaned
  it("clicking Find Orphaned calls analyze/orphaned", async () => {
    mockApiFetch.mockResolvedValue(new Response(JSON.stringify({ orphaned: [{ id: "p-1", title: "Orphan", url: "/blog/orphan" }] })));
    render(<ContentAnalysisPage />);

    fireEvent.click(screen.getByText("Find Orphaned (Pro)"));
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith("analyze/orphaned");
      expect(screen.getByText("Orphan")).toBeDefined();
    });
  });

  // Broken Links button calls analyze/broken-links
  it("clicking Check Links calls analyze/broken-links", async () => {
    mockApiFetch.mockResolvedValue(new Response(JSON.stringify({ broken: [{ url: "/missing", status: 404, text: "Missing" }] })));
    render(<ContentAnalysisPage />);

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "post-1" } });
    fireEvent.click(screen.getByText("Check Links (Pro)"));
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith("analyze/broken-links", { contentId: "post-1" });
      expect(screen.getByText("Missing")).toBeDefined();
    });
  });

  // Search Stats button calls analyze/search-stats
  it("clicking Fetch Stats calls analyze/search-stats", async () => {
    mockApiFetch.mockResolvedValue(new Response(JSON.stringify({ stats: [{ query: "test", clicks: 10, impressions: 100, ctr: 0.1, position: 2.5 }] })));
    render(<ContentAnalysisPage />);

    fireEvent.click(screen.getByText("Fetch Stats (Pro)"));
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith("analyze/search-stats");
      expect(screen.getByText("test")).toBeDefined();
      expect(screen.getByText("10")).toBeDefined();
    });
  });

  // Alt Suggestions section appears when present in results
  it("shows Alt Suggestions section when present in results", async () => {
    const altSuggestions = [
      { src: "hero.jpg", imageIndex: 0, suggestedAlt: "A hero banner image" },
      { imageIndex: 1, suggestedAlt: "Product screenshot" },
    ];
    mockSuccess(75, makeChecks(), { altSuggestions });
    render(<ContentAnalysisPage />);

    fireEvent.change(screen.getByLabelText("Content ID"), { target: { value: "post-1" } });
    fireEvent.click(screen.getByText("Analyze"));

    await waitFor(() => {
      expect(screen.getByText("Alt Text Suggestions")).toBeDefined();
      expect(screen.getByText("hero.jpg")).toBeDefined();
      expect(screen.getByText("Image 2")).toBeDefined();
    });
  });
});
