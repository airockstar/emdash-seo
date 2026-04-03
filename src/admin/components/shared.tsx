import React from "react";
import { colors } from "../tokens.js";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="seo-empty">
      <div style={{ fontSize: "1rem", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: fontSize.sm }}>{description}</div>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="seo-fade-in" role="alert"
      style={{
        padding: "12px 16px", background: colors.errorBg,
        border: `1px solid ${colors.errorBorder}`, borderRadius: "0.375rem",
        color: colors.errorText, marginBottom: 16, fontSize: fontSize.sm,
      }}
    >
      {message}
    </div>
  );
}

export function Skeleton({ width, height, circle }: { width: number | string; height: number | string; circle?: boolean }) {
  return (
    <div
      className="seo-skeleton"
      style={{ width, height, borderRadius: circle ? "50%" : "0.25rem" }}
    />
  );
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 3) + "..." : str;
}

export function parseDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

const fontSize = { sm: "0.8125rem" };
