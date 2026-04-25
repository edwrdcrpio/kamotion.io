export type DocsSection = {
  id: string;
  label: string;
};

export const DOCS_SECTIONS: DocsSection[] = [
  { id: "introduction", label: "Introduction" },
  { id: "concepts", label: "Core concepts" },
  { id: "getting-started", label: "Getting started" },
  { id: "generate", label: "Generate tasks" },
  { id: "board", label: "Board" },
  { id: "gantt", label: "Gantt" },
  { id: "team", label: "Team" },
  { id: "users", label: "Users" },
  { id: "archive", label: "Archive" },
  { id: "ai-config", label: "AI configuration" },
  { id: "n8n-path", label: "n8n path" },
  { id: "deployment", label: "Deployment" },
  { id: "free-self-host", label: "Run it for $0" },
  { id: "hosted-access", label: "Hosted access" },
  { id: "tech-stack", label: "Tech stack" },
  { id: "contributing", label: "Contributing" },
  { id: "faq", label: "FAQ" },
];
