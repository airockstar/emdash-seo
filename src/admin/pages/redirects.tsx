import React, { useState, useEffect } from "react";
import { ErrorBanner, EmptyState, SeoStyleProvider } from "../components/shared.js";
import { colors } from "../tokens.js";
import { apiFetch } from "../api.js";

interface Redirect {
  id: string;
  data: {
    from: string;
    to: string;
    status: number;
    createdAt?: string;
  };
}

export function RedirectsPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ from: "", to: "", status: 301 });

  useEffect(() => { loadRedirects(); }, []);

  async function loadRedirects() {
    setLoading(true);
    setError("");
    try {
      const result = await apiFetch("redirects/list", {});
      setRedirects(result.items ?? []);
    } catch (e: any) {
      setError(e.message ?? "Failed to load redirects");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    try {
      await apiFetch("redirects/save", {
        id: editing !== "new" ? editing : undefined,
        from: form.from,
        to: form.to,
        status: form.status,
      });
      setEditing(null);
      setForm({ from: "", to: "", status: 301 });
      await loadRedirects();
    } catch (e: any) {
      setError(e.message ?? "Failed to save redirect");
    }
  }

  async function remove(id: string) {
    if (!confirm(`Delete redirect "${id}"?`)) return;
    try {
      await apiFetch("redirects/delete", { id });
      await loadRedirects();
    } catch (e: any) {
      setError(e.message ?? "Failed to delete redirect");
    }
  }

  function startEdit(redirect: Redirect) {
    setEditing(redirect.id);
    setForm({
      from: redirect.data.from,
      to: redirect.data.to,
      status: redirect.data.status,
    });
  }

  function startNew() {
    setEditing("new");
    setForm({ from: "", to: "", status: 301 });
  }

  return (
    <SeoStyleProvider>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>Redirects</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.8125rem", color: colors.textSecondary }}>{redirects.length} redirects</span>
          <button className="seo-btn seo-btn-primary seo-btn-sm" onClick={startNew}>Add Redirect</button>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <div className="seo-empty">Loading redirects...</div>
      ) : redirects.length === 0 && !editing ? (
        <EmptyState title="No redirects" description="Add redirects to manage URL changes and avoid 404 errors." />
      ) : (
        <div className="seo-table-wrap">
          <table className="seo-table">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {redirects.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>{r.data.from}</td>
                  <td>{r.data.to}</td>
                  <td><span className="seo-badge seo-badge-success">{r.data.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="seo-btn seo-btn-secondary seo-btn-sm" onClick={() => startEdit(r)} aria-label={`Edit ${r.id}`}>
                        Edit
                      </button>
                      <button className="seo-btn seo-btn-danger seo-btn-sm" onClick={() => remove(r.id)} aria-label={`Delete ${r.id}`}>
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
        <div className="seo-card seo-fade-in" style={{ marginTop: 24 }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.borderSubtle}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600 }}>
              {editing === "new" ? "New Redirect" : `Editing: ${editing}`}
            </h3>
            <button className="seo-btn seo-btn-secondary seo-btn-sm" onClick={() => setEditing(null)}>Close</button>
          </div>
          <div className="seo-card-body">
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label htmlFor="redirect-from" className="seo-label">From Path</label>
                <input id="redirect-from" className="seo-input" type="text" value={form.from}
                  onChange={(e) => setForm({ ...form, from: e.target.value })} placeholder="/old-path" />
              </div>
              <div>
                <label htmlFor="redirect-to" className="seo-label">To Path</label>
                <input id="redirect-to" className="seo-input" type="text" value={form.to}
                  onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="/new-path" />
              </div>
              <div>
                <label htmlFor="redirect-status" className="seo-label">Status Code</label>
                <select id="redirect-status" className="seo-input" value={form.status}
                  onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}>
                  <option value={301}>301 (Permanent)</option>
                  <option value={302}>302 (Temporary)</option>
                  <option value={307}>307 (Temporary Preserve Method)</option>
                  <option value={308}>308 (Permanent Preserve Method)</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="seo-btn seo-btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="seo-btn seo-btn-primary" onClick={save}>Save Redirect</button>
            </div>
          </div>
        </div>
      )}
    </SeoStyleProvider>
  );
}
