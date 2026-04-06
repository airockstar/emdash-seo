import React, { useState, useEffect } from "react";
import { Skeleton } from "../components/shared.js";
import { colors } from "../tokens.js";
import { apiFetch } from "../api.js";

interface StatusData {
  total: number;
  missingTitle: number;
  missingDescription: number;
  missingOgImage: number;
  withOverrides: number;
  withoutOverrides: number;
}

export function SeoStatusWidget() {
  const [data, setData] = useState<StatusData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiFetch("analytics/status")
      .then(async (res) => {
        const d = await res.json();
        setData(d as StatusData);
      })
      .catch(() => setError(true));
  }, []);

  if (error) return <div style={{ color: colors.errorText, fontSize: "0.8125rem" }}>Failed to load status.</div>;

  if (!data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[70, 80, 90, 60].map((w, i) => (
          <Skeleton key={i} width={`${w}%`} height={20} />
        ))}
      </div>
    );
  }

  const items = [
    { label: "Missing title", count: data.missingTitle, bad: data.missingTitle > 0 },
    { label: "Missing description", count: data.missingDescription, bad: data.missingDescription > 0 },
    { label: "Missing OG image", count: data.missingOgImage, bad: data.missingOgImage > 0 },
    { label: "With SEO overrides", count: data.withOverrides, bad: false },
  ];

  return (
    <div>
      <div style={{ fontSize: "0.75rem", color: colors.textSecondary, marginBottom: 12 }}>
        {data.total} content items total
      </div>
      {items.map((item) => (
        <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${colors.borderSubtle}` }}>
          <span style={{ fontSize: "0.8125rem", color: colors.textBody }}>{item.label}</span>
          <span className={`seo-badge ${item.bad ? "seo-badge-error" : "seo-badge-success"}`}>
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}
