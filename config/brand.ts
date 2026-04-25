export const brand = {
  name: "kamotion",
  domain: "kamotion.io",
  // Flip to the real URL when the repo goes public to activate the
  // "Star on GitHub" callouts in the footer and homepage CTA section.
  github: "https://github.com/edwrdcrpio/kamotion.io" as string | null,
  tagline: "From scattered messages to organized work.",
  description:
    "kamotion turns Slack threads, email chains, Zoom transcripts, and meeting notes into structured kanban cards. Paste the noise. AI does the parsing. You do the work.",
  palette: {
    primary: "#14b8a6",
    primaryDeep: "#0d9488",
    secondary: "#a4a3a3",
    success: "#10b981",
    accent: "#f43f5e",
    warning: "#f59e0b",
    bgLight: "#f8fafc",
    bgDark: "#0b1020",
  },
} as const;

export type Brand = typeof brand;
