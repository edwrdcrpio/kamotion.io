"use client";

import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";

// Stub surface for /try/settings and /try/settings/users. Admin-only real
// pages configure AI provider keys + seat management — demo visitors don't
// need that, and exposing their shape in a sandbox adds no value.
export function LockedPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-foreground">{title}</h2>
        <p className="mb-6 text-sm text-muted-foreground">{description}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Back to home
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
