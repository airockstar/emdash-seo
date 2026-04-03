import React, { useState, useEffect } from "react";
import { SerpPreview } from "../components/serp-preview.js";
import { CharacterCounter } from "../components/character-counter.js";

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
  };
}

interface SeoOverridesPageProps {
  callRoute: (route: string, input?: unknown) => Promise<unknown>;
  siteUrl: string;
}

export function SeoOverridesPage({ callRoute, siteUrl }: SeoOverridesPageProps) {
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", focusKeyword: "", robots: "", canonical: "" });
  const [filter, setFilter] = useState("");

  useEffect(() => {
    loadOverrides();
  }, []);

  async function loadOverrides() {
    const result = await callRoute("overrides/list", { collection: filter || undefined }) as { items: Override[] };
    setOverrides(result.items ?? []);
  }

  async function save(contentId: string) {
    const override = overrides.find((o) => o.id === contentId);
    await callRoute("overrides/save", {
      contentId,
      collection: override?.data.collection ?? "",
      ...form,
    });
    setEditing(null);
    loadOverrides();
  }

  async function remove(contentId: string) {
    await callRoute("overrides/delete", { contentId });
    loadOverrides();
  }

  function startEdit(override: Override) {
    setEditing(override.id);
    setForm({
      title: override.data.title ?? "",
      description: override.data.description ?? "",
      focusKeyword: override.data.focusKeyword ?? "",
      robots: override.data.robots ?? "",
      canonical: override.data.canonical ?? "",
    });
  }

  return (
    <div>
      <h2>SEO Overrides</h2>

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Filter by collection..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          onBlur={() => loadOverrides()}
        />
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Content ID</th>
            <th>Collection</th>
            <th>Title</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {overrides.map((o) => (
            <tr key={o.id} style={{ borderBottom: "1px solid #eee" }}>
              <td>{o.id}</td>
              <td>{o.data.collection}</td>
              <td>{o.data.title || <em style={{ color: "#999" }}>—</em>}</td>
              <td>{o.data.description?.slice(0, 60) || <em style={{ color: "#999" }}>—</em>}</td>
              <td>
                <button onClick={() => startEdit(o)}>Edit</button>
                <button onClick={() => remove(o.id)} style={{ marginLeft: 8, color: "#d63031" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 4 }}>
          <h3>Edit Override: {editing}</h3>

          <div style={{ marginBottom: 12 }}>
            <label>Title <CharacterCounter value={form.title} min={30} max={60} /></label>
            <input
              type="text" value={form.title} style={{ width: "100%", marginTop: 4 }}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Description <CharacterCounter value={form.description} min={120} max={160} /></label>
            <textarea
              value={form.description} style={{ width: "100%", marginTop: 4, minHeight: 60 }}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Focus Keyword</label>
            <input
              type="text" value={form.focusKeyword} style={{ width: "100%", marginTop: 4 }}
              onChange={(e) => setForm({ ...form, focusKeyword: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Robots</label>
            <input
              type="text" value={form.robots} style={{ width: "100%", marginTop: 4 }}
              placeholder="index, follow"
              onChange={(e) => setForm({ ...form, robots: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label>Canonical URL</label>
            <input
              type="text" value={form.canonical} style={{ width: "100%", marginTop: 4 }}
              onChange={(e) => setForm({ ...form, canonical: e.target.value })}
            />
          </div>

          <h4>SERP Preview</h4>
          <SerpPreview title={form.title} url={form.canonical || siteUrl} description={form.description} />

          <div style={{ marginTop: 16 }}>
            <button onClick={() => save(editing)}>Save</button>
            <button onClick={() => setEditing(null)} style={{ marginLeft: 8 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
