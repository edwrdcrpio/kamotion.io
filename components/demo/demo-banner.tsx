"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { ACCESS_EMAIL } from "@/components/marketing/site-nav";

export function DemoBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="sticky top-0 z-40 border-b border-primary/30 bg-primary/10 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 text-[13px] sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
          Demo mode
        </span>
        <p className="flex-1 text-muted-foreground">
          <span className="hidden sm:inline">Nothing saves · </span>
          Refresh to reset.
        </p>
        <Link
          href="/"
          className="hidden items-center gap-1 rounded-md border border-border/60 bg-background/70 px-2.5 py-1 text-[12px] font-medium text-foreground transition-colors hover:bg-background sm:inline-flex"
        >
          Exit demo
        </Link>
        <a
          href={ACCESS_EMAIL}
          className="hidden items-center gap-1 rounded-md border border-primary/40 bg-background/70 px-2.5 py-1 text-[12px] font-medium text-foreground transition-colors hover:bg-background sm:inline-flex"
        >
          Request access
          <ArrowRight className="h-3 w-3" />
        </a>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/20 hover:text-foreground"
          aria-label="Dismiss demo banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
