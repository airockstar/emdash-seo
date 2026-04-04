import React, { useState, useEffect, useCallback } from "react";
import { CharacterCounter } from "../components/character-counter.js";
import { SerpPreview } from "../components/serp-preview.js";
import { colors, fontSize } from "../tokens.js";

export interface SeoFieldsWidgetProps {
  callRoute: (route: string, input?: unknown) => Promise<unknown>;
  contentId: string;
  collection: string;
  siteUrl: string;
}

interface FieldData {
  title: string;
  description: string;
  focusKeyword: string;
}

export function SeoFieldsWidget({ callRoute, contentId, collection, siteUrl }: SeoFieldsWidgetProps) {
  const [fields, setFields] = useState<FieldData>({ title: "", description: "", focusKeyword: "" });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    callRoute("overrides/get", { contentId })
      .then((res: any) => {
        if (res?.overrides) {
          setFields({
            title: res.overrides.title ?? "",
            description: res.overrides.description ?? "",
            focusKeyword: res.overrides.focusKeyword ?? "",
          });
        }
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, [contentId]);

  const handleChange = useCallback((field: keyof FieldData, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
    setMessage(null);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    try {
      await callRoute("overrides/save", {
        contentId,
        collection,
        title: fields.title || undefined,
        description: fields.description || undefined,
        focusKeyword: fields.focusKeyword || undefined,
      });
      setMessage({ type: "success", text: "SEO fields saved" });
    } catch {
      setMessage({ type: "error", text: "Failed to save SEO fields" });
    } finally {
      setSaving(false);
    }
  }, [callRoute, contentId, collection, fields]);

  if (!loaded) {
    return <div style={{ padding: 16, color: colors.textTertiary, fontSize: fontSize.sm }}>Loading SEO fields...</div>;
  }

  return (
    <div className="seo-plugin seo-fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <label className="seo-label" htmlFor="seo-field-title" style={{ marginBottom: 0 }}>SEO Title</label>
          <CharacterCounter value={fields.title} min={30} max={60} fieldName="SEO Title" />
        </div>
        <input
          id="seo-field-title"
          className="seo-input"
          type="text"
          placeholder="Enter SEO title..."
          value={fields.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <label className="seo-label" htmlFor="seo-field-description" style={{ marginBottom: 0 }}>Meta Description</label>
          <CharacterCounter value={fields.description} min={120} max={160} fieldName="Meta Description" />
        </div>
        <textarea
          id="seo-field-description"
          className="seo-input seo-textarea"
          placeholder="Enter meta description..."
          value={fields.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      <div>
        <label className="seo-label" htmlFor="seo-field-keyword">Focus Keyword</label>
        <input
          id="seo-field-keyword"
          className="seo-input"
          type="text"
          placeholder="Enter focus keyword..."
          value={fields.focusKeyword}
          onChange={(e) => handleChange("focusKeyword", e.target.value)}
        />
      </div>

      <div>
        <div style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 8, fontWeight: 500 }}>
          Search Preview
        </div>
        <SerpPreview
          title={fields.title}
          url={siteUrl}
          description={fields.description}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          className="seo-btn seo-btn-primary"
          disabled={saving}
          onClick={handleSave}
          type="button"
        >
          {saving ? "Saving..." : "Save SEO"}
        </button>
        {message && (
          <span style={{
            fontSize: fontSize.sm,
            color: message.type === "success" ? colors.successText : colors.errorText,
          }}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}
