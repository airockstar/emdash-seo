export const colors = {
  bgPrimary: "#ffffff",
  bgSecondary: "#f9fafb",
  bgTertiary: "#f3f4f6",

  borderDefault: "#e5e7eb",
  borderSubtle: "#f3f4f6",
  borderFocus: "#6366f1",

  textPrimary: "#111827",
  textSecondary: "#6b7280",
  textTertiary: "#9ca3af",
  textBody: "#374151",
  textInverse: "#ffffff",

  success: "#10b981",
  successBg: "#ecfdf5",
  successText: "#065f46",
  warning: "#f59e0b",
  warningBg: "#fffbeb",
  warningText: "#92400e",
  error: "#ef4444",
  errorBg: "#fef2f2",
  errorBorder: "#fecaca",
  errorText: "#991b1b",

  accent: "#6366f1",
  accentHover: "#4f46e5",

  serpTitle: "#1a0dab",
  serpUrl: "#4d5156",
  serpDesc: "#4d5156",

  scoreGood: "#10b981",
  scoreFair: "#f59e0b",
  scorePoor: "#ef4444",
} as const;

export const spacing = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  12: "3rem",
} as const;

export const fontSize = {
  xs: "0.75rem",
  sm: "0.8125rem",
  base: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
} as const;

export const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const radius = {
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  full: "9999px",
} as const;

export const shadow = {
  sm: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
  md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
  ring: "0 0 0 3px rgba(99,102,241,0.15)",
} as const;
