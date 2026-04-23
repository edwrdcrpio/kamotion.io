import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { brand } from "@/config/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileLandingNav } from "@/components/marketing/mobile-landing-nav";
import { KamotionWordmark } from "@/components/brand/kamotion-wordmark";

const ACCESS_EMAIL = `mailto:hello@${brand.domain}?subject=kamotion access request`;

export type SiteNavLink = { label: string; href: string };

const HOME_LINKS: SiteNavLink[] = [
  { label: "How it works", href: "/#how" },
  { label: "Features", href: "/#features" },
  { label: "Who it's for", href: "/#who" },
  { label: "Docs", href: "/docs" },
  { label: "Try it", href: "/try" },
];

export function SiteNav({ links = HOME_LINKS }: { links?: SiteNavLink[] }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center cursor-pointer"
          aria-label="kamotion home"
        >
          <KamotionWordmark className="h-8 sm:h-10 w-auto text-foreground" />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden h-9 items-center justify-center rounded-md px-3 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer md:inline-flex"
          >
            Log in
          </Link>
          <a
            href={ACCESS_EMAIL}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-foreground px-3.5 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/90 cursor-pointer"
          >
            Request access
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
          <MobileLandingNav accessEmail={ACCESS_EMAIL} links={links} />
        </div>
      </div>
    </header>
  );
}

export { ACCESS_EMAIL };
