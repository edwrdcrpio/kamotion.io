import { Star } from "lucide-react";
import { brand } from "@/config/brand";

// Renders a "Star on GitHub" callout when brand.github is set. Returns null
// otherwise so the UI just goes away while the repo is still private.
export function GithubStar({
  variant = "pill",
}: {
  variant?: "pill" | "link" | "header";
}) {
  const href = brand.github;
  if (!href) return null;

  if (variant === "link") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <Star className="h-3.5 w-3.5" />
        Star on GitHub
      </a>
    );
  }

  if (variant === "header") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Star kamotion on GitHub"
        className="hidden h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer md:inline-flex"
      >
        <Star className="h-3.5 w-3.5" />
        Star
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent cursor-pointer"
    >
      <Star className="h-4 w-4" />
      Star on GitHub
      <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        Kamotion
      </span>
    </a>
  );
}
