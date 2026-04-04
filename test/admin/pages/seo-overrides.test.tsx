import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SeoOverridesPage } from "../../../src/admin/pages/seo-overrides.js";

const MOCK_OVERRIDES = [
  {
    id: "post-1",
    data: {
      contentId: "post-1",
      collection: "blog",
      title: "My First Post",
      description: "A description for the first post that is long enough to test truncation behavior",
      robots: "index, follow",
      canonical: "https://example.com/blog/post-1",
      focusKeyword: "first post",
    },
  },
  {
    id: "post-2",
    data: {
      contentId: "post-2",
      collection: "pages",
      title: "About Us",
      description: "Learn about our team",
      robots: "",
      canonical: "",
      focusKeyword: "",
    },
  },
];

function createMockCallRoute(items = MOCK_OVERRIDES) {
  return vi.fn().mockResolvedValue({ items });
}

describe("SeoOverridesPage", () => {
  let callRoute: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    callRoute = createMockCallRoute();
  });


  // 1. Shows loading state initially
  it("shows loading state initially", () => {
    const pendingCallRoute = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SeoOverridesPage callRoute={pendingCallRoute} siteUrl="https://example.com" />);
    expect(screen.getByText("Loading overrides...")).toBeDefined();
  });

  // 2. Renders table with overrides after loading
  it("renders table with overrides after loading", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    expect(screen.getByText("post-2")).toBeDefined();
    expect(screen.getByText("blog")).toBeDefined();
    expect(screen.getByText("pages")).toBeDefined();
    expect(screen.getByText("My First Post")).toBeDefined();
    expect(screen.getByText("About Us")).toBeDefined();
  });

  // 3. Shows empty state when no overrides
  it("shows empty state when no overrides", async () => {
    callRoute = createMockCallRoute([]);
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("No overrides yet")).toBeDefined();
    });
    expect(screen.getByText("Edit content in the CMS to add SEO overrides.")).toBeDefined();
  });

  // 4. Shows item count in header
  it("shows item count in header", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("2 items")).toBeDefined();
    });
  });

  it("shows 0 items when empty", async () => {
    callRoute = createMockCallRoute([]);
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("0 items")).toBeDefined();
    });
  });

  // 5. Filter input exists with placeholder
  it("has filter input with correct placeholder", () => {
    const pendingCallRoute = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SeoOverridesPage callRoute={pendingCallRoute} siteUrl="https://example.com" />);
    const input = screen.getByPlaceholderText("Filter by collection...");
    expect(input).toBeDefined();
    expect(input.getAttribute("type")).toBe("text");
  });

  // 6. Clicking Edit opens edit panel
  it("clicking Edit opens edit panel", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Edit post-1"));
    expect(screen.getByText("Editing: post-1")).toBeDefined();
  });

  // 7. Edit panel shows SERP preview
  it("edit panel shows SERP preview", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Edit post-1"));
    expect(screen.getByText("Search Preview")).toBeDefined();
    expect(screen.getByRole("img", { name: "Google search result preview" })).toBeDefined();
  });

  // 8. Edit panel has character counters on title/description
  it("edit panel has character counters on title and description", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Edit post-1"));

    const titleCounter = screen.getByRole("status", {
      name: /title: \d+ of 60 characters/,
    });
    expect(titleCounter).toBeDefined();

    const descCounter = screen.getByRole("status", {
      name: /description: \d+ of 160 characters/,
    });
    expect(descCounter).toBeDefined();
  });

  // 9. Edit panel has all form fields (title, desc, keyword, robots, canonical)
  it("edit panel has all form fields", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Edit post-1"));

    expect(screen.getByLabelText(/^Title/)).toBeDefined();
    expect(screen.getByLabelText(/^Description/)).toBeDefined();
    expect(screen.getByLabelText("Focus Keyword")).toBeDefined();
    expect(screen.getByLabelText("Robots")).toBeDefined();
    expect(screen.getByLabelText("Canonical URL")).toBeDefined();
  });

  it("edit panel pre-fills form fields from override data", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Edit post-1"));

    expect((screen.getByLabelText(/^Title/) as HTMLInputElement).value).toBe("My First Post");
    expect((screen.getByLabelText(/^Description/) as HTMLTextAreaElement).value).toBe(
      "A description for the first post that is long enough to test truncation behavior",
    );
    expect((screen.getByLabelText("Focus Keyword") as HTMLInputElement).value).toBe("first post");
    expect((screen.getByLabelText("Robots") as HTMLInputElement).value).toBe("index, follow");
    expect((screen.getByLabelText("Canonical URL") as HTMLInputElement).value).toBe("https://example.com/blog/post-1");
  });

  // 10. Save button calls callRoute with correct data
  it("save button calls callRoute with correct data", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Edit post-1"));

    const titleInput = screen.getByLabelText(/^Title/);
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });

    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(callRoute).toHaveBeenCalledWith("overrides/save", {
        contentId: "post-1",
        collection: "blog",
        title: "Updated Title",
        description: "A description for the first post that is long enough to test truncation behavior",
        focusKeyword: "first post",
        robots: "index, follow",
        canonical: "https://example.com/blog/post-1",
        ogImage: "",
        schemaType: undefined,
      });
    });
  });

  // 11. Delete button shows confirm dialog
  it("delete button shows confirm dialog", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Delete post-1"));
    expect(confirmSpy).toHaveBeenCalledWith('Delete SEO overrides for "post-1"?');
  });

  it("delete calls callRoute when confirmed", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Delete post-1"));
    await waitFor(() => {
      expect(callRoute).toHaveBeenCalledWith("overrides/delete", { contentId: "post-1" });
    });
  });

  it("delete does not call callRoute when cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Delete post-1"));
    expect(callRoute).not.toHaveBeenCalledWith("overrides/delete", expect.anything());
  });

  // 12. Cancel button closes edit panel
  it("cancel button closes edit panel", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Edit post-1"));
    expect(screen.getByText("Editing: post-1")).toBeDefined();

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Editing: post-1")).toBeNull();
  });

  it("close button in edit panel header closes edit panel", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Edit post-1"));
    expect(screen.getByText("Editing: post-1")).toBeDefined();

    fireEvent.click(screen.getByText("Close"));
    expect(screen.queryByText("Editing: post-1")).toBeNull();
  });

  // 13. Filter triggers reload on Enter key
  it("filter triggers reload on Enter key", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });

    const filterInput = screen.getByPlaceholderText("Filter by collection...");
    fireEvent.change(filterInput, { target: { value: "blog" } });
    fireEvent.keyDown(filterInput, { key: "Enter" });

    await waitFor(() => {
      expect(callRoute).toHaveBeenCalledWith("overrides/list", { collection: "blog" });
    });
  });

  it("filter triggers reload on blur when value changed", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });

    const filterInput = screen.getByPlaceholderText("Filter by collection...");
    fireEvent.change(filterInput, { target: { value: "pages" } });
    fireEvent.blur(filterInput);

    await waitFor(() => {
      expect(callRoute).toHaveBeenCalledWith("overrides/list", { collection: "pages" });
    });
  });

  // 14. Labels are properly associated with inputs (htmlFor/id)
  it("labels are properly associated with inputs via htmlFor/id", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Edit post-1"));

    const titleInput = document.getElementById("seo-title");
    expect(titleInput).not.toBeNull();
    expect(titleInput!.tagName).toBe("INPUT");

    const descInput = document.getElementById("seo-desc");
    expect(descInput).not.toBeNull();
    expect(descInput!.tagName).toBe("TEXTAREA");

    const keywordInput = document.getElementById("seo-keyword");
    expect(keywordInput).not.toBeNull();

    const robotsInput = document.getElementById("seo-robots");
    expect(robotsInput).not.toBeNull();

    const canonicalInput = document.getElementById("seo-canonical");
    expect(canonicalInput).not.toBeNull();

    const labels = document.querySelectorAll("label[for]");
    const labelForValues = Array.from(labels).map((l) => l.getAttribute("for"));
    expect(labelForValues).toContain("seo-title");
    expect(labelForValues).toContain("seo-desc");
    expect(labelForValues).toContain("seo-keyword");
    expect(labelForValues).toContain("seo-robots");
    expect(labelForValues).toContain("seo-canonical");
  });

  // 15. Table has proper column headers
  it("table has proper column headers", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(5);
    expect(headers[0].textContent).toBe("Content");
    expect(headers[1].textContent).toBe("Collection");
    expect(headers[2].textContent).toBe("Title Override");
    expect(headers[3].textContent).toBe("Description");
    expect(headers[4].textContent).toBe("Actions");
  });

  it("page heading is rendered", () => {
    const pendingCallRoute = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SeoOverridesPage callRoute={pendingCallRoute} siteUrl="https://example.com" />);
    expect(screen.getByText("SEO Overrides")).toBeDefined();
  });

  it("save closes edit panel after success", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Edit post-1"));
    expect(screen.getByText("Editing: post-1")).toBeDefined();

    fireEvent.click(screen.getByText("Save Changes"));
    await waitFor(() => {
      expect(screen.queryByText("Editing: post-1")).toBeNull();
    });
  });

  it("calls overrides/list on initial mount", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(callRoute).toHaveBeenCalledWith("overrides/list", { collection: undefined });
    });
  });

  it("filter input has correct aria-label", () => {
    const pendingCallRoute = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SeoOverridesPage callRoute={pendingCallRoute} siteUrl="https://example.com" />);
    expect(screen.getByLabelText("Filter overrides by collection")).toBeDefined();
  });

  // OG Image field
  it("edit panel has OG Image field with label and input", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Edit post-1"));
    expect(screen.getByLabelText("OG Image URL")).toBeDefined();
    const input = document.getElementById("seo-ogimage") as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.type).toBe("text");
  });

  // Schema Type select
  it("edit panel has Schema Type select with all options", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Edit post-1"));
    expect(screen.getByLabelText("Schema Type")).toBeDefined();
    const select = document.getElementById("seo-schema-type") as HTMLSelectElement;
    expect(select).not.toBeNull();
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toContain("");
    expect(options).toContain("faq");
    expect(options).toContain("howto");
    expect(options).toContain("product");
    expect(options).toContain("localBusiness");
    expect(options).toContain("event");
  });

  // Social Preview renders
  it("edit panel shows Social Preview", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Edit post-1"));
    expect(screen.getByText("Social Preview")).toBeDefined();
    expect(screen.getByRole("img", { name: "facebook card preview" })).toBeDefined();
  });

  // OG Image included in save payload
  it("OG Image is included in save payload", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Edit post-1"));

    const ogInput = screen.getByLabelText("OG Image URL");
    fireEvent.change(ogInput, { target: { value: "https://example.com/image.png" } });
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(callRoute).toHaveBeenCalledWith("overrides/save", expect.objectContaining({
        ogImage: "https://example.com/image.png",
      }));
    });
  });

  // Schema Type included in save payload
  it("Schema Type is included in save payload", async () => {
    render(<SeoOverridesPage callRoute={callRoute} siteUrl="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText("post-1")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Edit post-1"));

    const select = document.getElementById("seo-schema-type") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "faq" } });
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(callRoute).toHaveBeenCalledWith("overrides/save", expect.objectContaining({
        schemaType: "faq",
      }));
    });
  });
});
