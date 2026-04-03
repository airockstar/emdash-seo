import React, { useState, useEffect } from "react";

interface StatusData {
  total: number;
  missingTitle: number;
  missingDescription: number;
  missingOgImage: number;
  withOverrides: number;
  withoutOverrides: number;
}

interface SeoStatusWidgetProps {
  callRoute: (route: string) => Promise<unknown>;
}

export function SeoStatusWidget({ callRoute }: SeoStatusWidgetProps) {
  const [data, setData] = useState<StatusData | null>(null);

  useEffect(() => {
    callRoute("analytics/status").then((d) => setData(d as StatusData));
  }, []);

  if (!data) return <div>Loading...</div>;

  const items = [
    { label: "Missing title", count: data.missingTitle, color: data.missingTitle > 0 ? "#d63031" : "#00b894" },
    { label: "Missing description", count: data.missingDescription, color: data.missingDescription > 0 ? "#d63031" : "#00b894" },
    { label: "Missing OG image", count: data.missingOgImage, color: data.missingOgImage > 0 ? "#e67700" : "#00b894" },
    { label: "With overrides", count: data.withOverrides, color: "#0984e3" },
  ];

  return (
    <div>
      <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>{data.total} content items</div>
      {items.map((item) => (
        <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
          <span>{item.label}</span>
          <span style={{ fontWeight: 600, color: item.color }}>{item.count}</span>
        </div>
      ))}
    </div>
  );
}
