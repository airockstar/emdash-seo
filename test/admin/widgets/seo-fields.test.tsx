import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SeoFieldsWidget } from "../../../src/admin/widgets/seo-fields.js";
import { apiFetch } from "../../../src/admin/api.js";

vi.mock("../../../src/admin/api.js", () => ({
  apiFetch: vi.fn(),
}));

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

function mockOverridesGet(overrides: Record<string, unknown> | null = null) {
  mockApiFetch.mockImplementation(async (route: string) => {
    if (route === "overrides/get") return { overrides };
    if (route === "overrides/save") return { success: true };
    return {};
  });
}

const defaultProps = {
  contentId: "post-1",
  collection: "posts",
  siteUrl: "https://example.com",
};

describe("SeoFieldsWidget", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  it("renders loading state initially", () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    render(<SeoFieldsWidget {...defaultProps} />);
    expect(screen.getByText("Loading SEO fields...")).toBeDefined();
  });

  it("loads existing override data", async () => {
    mockOverridesGet({
      title: "Existing Title",
      description: "Existing description",
      focusKeyword: "seo",
    });
    render(<SeoFieldsWidget {...defaultProps} />);

    await waitFor(() => {
      const titleInput = document.getElementById("seo-field-title") as HTMLInputElement;
      expect(titleInput.value).toBe("Existing Title");
    });

    const descInput = document.getElementById("seo-field-description") as HTMLTextAreaElement;
    expect(descInput.value).toBe("Existing description");

    const kwInput = document.getElementById("seo-field-keyword") as HTMLInputElement;
    expect(kwInput.value).toBe("seo");
  });

  it("renders empty fields when no overrides exist", async () => {
    mockOverridesGet(null);
    render(<SeoFieldsWidget {...defaultProps} />);

    await waitFor(() => {
      const titleInput = document.getElementById("seo-field-title") as HTMLInputElement;
      expect(titleInput.value).toBe("");
    });
  });

  it("calls overrides/get on mount with contentId", async () => {
    mockOverridesGet(null);
    render(<SeoFieldsWidget {...defaultProps} />);

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith("overrides/get", { contentId: "post-1" });
    });
  });

  it("calls overrides/save with field values on save", async () => {
    mockOverridesGet(null);
    render(<SeoFieldsWidget {...defaultProps} />);

    await waitFor(() => {
      expect(document.getElementById("seo-field-title")).not.toBeNull();
    });

    const titleInput = document.getElementById("seo-field-title") as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "New Title" } });

    const saveBtn = screen.getByText("Save SEO");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith("overrides/save", {
        contentId: "post-1",
        collection: "posts",
        title: "New Title",
        description: undefined,
        focusKeyword: undefined,
      });
    });
  });

  it("shows success message after saving", async () => {
    mockOverridesGet(null);
    render(<SeoFieldsWidget {...defaultProps} />);

    await waitFor(() => {
      expect(document.getElementById("seo-field-title")).not.toBeNull();
    });

    const saveBtn = screen.getByText("Save SEO");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText("SEO fields saved")).toBeDefined();
    });
  });

  it("shows error message when save fails", async () => {
    mockApiFetch.mockImplementation(async (route: string) => {
      if (route === "overrides/get") return { overrides: null };
      throw new Error("Network error");
    });
    render(<SeoFieldsWidget {...defaultProps} />);

    await waitFor(() => {
      expect(document.getElementById("seo-field-title")).not.toBeNull();
    });

    const saveBtn = screen.getByText("Save SEO");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText("Failed to save SEO fields")).toBeDefined();
    });
  });

  it("renders SERP preview", async () => {
    mockOverridesGet({
      title: "My Page Title",
      description: "A description for search engines",
    });
    render(<SeoFieldsWidget {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Search Preview")).toBeDefined();
    });

    expect(screen.getByRole("img", { name: "Google search result preview" })).toBeDefined();
  });

  it("renders character counters for title and description", async () => {
    mockOverridesGet({ title: "Hello", description: "World" });
    render(<SeoFieldsWidget {...defaultProps} />);

    await waitFor(() => {
      const statusElements = screen.getAllByRole("status");
      expect(statusElements.length).toBe(2);
    });
  });
});
