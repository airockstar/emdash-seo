export const SETTINGS_SCHEMA = {
  siteName: { type: "string" as const, label: "Site Name", default: "" },
  titleTemplate: {
    type: "string" as const,
    label: "Title Template",
    default: "{title} | {site}",
  },
  titleSeparator: {
    type: "select" as const,
    label: "Title Separator",
    options: [
      { value: "|", label: "|" },
      { value: "-", label: "-" },
      { value: "\u2014", label: "\u2014" },
      { value: "\u00B7", label: "\u00B7" },
    ],
    default: "|",
  },
  defaultOgImage: { type: "string" as const, label: "Default OG Image URL", default: "" },
  twitterHandle: { type: "string" as const, label: "Twitter @handle", default: "" },
  orgName: { type: "string" as const, label: "Organization Name", default: "" },
  orgLogoUrl: { type: "string" as const, label: "Organization Logo URL", default: "" },
  defaultRobots: {
    type: "string" as const,
    label: "Default Robots Directive",
    default: "index, follow",
  },
  googleAnalyticsId: {
    type: "string" as const,
    label: "Google Analytics ID (e.g. G-XXXXXXX)",
    default: "",
  },
  googleVerification: {
    type: "string" as const,
    label: "Google Site Verification Code",
    default: "",
  },
};
