export const brand = {
  name: "Kamotion",
  domain: "kamotion.io",
  tagline: "Turn the commotion into clarity.",
  description:
    "Paste in the chaos — emails, messages, meeting notes — and get back a kanban board you can actually ship from.",
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
