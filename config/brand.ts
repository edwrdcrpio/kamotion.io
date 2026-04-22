export const brand = {
  name: "kamotion",
  domain: "kamotion.io",
  tagline: "From scattered messages to organized work.",
  description:
    "kamotion turns Slack threads, email chains, Zoom transcripts, and meeting notes into structured kanban cards. Paste the noise. AI does the parsing. You do the work.",
  palette: {
    primary: "#6366F1",
    primaryDeep: "#4338CA",
    success: "#10B981",
    accent: "#F43F5E",
    warning: "#F59E0B",
    bgLight: "#F8FAFC",
    bgDark: "#0B1020",
  },
} as const;

export type Brand = typeof brand;
