import type { ReactNode } from "react";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { DocsToc } from "@/components/docs/docs-toc";
import { DocsMobileToc } from "@/components/docs/docs-mobile-toc";
import { DOCS_SECTIONS } from "@/config/docs-sections";

const NAV_LINKS = [
  { label: "How it works", href: "/#how" },
  { label: "Features", href: "/#features" },
  { label: "Who it's for", href: "/#who" },
  { label: "Origin", href: "/#origin" },
  { label: "Docs", href: "/docs" },
];

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNav links={NAV_LINKS} />

      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <aside className="hidden w-64 shrink-0 border-r border-border/60 lg:block">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto px-6 py-10">
            <DocsToc sections={DOCS_SECTIONS} />
          </div>
        </aside>

        <DocsMobileToc sections={DOCS_SECTIONS} />

        <main className="min-w-0 flex-1 px-6 py-10 lg:px-12 lg:py-14">
          <article className="mx-auto w-full max-w-3xl">{children}</article>
        </main>
      </div>

      <SiteFooter />
    </>
  );
}
