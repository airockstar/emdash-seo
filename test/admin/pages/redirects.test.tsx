import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RedirectsPage } from "../../../src/admin/pages/redirects.js";
import { apiFetch } from "../../../src/admin/api.js";

vi.mock("../../../src/admin/api.js", () => ({
  apiFetch: vi.fn(),
}));

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

const MOCK_REDIRECTS = [
  {
    id: "r-1",
    data: { from: "/old-blog", to: "/blog", status: 301, createdAt: "2024-01-01T00:00:00Z" },
  },
  {
    id: "r-2",
    data: { from: "/legacy", to: "/new", status: 302, createdAt: "2024-01-02T00:00:00Z" },
  },
];

function mockListResponse(items = MOCK_REDIRECTS) {
  mockApiFetch.mockResolvedValue(new Response(JSON.stringify({ items })));
}

function mockPendingResponse() {
  mockApiFetch.mockReturnValue(new Promise(() => {}));
}

describe("RedirectsPage", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
    mockListResponse();
  });

  it("shows loading state initially", () => {
    mockPendingResponse();
    render(<RedirectsPage />);
    expect(screen.getByText("Loading redirects...")).toBeDefined();
  });

  it("renders table with redirects after loading", async () => {
    render(<RedirectsPage />);
    await waitFor(() => {
      expect(screen.getByText("/old-blog")).toBeDefined();
    });
    expect(screen.getByText("/blog")).toBeDefined();
    expect(screen.getByText("301")).toBeDefined();
    expect(screen.getByText("/legacy")).toBeDefined();
    expect(screen.getByText("/new")).toBeDefined();
    expect(screen.getByText("302")).toBeDefined();
  });

  it("shows empty state when no redirects", async () => {
    mockListResponse([]);
    render(<RedirectsPage />);
    await waitFor(() => {
      expect(screen.getByText("No redirects")).toBeDefined();
    });
  });

  it("shows redirect count", async () => {
    render(<RedirectsPage />);
    await waitFor(() => {
      expect(screen.getByText("2 redirects")).toBeDefined();
    });
  });

  it("has Add Redirect button", async () => {
    render(<RedirectsPage />);
    await waitFor(() => {
      expect(screen.getByText("Add Redirect")).toBeDefined();
    });
  });

  it("clicking Add Redirect shows new form", async () => {
    render(<RedirectsPage />);
    await waitFor(() => {
      expect(screen.getByText("/old-blog")).toBeDefined();
    });
    fireEvent.click(screen.getByText("Add Redirect"));
    expect(screen.getByText("New Redirect")).toBeDefined();
    expect(screen.getByLabelText("From Path")).toBeDefined();
    expect(screen.getByLabelText("To Path")).toBeDefined();
    expect(screen.getByLabelText("Status Code")).toBeDefined();
  });

  it("clicking Edit opens edit form with data", async () => {
    render(<RedirectsPage />);
    await waitFor(() => {
      expect(screen.getByText("/old-blog")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Edit r-1"));
    expect(screen.getByText("Editing: r-1")).toBeDefined();
    expect((screen.getByLabelText("From Path") as HTMLInputElement).value).toBe("/old-blog");
    expect((screen.getByLabelText("To Path") as HTMLInputElement).value).toBe("/blog");
  });

  it("Save Redirect calls redirects/save", async () => {
    render(<RedirectsPage />);
    await waitFor(() => {
      expect(screen.getByText("/old-blog")).toBeDefined();
    });
    fireEvent.click(screen.getByText("Add Redirect"));

    fireEvent.change(screen.getByLabelText("From Path"), { target: { value: "/test-old" } });
    fireEvent.change(screen.getByLabelText("To Path"), { target: { value: "/test-new" } });
    fireEvent.click(screen.getByText("Save Redirect"));

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith("redirects/save", {
        id: undefined,
        from: "/test-old",
        to: "/test-new",
        status: 301,
      });
    });
  });

  it("Delete button shows confirm dialog", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<RedirectsPage />);
    await waitFor(() => {
      expect(screen.getByText("/old-blog")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Delete r-1"));
    expect(confirmSpy).toHaveBeenCalledWith('Delete redirect "r-1"?');
  });

  it("Delete calls redirects/delete when confirmed", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<RedirectsPage />);
    await waitFor(() => {
      expect(screen.getByText("/old-blog")).toBeDefined();
    });
    fireEvent.click(screen.getByLabelText("Delete r-1"));
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith("redirects/delete", { id: "r-1" });
    });
  });

  it("Cancel closes the form", async () => {
    render(<RedirectsPage />);
    await waitFor(() => {
      expect(screen.getByText("/old-blog")).toBeDefined();
    });
    fireEvent.click(screen.getByText("Add Redirect"));
    expect(screen.getByText("New Redirect")).toBeDefined();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("New Redirect")).toBeNull();
  });

  it("table has proper column headers", async () => {
    render(<RedirectsPage />);
    await waitFor(() => {
      expect(screen.getByText("/old-blog")).toBeDefined();
    });
    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(4);
    expect(headers[0].textContent).toBe("From");
    expect(headers[1].textContent).toBe("To");
    expect(headers[2].textContent).toBe("Status");
    expect(headers[3].textContent).toBe("Actions");
  });

  it("page heading is rendered", () => {
    mockPendingResponse();
    render(<RedirectsPage />);
    expect(screen.getByText("Redirects")).toBeDefined();
  });
});
