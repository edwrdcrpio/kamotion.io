import Link from "next/link";
import { brand } from "@/config/brand";
import { KamotionWordmark } from "@/components/brand/kamotion-wordmark";
import { GithubStar } from "@/components/marketing/github-star";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/20 px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <Link
            href="/"
            className="flex items-center cursor-pointer"
            aria-label="kamotion home"
          >
            <KamotionWordmark className="h-7 w-auto text-foreground" />
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            From scattered messages to organized work. Built for people running
            on too many channels.
          </p>
          <div className="mt-4">
            <GithubStar variant="link" />
          </div>
        </div>

        <FooterCol
          title="Product"
          links={[
            { label: "How it works", href: "/#how" },
            { label: "Features", href: "/#features" },
            { label: "Try the demo", href: "/try" },
            { label: "Docs", href: "/docs" },
            { label: "Log in", href: "/login" },
          ]}
        />
        <FooterCol
          title="Use cases"
          links={[
            { label: "Meeting follow-ups", href: "/#how" },
            { label: "Client handoffs", href: "/#who" },
            { label: "Slack cleanup", href: "/#features" },
            { label: "Solo operators", href: "/#who" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { label: "Origin", href: "/#origin" },
            { label: "Docs", href: "/docs" },
            { label: "Contact", href: `mailto:hello@${brand.domain}` },
            {
              label: brand.github ? "GitHub" : "GitHub (soon)",
              href: brand.github ?? "#",
            },
          ]}
        />
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
        <span className="font-mono uppercase tracking-[0.15em]">
          © {new Date().getFullYear()} kamotion
        </span>
        <span>Made for people who live in the commotion.</span>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
        {title}
      </h4>
      <ul className="mt-4 flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
