import React, { useState, useEffect, useRef } from "react";
import { SerpPreview } from "../components/serp-preview.js";
import { SocialPreview } from "../components/social-preview.js";
import { CharacterCounter } from "../components/character-counter.js";
import { EmptyState, ErrorBanner, SeoStyleProvider } from "../components/shared.js";
import { colors } from "../tokens.js";
import { apiFetch } from "../api.js";
import { apiFetch as baseFetch } from "emdash/plugin-utils";
import { loadAllContent } from "../utils/content-loader.js";
import type { ContentItem } from "../utils/content-loader.js";

interface Override {
  id: string;
  data: {
    contentId: string;
    collection?: string;
    title?: string;
    description?: string;
    ogImage?: string;
    robots?: string;
    canonical?: string;
    focusKeyword?: string;
    schemaType?: string;
    breadcrumbLabel?: string;
  };
}

export function SeoOverridesPage() {
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", focusKeyword: "", robots: "", canonical: "", ogImage: "", schemaType: "", breadcrumbLabel: "" });
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [showContentPicker, setShowContentPicker] = useState(false);
  const lastFilterRef = useRef("");
  const editRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadOverrides(); }, []);

  async function loadOverrides() {
    setLoading(true);
    setError("");
    try {
      const result = await apiFetch("overrides/list", { collection: filter || undefined });
      setOverrides(result.items ?? []);
    } catch (e: any) {
      setError(e.message ?? "Failed to load overrides");
    } finally {
      setLoading(false);
    }
  }

  async function save(contentId: string) {
    try {
      const override = overrides.find((o) => o.id === contentId);
      const collection = override?.data.collection ?? "";
      const { schemaType, breadcrumbLabel, ...rest } = form;
      const saveOverride = apiFetch("overrides/save", { contentId, collection, ...rest, schemaType: schemaType || undefined, breadcrumbLabel: breadcrumbLabel || undefined });

      // Sync to Emdash's native SEO table so overrides appear in page source
      const syncSeo = collection
        ? baseFetch(`/_emdash/api/content/${collection}/${contentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              seo: {
                title: form.title || undefined,
                description: form.description || undefined,
                image: form.ogImage || undefined,
                canonical: form.canonical || undefined,
                robots: form.robots || undefined,
              },
            }),
          }).catch(() => {})
        : Promise.resolve();

      await Promise.all([saveOverride, syncSeo]);

      setEditing(null);
      loadOverrides();
    } catch (e: any) {
      setError(e.message ?? "Failed to save");
    }
  }

  async function remove(contentId: string) {
    if (!confirm(`Delete SEO overrides for "${contentId}"?`)) return;
    try {
      await apiFetch("overrides/delete", { contentId });
      loadOverrides();
    } catch (e: any) {
      setError(e.message ?? "Failed to delete");
    }
  }

  function startEdit(override: Override) {
    setEditing(override.id);
    setForm({
      title: override.data.title ?? "",
      description: override.data.description ?? "",
      focusKeyword: override.data.focusKeyword ?? "",
      robots: override.data.robots ?? "",
      canonical: override.data.canonical ?? "",
      ogImage: override.data.ogImage ?? "",
      schemaType: override.data.schemaType ?? "",
      breadcrumbLabel: override.data.breadcrumbLabel ?? "",
    });
    setTimeout(() => editRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
  }

  async function exportCsv() {
    try {
      const result = await apiFetch("overrides/export");
      const blob = new Blob([result.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "seo-overrides.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message ?? "Export failed");
    }
  }

  async function importCsv(file: File) {
    try {
      const csv = await file.text();
      const result = await apiFetch("overrides/import", { csv });
      if (result.error) {
        setError(result.message ?? result.error);
      } else {
        loadOverrides();
      }
    } catch (e: any) {
      setError(e.message ?? "Import failed");
    }
  }

  function handleFilterKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { lastFilterRef.current = filter; loadOverrides(); }
  }

  function handleFilterBlur() {
    if (filter !== lastFilterRef.current) { lastFilterRef.current = filter; loadOverrides(); }
  }

  async function openContentPicker() {
    if (allContent.length === 0) {
      const items = await loadAllContent();
      setAllContent(items);
    }
    setShowContentPicker(true);
  }

  function selectContentForOverride(item: ContentItem) {
    setShowContentPicker(false);
    setEditing(item.id);
    setForm({ title: "", description: "", focusKeyword: "", robots: "", canonical: "", ogImage: "", schemaType: "", breadcrumbLabel: "" });
    // Ensure the override exists for save
    if (!overrides.find((o) => o.id === item.id)) {
      setOverrides((prev) => [...prev, { id: item.id, data: { contentId: item.id, collection: item.collection } }]);
    }
    setTimeout(() => editRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
  }

  return (
    <SeoStyleProvider>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>SEO Overrides</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.8125rem", color: colors.textSecondary }}>{overrides.length} items</span>
          <button className="seo-btn seo-btn-primary seo-btn-sm" onClick={openContentPicker}>Add Override</button>
          <button className="seo-btn seo-btn-secondary seo-btn-sm" onClick={exportCsv}>CSV Export</button>
          <button className="seo-btn seo-btn-secondary seo-btn-sm" onClick={() => fileInputRef.current?.click()}>CSV Import (Pro)</button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importCsv(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <div style={{ marginBottom: 16 }}>
        <input
          className="seo-input"
          type="text"
          placeholder="Filter by collection..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          onKeyDown={handleFilterKeyDown}
          onBlur={handleFilterBlur}
          aria-label="Filter overrides by collection"
        />
      </div>

      {showContentPicker && (
        <div className="seo-card seo-fade-in" style={{ marginBottom: 16 }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.borderSubtle}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600 }}>Select content to add SEO override</h3>
            <button className="seo-btn seo-btn-secondary seo-btn-sm" onClick={() => setShowContentPicker(false)}>Cancel</button>
          </div>
          <div className="seo-card-body" style={{ maxHeight: 300, overflow: "auto" }}>
            {allContent.length === 0 ? (
              <p style={{ color: colors.textSecondary, fontSize: "0.8125rem" }}>Loading content...</p>
            ) : (
              allContent
                .filter((item) => !overrides.some((o) => o.id === item.id))
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => selectContentForOverride(item)}
                    style={{
                      padding: "8px 0",
                      borderBottom: `1px solid ${colors.borderSubtle}`,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: colors.textBody }}>{item.title}</span>
                    <span className="seo-badge seo-badge-success">{item.collection}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="seo-empty">Loading overrides...</div>
      ) : overrides.length === 0 && !showContentPicker ? (
        <EmptyState title="No overrides yet" description="Click 'Add Override' above to set custom SEO titles, descriptions, and more for your content." />
      ) : (
        <div className="seo-table-wrap">
          <table className="seo-table">
            <thead>
              <tr>
                <th>Content</th>
                <th>Collection</th>
                <th>Title Override</th>
                <th>Description</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {overrides.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 500 }}>{o.id}</td>
                  <td><span className="seo-badge seo-badge-success">{o.data.collection ?? "—"}</span></td>
                  <td>{o.data.title || <em style={{ color: colors.textTertiary }}>Not set</em>}</td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {o.data.description?.slice(0, 60) || <em style={{ color: colors.textTertiary }}>Not set</em>}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="seo-btn seo-btn-secondary seo-btn-sm" onClick={() => startEdit(o)} aria-label={`Edit ${o.id}`}>
                        Edit
                      </button>
                      <button className="seo-btn seo-btn-danger seo-btn-sm" onClick={() => remove(o.id)} aria-label={`Delete ${o.id}`}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div ref={editRef} className="seo-card seo-fade-in" style={{ marginTop: 24 }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.borderSubtle}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600 }}>Editing: {editing}</h3>
            <button className="seo-btn seo-btn-secondary seo-btn-sm" onClick={() => setEditing(null)}>Close</button>
          </div>
          <div className="seo-card-body">
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label htmlFor="seo-title" className="seo-label">
                  Title <CharacterCounter value={form.title} min={30} max={60} fieldName="title" />
                </label>
                <input id="seo-title" className="seo-input" type="text" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Page title for search engines" />
              </div>
              <div>
                <label htmlFor="seo-desc" className="seo-label">
                  Description <CharacterCounter value={form.description} min={120} max={160} fieldName="description" />
                </label>
                <textarea id="seo-desc" className="seo-input seo-textarea" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Meta description for search results" />
              </div>
              <div>
                <label htmlFor="seo-ogimage" className="seo-label">OG Image URL</label>
                <input id="seo-ogimage" className="seo-input" type="text" value={form.ogImage}
                  onChange={(e) => setForm({ ...form, ogImage: e.target.value })} placeholder="https://..." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label htmlFor="seo-keyword" className="seo-label">Focus Keyword</label>
                  <input id="seo-keyword" className="seo-input" type="text" value={form.focusKeyword}
                    onChange={(e) => setForm({ ...form, focusKeyword: e.target.value })} placeholder="e.g. seo plugin" />
                </div>
                <div>
                  <label htmlFor="seo-robots" className="seo-label">Robots</label>
                  <input id="seo-robots" className="seo-input" type="text" value={form.robots}
                    onChange={(e) => setForm({ ...form, robots: e.target.value })} placeholder="index, follow" />
                </div>
              </div>
              <div>
                <label htmlFor="seo-canonical" className="seo-label">Canonical URL</label>
                <input id="seo-canonical" className="seo-input" type="text" value={form.canonical}
                  onChange={(e) => setForm({ ...form, canonical: e.target.value })} placeholder="https://..." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label htmlFor="seo-schema-type" className="seo-label">Schema Type</label>
                  <select id="seo-schema-type" className="seo-input" value={form.schemaType}
                    onChange={(e) => setForm({ ...form, schemaType: e.target.value })}>
                    <option value="">None (auto-detect)</option>
                    <option value="faq">FAQ</option>
                    <option value="howto">How-To</option>
                    <option value="product">Product</option>
                    <option value="localBusiness">Local Business</option>
                    <option value="event">Event</option>
                    <option value="recipe">Recipe</option>
                    <option value="video">Video</option>
                    <option value="course">Course</option>
                    <option value="software">Software</option>
                    <option value="book">Book</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="seo-breadcrumb" className="seo-label">Breadcrumb Label</label>
                  <input id="seo-breadcrumb" className="seo-input" type="text" value={form.breadcrumbLabel}
                    onChange={(e) => setForm({ ...form, breadcrumbLabel: e.target.value })} placeholder="Custom breadcrumb text" />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <h4 style={{ fontSize: "0.8125rem", fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                Search Preview
              </h4>
              <SerpPreview title={form.title} url={form.canonical || ""} description={form.description} />
            </div>

            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: "0.8125rem", fontWeight: 600, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                Social Preview
              </h4>
              <SocialPreview title={form.title} description={form.description} image={form.ogImage} url={form.canonical || ""} platform="facebook" />
            </div>

            <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="seo-btn seo-btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="seo-btn seo-btn-primary" onClick={() => save(editing)}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </SeoStyleProvider>
  );
}
