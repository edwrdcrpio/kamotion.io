"use client";

import { useEffect, useState } from "react";
import type { DocsSection } from "@/config/docs-sections";

export function DocsToc({
  sections,
  onNavigate,
}: {
  sections: DocsSection[];
  onNavigate?: () => void;
}) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const ids = sections.map((s) => s.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      {
        rootMargin: "-80px 0px -65% 0px",
        threshold: [0, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="On this page">
      <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        On this page
      </h4>
      <ul className="mt-4 flex flex-col gap-0.5 border-l border-border">
        {sections.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={onNavigate}
                className={`-ml-px block border-l py-1.5 pl-4 text-sm transition-colors cursor-pointer ${
                  isActive
                    ? "border-primary font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
