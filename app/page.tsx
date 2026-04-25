import Link from "next/link";
import {
  ArrowRight,
  ClipboardPaste,
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Mail,
  Video,
  Phone,
  FileText,
  Hash,
  ListChecks,
  Briefcase,
  Users2,
  Check,
  GitBranch,
  Server,
  Code2,
  Workflow,
  Unlock,
} from "lucide-react";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { GithubStar } from "@/components/marketing/github-star";
import { ConversationsAccordion } from "@/components/marketing/conversations-accordion";
import { ImageComparison } from "@/components/ui/image-comparison-slider";
import { FeatureCard } from "@/components/blocks/grid-feature-cards";
import {
  FeatureGridContainer,
  FeatureGridItem,
} from "@/components/marketing/feature-grid";
import { HostedContactForm } from "@/components/marketing/hosted-contact";
import { RoadmapFlow } from "@/components/marketing/roadmap-flow";
import { Reveal } from "@/components/marketing/reveal";
import { brand } from "@/config/brand";

const HOME_NAV_LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Use cases", href: "#features" },
  { label: "Docs", href: "/docs" },
  { label: "Demo", href: "/try" },
];

export default function Home() {
  return (
    <>
      <PromoBar />
      <SiteNav links={HOME_NAV_LINKS} />

      <main className="flex flex-col">
        <Hero />
        <Reveal>
          <ChannelStrip />
        </Reveal>
        <Reveal>
          <HowItWorks />
        </Reveal>
        <Reveal>
          <ConversationsAccordion />
        </Reveal>
        <Reveal>
          <Transformation />
        </Reveal>
        <Reveal>
          <Personas />
        </Reveal>
        <Reveal>
          <OpenSource />
        </Reveal>
        <Reveal>
          <NonTechnicals />
        </Reveal>
        <Reveal>
          <ComingSoon />
        </Reveal>
        <Reveal>
          <FooterCTA />
        </Reveal>
      </main>

      <SiteFooter />
    </>
  );
}

/* ----------------------------- PROMO BAR ----------------------------- */

function PromoBar() {
  return (
    <div className="bg-neutral-950 text-neutral-50 dark:border-b dark:border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-6 py-2 text-xs sm:flex-row sm:gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-0.5 font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
          Live demo
        </span>
        <span className="text-neutral-400">
          Play with the real app in your browser — no signup.
        </span>
        <Link
          href="/try"
          className="inline-flex items-center gap-1 font-medium text-neutral-50 underline-offset-2 hover:underline"
        >
          Try the demo
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------- HERO -------------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-24 sm:pt-28">
      <MessToBoardBackdrop />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          The commotion killer
        </span>

        <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          From scattered messages to{" "}
          <span className="relative inline-block">
            <span className="relative z-10">organized work</span>
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-primary/25 sm:bottom-2 sm:h-4"
            />
          </span>
          .
        </h1>

        <p className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground md:text-xl">
          kamotion turns Slack threads, email chains, Zoom transcripts, and
          meeting notes into structured kanban cards. Paste the noise. AI does
          the parsing. You do the work.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/try"
            className="inline-flex h-12 items-center justify-center gap-1.5 rounded-lg bg-foreground px-7 text-sm font-medium text-background shadow-lg shadow-foreground/10 transition-colors hover:bg-foreground/90 cursor-pointer"
          >
            Try the demo
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-background/70 px-7 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-accent cursor-pointer"
          >
            Log in
          </Link>
        </div>

        <ul className="mt-10 flex flex-wrap justify-center gap-2 text-xs sm:text-sm">
          {[
            "Paste anything",
            "Kanban + Gantt",
            "Bring your own AI",
            "Solo or team",
          ].map((label) => (
            <li key={label}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-muted-foreground backdrop-blur">
                <Check className="h-3.5 w-3.5 text-primary" />
                {label}
              </span>
            </li>
          ))}
        </ul>

        <div className="relative mt-16 w-full">
          <HeroMock />
        </div>
      </div>
    </section>
  );
}

function MessToBoardBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* soft ambient glow */}
      <div className="absolute left-[5%] top-[-5%] h-120 w-120 rounded-full bg-primary/20 blur-[130px] motion-safe:animate-[aurora_16s_ease-in-out_infinite]" />
      <div className="absolute right-[8%] top-[10%] h-95 w-95 rounded-full bg-[#a4a3a3]/15 blur-[110px] motion-safe:animate-[aurora_20s_ease-in-out_infinite_4s]" />

      {/* narrative SVG: mess → AI → order */}
      <svg
        className="absolute inset-x-0 top-0 h-170 w-full"
        viewBox="0 0 1200 680"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="mtb-fade-y" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="55%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="mtb-mask">
            <rect width="1200" height="680" fill="url(#mtb-fade-y)" />
          </mask>

          <linearGradient id="mtb-left-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0.7" />
            <stop offset="80%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="mtb-left-mask">
            <rect width="460" height="680" fill="url(#mtb-left-fade)" />
          </mask>

          <linearGradient id="mtb-right-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="30%" stopColor="white" stopOpacity="0.7" />
          </linearGradient>
          <mask id="mtb-right-mask">
            <rect x="720" width="480" height="680" fill="url(#mtb-right-fade)" />
          </mask>

          <radialGradient id="mtb-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g mask="url(#mtb-mask)">
          {/* LEFT ZONE: scattered message fragments */}
          <g mask="url(#mtb-left-mask)" opacity="0.28">
            <g transform="translate(28, 48)">
              <rect x="0" y="0" width="110" height="30" rx="6" stroke="#a4a3a3" strokeWidth="1.2" />
              <path d="M16 30 L12 38 L26 30Z" stroke="#a4a3a3" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
              <rect x="8" y="9" width="52" height="3.5" rx="1.75" fill="#a4a3a3" opacity="0.5" />
              <rect x="8" y="17" width="38" height="3.5" rx="1.75" fill="#a4a3a3" opacity="0.35" />
            </g>

            <g transform="translate(12, 118)">
              <rect x="0" y="0" width="140" height="80" rx="4" stroke="#a4a3a3" strokeWidth="1" />
              <rect x="8" y="10" width="70" height="3" rx="1.5" fill="#a4a3a3" opacity="0.55" />
              <rect x="8" y="20" width="118" height="2.5" rx="1.25" fill="#a4a3a3" opacity="0.3" />
              <rect x="8" y="27" width="100" height="2.5" rx="1.25" fill="#a4a3a3" opacity="0.3" />
              <rect x="8" y="34" width="112" height="2.5" rx="1.25" fill="#a4a3a3" opacity="0.3" />
              <rect x="8" y="41" width="86" height="2.5" rx="1.25" fill="#a4a3a3" opacity="0.3" />
              <rect x="8" y="54" width="60" height="2.5" rx="1.25" fill="#a4a3a3" opacity="0.2" />
              <rect x="8" y="61" width="90" height="2.5" rx="1.25" fill="#a4a3a3" opacity="0.2" />
            </g>

            <g transform="translate(64, 230)">
              <circle cx="8" cy="8" r="7" stroke="#a4a3a3" strokeWidth="1" />
              <rect x="22" y="2" width="68" height="3" rx="1.5" fill="#a4a3a3" opacity="0.4" />
              <rect x="22" y="9" width="50" height="3" rx="1.5" fill="#a4a3a3" opacity="0.3" />
            </g>
            <g transform="translate(40, 260)">
              <circle cx="8" cy="8" r="7" stroke="#a4a3a3" strokeWidth="1" />
              <rect x="22" y="2" width="82" height="3" rx="1.5" fill="#a4a3a3" opacity="0.35" />
              <rect x="22" y="9" width="44" height="3" rx="1.5" fill="#a4a3a3" opacity="0.25" />
            </g>
            <g transform="translate(70, 292)">
              <circle cx="8" cy="8" r="7" stroke="#a4a3a3" strokeWidth="1" />
              <rect x="22" y="2" width="58" height="3" rx="1.5" fill="#a4a3a3" opacity="0.4" />
            </g>

            <g transform="translate(8, 340)">
              <rect x="0" y="0" width="160" height="90" rx="4" stroke="#a4a3a3" strokeWidth="1" strokeDasharray="4 3" />
              <rect x="8" y="10" width="40" height="2.5" rx="1.25" fill="#14b8a6" opacity="0.4" />
              <rect x="8" y="18" width="130" height="2" rx="1" fill="#a4a3a3" opacity="0.25" />
              <rect x="8" y="24" width="118" height="2" rx="1" fill="#a4a3a3" opacity="0.25" />
              <rect x="8" y="30" width="124" height="2" rx="1" fill="#a4a3a3" opacity="0.2" />
              <rect x="8" y="44" width="38" height="2.5" rx="1.25" fill="#14b8a6" opacity="0.35" />
              <rect x="8" y="52" width="128" height="2" rx="1" fill="#a4a3a3" opacity="0.25" />
              <rect x="8" y="58" width="110" height="2" rx="1" fill="#a4a3a3" opacity="0.2" />
              <rect x="8" y="64" width="138" height="2" rx="1" fill="#a4a3a3" opacity="0.25" />
            </g>

            <g transform="translate(155, 60)">
              <rect x="0" y="0" width="88" height="26" rx="5" stroke="#14b8a6" strokeWidth="1" opacity="0.7" />
              <path d="M20 26 L16 33 L30 26Z" stroke="#14b8a6" strokeWidth="1" strokeLinejoin="round" fill="none" opacity="0.7" />
              <rect x="7" y="8" width="42" height="3" rx="1.5" fill="#14b8a6" opacity="0.3" />
              <rect x="7" y="15" width="30" height="3" rx="1.5" fill="#14b8a6" opacity="0.2" />
            </g>

            <g transform="translate(180, 140)" opacity="0.4">
              <rect x="0" y="0" width="74" height="2.5" rx="1.25" fill="#a4a3a3" />
              <rect x="0" y="8" width="58" height="2.5" rx="1.25" fill="#a4a3a3" />
              <rect x="0" y="16" width="66" height="2.5" rx="1.25" fill="#a4a3a3" />
            </g>

            <g transform="translate(210, 190)" opacity="0.35">
              <circle cx="7" cy="7" r="6" stroke="#a4a3a3" strokeWidth="1" />
              <rect x="18" y="2" width="54" height="2.5" rx="1.25" fill="#a4a3a3" />
              <rect x="18" y="8" width="40" height="2.5" rx="1.25" fill="#a4a3a3" />
            </g>

            <g transform="translate(200, 250)" opacity="0.3">
              <rect x="0" y="0" width="62" height="18" rx="9" stroke="#a4a3a3" strokeWidth="1" />
              <rect x="8" y="7" width="36" height="2.5" rx="1.25" fill="#a4a3a3" />
            </g>
            <g transform="translate(280, 110)" opacity="0.25">
              <rect x="0" y="0" width="50" height="18" rx="9" stroke="#14b8a6" strokeWidth="1" />
              <rect x="8" y="7" width="28" height="2.5" rx="1.25" fill="#14b8a6" />
            </g>

            <polyline
              points="300,300 318,288 336,308 354,294 372,310 390,296 408,312"
              stroke="#a4a3a3" strokeWidth="1.2" strokeLinecap="round" opacity="0.2"
            />
            <polyline
              points="260,360 278,346 296,364 314,350 332,366"
              stroke="#a4a3a3" strokeWidth="1" strokeLinecap="round" opacity="0.18"
            />

            <circle cx="340" cy="180" r="3" fill="#a4a3a3" opacity="0.2" />
            <circle cx="356" cy="200" r="2" fill="#14b8a6" opacity="0.25" />
            <circle cx="370" cy="188" r="2.5" fill="#a4a3a3" opacity="0.15" />

            <g className="motion-safe:animate-[aurora_22s_ease-in-out_infinite_2s]" style={{ transformOrigin: "200px 200px" }}>
              <g transform="translate(310, 240)" opacity="0.22">
                <rect x="0" y="0" width="78" height="22" rx="4" stroke="#a4a3a3" strokeWidth="1" />
                <rect x="6" y="7" width="48" height="2.5" rx="1.25" fill="#a4a3a3" />
                <rect x="6" y="13" width="34" height="2.5" rx="1.25" fill="#a4a3a3" />
              </g>
            </g>
          </g>

          {/* CENTER: AI convergence glow + flow lines */}
          <ellipse cx="600" cy="280" rx="120" ry="100" fill="url(#mtb-glow)" opacity="0.9" />

          <path d="M390 200 Q490 240 570 280" stroke="#14b8a6" strokeWidth="1" strokeLinecap="round" opacity="0.18" />
          <path d="M390 280 Q490 280 570 280" stroke="#14b8a6" strokeWidth="1.2" strokeLinecap="round" opacity="0.22" />
          <path d="M390 360 Q490 320 570 280" stroke="#14b8a6" strokeWidth="1" strokeLinecap="round" opacity="0.18" />
          <path d="M630 280 Q710 240 810 200" stroke="#14b8a6" strokeWidth="1" strokeLinecap="round" opacity="0.18" />
          <path d="M630 280 Q710 280 810 280" stroke="#14b8a6" strokeWidth="1.2" strokeLinecap="round" opacity="0.22" />
          <path d="M630 280 Q710 320 810 360" stroke="#14b8a6" strokeWidth="1" strokeLinecap="round" opacity="0.18" />

          <g transform="translate(600, 280)" opacity="0.55">
            <line x1="-10" y1="0" x2="10" y2="0" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="-10" x2="0" y2="10" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-7" y1="-7" x2="7" y2="7" stroke="#14b8a6" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="7" y1="-7" x2="-7" y2="7" stroke="#14b8a6" strokeWidth="1.2" strokeLinecap="round" />
            <circle r="3" fill="#14b8a6" />
            <circle r="16" stroke="#14b8a6" strokeWidth="0.8" opacity="0.4" />
            <circle r="26" stroke="#14b8a6" strokeWidth="0.5" opacity="0.25" className="motion-safe:animate-[aurora_8s_ease-in-out_infinite]" style={{ transformOrigin: "0px 0px" }} />
          </g>

          {/* RIGHT ZONE: ordered kanban column silhouettes */}
          <g mask="url(#mtb-right-mask)" opacity="0.22">
            <g transform="translate(820, 120)">
              <rect x="0" y="0" width="100" height="16" rx="4" fill="#a4a3a3" opacity="0.4" />
              <rect x="0" y="24" width="100" height="44" rx="5" stroke="#a4a3a3" strokeWidth="1.2" />
              <rect x="8" y="34" width="58" height="3" rx="1.5" fill="#a4a3a3" opacity="0.5" />
              <rect x="8" y="41" width="44" height="2.5" rx="1.25" fill="#a4a3a3" opacity="0.3" />
              <rect x="8" y="50" width="20" height="8" rx="4" fill="#a4a3a3" opacity="0.2" />

              <rect x="0" y="76" width="100" height="44" rx="5" stroke="#a4a3a3" strokeWidth="1.2" />
              <rect x="8" y="86" width="68" height="3" rx="1.5" fill="#a4a3a3" opacity="0.5" />
              <rect x="8" y="93" width="50" height="2.5" rx="1.25" fill="#a4a3a3" opacity="0.3" />
              <rect x="8" y="102" width="20" height="8" rx="4" fill="#14b8a6" opacity="0.25" />

              <rect x="0" y="128" width="100" height="44" rx="5" stroke="#a4a3a3" strokeWidth="1.2" />
              <rect x="8" y="138" width="52" height="3" rx="1.5" fill="#a4a3a3" opacity="0.5" />
              <rect x="8" y="145" width="40" height="2.5" rx="1.25" fill="#a4a3a3" opacity="0.3" />
            </g>

            <g transform="translate(940, 120)">
              <rect x="0" y="0" width="100" height="16" rx="4" fill="#14b8a6" opacity="0.3" />
              <rect x="0" y="24" width="100" height="44" rx="5" stroke="#14b8a6" strokeWidth="1.2" opacity="0.6" />
              <rect x="8" y="34" width="62" height="3" rx="1.5" fill="#14b8a6" opacity="0.4" />
              <rect x="8" y="41" width="46" height="2.5" rx="1.25" fill="#14b8a6" opacity="0.25" />
              <rect x="8" y="50" width="20" height="8" rx="4" fill="#14b8a6" opacity="0.2" />

              <rect x="0" y="76" width="100" height="44" rx="5" stroke="#14b8a6" strokeWidth="1.2" opacity="0.6" />
              <rect x="8" y="86" width="54" height="3" rx="1.5" fill="#14b8a6" opacity="0.4" />
              <rect x="8" y="93" width="38" height="2.5" rx="1.25" fill="#14b8a6" opacity="0.25" />
            </g>

            <g transform="translate(1060, 120)">
              <rect x="0" y="0" width="100" height="16" rx="4" fill="#a4a3a3" opacity="0.3" />
              <rect x="0" y="24" width="100" height="44" rx="5" stroke="#a4a3a3" strokeWidth="1.2" />
              <rect x="8" y="34" width="58" height="3" rx="1.5" fill="#a4a3a3" opacity="0.4" />
              <rect x="8" y="41" width="42" height="2.5" rx="1.25" fill="#a4a3a3" opacity="0.3" />
            </g>

            <line x1="820" y1="112" x2="1160" y2="112" stroke="#a4a3a3" strokeWidth="0.7" opacity="0.25" strokeDasharray="4 4" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function HeroMock() {
  return (
    <div className="relative mx-auto max-w-6xl">
      <div className="absolute -inset-6 z-0 rounded-[32px] bg-linear-to-br from-primary/15 via-transparent to-[#a4a3a3]/15 blur-2xl" />

      <div className="relative grid items-stretch gap-3 lg:grid-cols-[1.05fr_auto_1fr_auto_1.1fr]">
        <SourcePanel />
        <FlowArrow label="AI parses" />
        <ParsePanel />
        <FlowArrow label="Lands in Queue" />
        <BoardPanel />
      </div>
    </div>
  );
}

function FlowArrow({ label }: { label: string }) {
  return (
    <div className="flex flex-row items-center justify-center gap-2 lg:flex-col lg:gap-1.5">
      {/* Mobile: down arrow */}
      <svg
        className="h-5 w-5 text-primary lg:hidden"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19 12 12 19 5 12" />
      </svg>
      {/* Desktop: right arrow */}
      <svg
        className="hidden h-5 w-5 text-primary lg:block"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function SourcePanel() {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card/90 shadow-2xl shadow-foreground/5 backdrop-blur">
      {/* Slack-style chrome */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <Hash className="h-3 w-3" />
          <span>client-launch</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Source
        </span>
      </div>

      <div className="flex-1 space-y-3 px-4 py-4 text-[12px] leading-relaxed">
        <SlackLine
          name="Mia"
          time="9:12"
          color="bg-amber-400"
          body="Customer reports the Place Order button does nothing on mobile Safari."
        />
        <SlackLine
          name="Priya"
          time="9:41"
          color="bg-rose-400"
          muted
          body="Agree on loading state — switch to “Processing…” + spinner on tap."
        />
        <SlackLine
          name="Mia"
          time="10:03"
          color="bg-amber-400"
          body="Let’s split: bug for Safari tap, UX task for loading state, and verify the API for duplicate requests."
        />
      </div>
    </div>
  );
}

function SlackLine({
  name,
  time,
  body,
  color,
  muted = false,
}: {
  name: string;
  time: string;
  body: string;
  color: string;
  muted?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <span
        className={`mt-0.5 inline-block h-6 w-6 shrink-0 rounded-md ${color}`}
        aria-hidden
      />
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[12px] font-semibold text-foreground">
            {name}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {time}
          </span>
        </div>
        <p
          className={
            muted ? "text-muted-foreground" : "text-foreground/90"
          }
        >
          {body}
        </p>
      </div>
    </div>
  );
}

function ParsePanel() {
  const tasks = [
    {
      title: "Fix Place Order tap on mobile Safari",
      meta: "High · Bug",
    },
    {
      title: "Add loading state + spinner to checkout CTA",
      meta: "Normal · UX",
    },
    {
      title: "Verify payment API for duplicate requests",
      meta: "Normal · Eng",
    },
  ];

  return (
    <div className="relative flex flex-col rounded-2xl border border-border bg-card/95 shadow-2xl shadow-foreground/5 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-brand-accent/15 text-brand-accent">
            <Sparkles className="h-3 w-3" />
          </span>
          <span>3 tasks found</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Preview
        </span>
      </div>

      <ul className="flex flex-1 flex-col gap-2 px-4 py-4">
        {tasks.map((t) => (
          <li
            key={t.title}
            className="flex items-start gap-2 rounded-lg border border-border bg-background/60 px-3 py-2"
          >
            <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] bg-primary text-primary-foreground">
              <Check className="h-3 w-3" />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-medium leading-snug text-foreground">
                {t.title}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {t.meta}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t border-border px-4 py-2.5">
        <div className="inline-flex h-7 items-center justify-center rounded-md bg-foreground px-3 text-[11px] font-medium text-background">
          Add 3 to board
        </div>
      </div>
    </div>
  );
}

function BoardPanel() {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card/90 shadow-2xl shadow-foreground/5 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-[11px] font-medium text-foreground">Board</span>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-success" />
          kamotion.io/app
        </span>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3 px-4 py-4">
        <BoardColumn
          title="Queue"
          count={3}
          tone="bg-muted text-muted-foreground"
          cards={[
            { title: "Fix Place Order tap on Safari", priority: "high" },
            { title: "Add loading state to checkout", priority: "normal" },
            { title: "Verify duplicate API requests", priority: "normal" },
          ]}
          highlight
        />
        <BoardColumn
          title="In Progress"
          count={1}
          tone="bg-primary/10 text-primary"
          cards={[
            { title: "Reply to Acme contract thread", priority: "normal" },
          ]}
        />
      </div>
    </div>
  );
}

function BoardColumn({
  title,
  count,
  tone,
  cards,
  highlight = false,
}: {
  title: string;
  count: number;
  tone: string;
  cards: { title: string; priority: "high" | "normal" }[];
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${tone}`}
        >
          {title}
          <span className="text-muted-foreground/80">{count}</span>
        </span>
        {highlight && (
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary">
            New
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {cards.map((card, idx) => (
          <MockCard
            key={idx}
            title={card.title}
            priority={card.priority}
            isNew={highlight && idx < 3}
          />
        ))}
      </div>
    </div>
  );
}

function MockCard({
  title,
  priority,
  isNew = false,
}: {
  title: string;
  priority: "high" | "normal";
  isNew?: boolean;
}) {
  return (
    <div
      className={`relative rounded-lg border bg-card px-3 py-2.5 shadow-sm ${
        isNew ? "border-primary/40 ring-1 ring-primary/20" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium leading-snug text-foreground">
          {title}
        </p>
        {priority === "high" ? (
          <span
            className="mt-0.5 inline-block h-0 w-0 shrink-0 border-x-[5px] border-b-8 border-x-transparent border-b-rose-400/70"
            aria-hidden
          />
        ) : (
          <span
            className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-400/60"
            aria-hidden
          />
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
          Ship this week
        </span>
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[8px] font-semibold text-muted-foreground ring-1 ring-border">
          ME
        </span>
      </div>
    </div>
  );
}

/* ---------------------------- CHANNEL STRIP --------------------------- */

function ChannelStrip() {
  const channels = [
    { name: "Slack", icon: Hash },
    { name: "Email", icon: Mail },
    { name: "Zoom", icon: Video },
    { name: "Teams", icon: MessageSquare },
    { name: "SMS", icon: Phone },
    { name: "Docs", icon: FileText },
  ];

  return (
    <section className="relative border-y border-border bg-muted/30 px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Works with the noise you already have
        </span>
        <p className="mt-3 max-w-2xl text-balance text-center text-lg font-medium text-foreground sm:text-xl">
          Your work shows up everywhere. kamotion reads it all.
        </p>

        <ul className="mt-8 grid w-full max-w-4xl grid-cols-3 gap-4 sm:grid-cols-6">
          {channels.map(({ name, icon: Icon }) => (
            <li
              key={name}
              className="flex flex-col items-center gap-2 rounded-lg border border-border bg-background px-3 py-4 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------- HOW IT WORKS ---------------------------- */

function HowItWorks() {
  return (
    <section id="how" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            How it works
          </span>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Paste. Parse. Ship.
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            No new process to learn. Just take whatever form the work showed up
            in and drop it in.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <HowCard
            step="01"
            icon={<ClipboardPaste className="h-4 w-4" />}
            title="Drop in the noise"
            description="A Zoom transcript. A 40-reply email chain. A Slack thread. Meeting notes. Whatever form the work showed up in — paste it."
            visual={<PasteVisual />}
          />
          <HowCard
            step="02"
            icon={<Sparkles className="h-4 w-4" />}
            title="AI extracts the action items"
            description="kamotion pulls out what's actionable, who owns it, who asked, and when it's due. You get a preview to edit before anything saves."
            visual={<PreviewVisual />}
            accent
          />
          <HowCard
            step="03"
            icon={<LayoutDashboard className="h-4 w-4" />}
            title="Work from the board"
            description="Cards land in your Queue. Drag across Ready → In Progress → Review → Done. Switch to Gantt when you need a timeline."
            visual={<BoardVisual />}
          />
        </div>
      </div>
    </section>
  );
}

function HowCard({
  step,
  icon,
  title,
  description,
  visual,
  accent,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  visual: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div
        className={`relative flex h-56 items-center justify-center overflow-hidden p-4 ${
          accent
            ? "bg-gradient-to-br from-primary/15 via-[#a4a3a3]/10 to-primary/5"
            : "bg-muted/40"
        }`}
      >
        {visual}
      </div>
      <div className="flex flex-col gap-3 p-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {step}
          </span>
          <span
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${
              accent
                ? "bg-primary text-background"
                : "bg-primary/10 text-primary"
            }`}
          >
            {icon}
          </span>
        </div>
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function PasteVisual() {
  const bubbles = [
    { side: "left", text: "So can someone own the Q3 brief by Friday?" },
    { side: "right", text: "I'll take it — but also need headcount ask" },
    { side: "left", text: "Also don't forget the vendor contract follow-up" },
  ];
  return (
    <div className="flex w-full max-w-[260px] flex-col gap-1.5">
      {bubbles.map((b, i) => (
        <div
          key={i}
          className={`max-w-[80%] rounded-lg bg-background px-2.5 py-1.5 text-[10px] leading-snug text-foreground shadow-sm ${
            b.side === "right" ? "self-end bg-primary/10" : "self-start"
          }`}
        >
          {b.text}
        </div>
      ))}
      <div className="mt-1 self-start rounded-md border border-dashed border-border bg-background/60 px-2 py-1 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
        · 42 more lines · paste.txt
      </div>
    </div>
  );
}

function PreviewVisual() {
  const items = [
    { title: "Own Q3 brief", owner: "ME", due: "Fri" },
    { title: "Send headcount ask", owner: "ME", due: "Mon" },
    { title: "Follow up vendor contract", owner: "EC", due: "This wk" },
  ];
  return (
    <div className="w-full max-w-[260px] rounded-xl border border-border bg-background p-2.5 shadow-lg">
      <div className="mb-2 flex items-center gap-1.5 px-1">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-brand-accent/15 text-brand-accent">
          <Sparkles className="h-3 w-3" />
        </span>
        <span className="text-[10px] font-semibold">3 cards extracted</span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-center gap-2 rounded-md bg-muted/60 px-2 py-1.5 text-[10px]"
          >
            <Check className="h-3 w-3 text-brand-success" />
            <span className="flex-1 truncate font-medium">{it.title}</span>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-background text-[8px] font-semibold text-muted-foreground ring-1 ring-border">
              {it.owner}
            </span>
            <span className="font-mono text-[9px] uppercase text-muted-foreground">
              {it.due}
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-2 w-full rounded-md bg-foreground py-1.5 text-[10px] font-medium text-background"
        tabIndex={-1}
        aria-hidden
      >
        Save to board
      </button>
    </div>
  );
}

function BoardVisual() {
  return (
    <div className="grid w-full max-w-[260px] grid-cols-3 gap-1.5">
      {[
        { label: "Ready", count: 4, tone: "bg-muted" },
        { label: "Doing", count: 2, tone: "bg-primary/15" },
        { label: "Done", count: 3, tone: "bg-brand-success/15" },
      ].map((c) => (
        <div key={c.label} className="flex flex-col gap-1.5">
          <div
            className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${c.tone}`}
          >
            {c.label} {c.count}
          </div>
          {Array.from({ length: c.count > 3 ? 3 : c.count }).map((_, i) => (
            <div
              key={i}
              className="rounded bg-background px-2 py-1.5 text-[9px] text-foreground shadow-sm"
            >
              <div className="h-1 w-3/4 rounded-sm bg-muted" />
              <div className="mt-1 h-1 w-1/2 rounded-sm bg-muted/70" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* --------------------------- TRANSFORMATION --------------------------- */

function Transformation() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            The transformation
          </span>
          <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            From conversation chaos to{" "}
            <span className="relative inline-block">
              <span className="relative z-10">organized tasks</span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 z-0 h-3 bg-primary/25 sm:bottom-1.5 sm:h-3.5"
              />
            </span>
            .
          </h2>
        </div>

        <div className="mt-12 aspect-[16/10] w-full">
          <ImageComparison
            beforeImage="/assets/kanban-organized-dark.svg"
            afterImage="/assets/conversation-chaos.svg"
            altBefore="The same tasks organized into a kamotion kanban board"
            altAfter="Scattered conversations across Slack, email, texts, and notes"
            initialPosition={50}
            className="h-full"
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ PERSONAS ------------------------------ */

function Personas() {
  const personas = [
    {
      icon: ListChecks,
      title: "Personal life",
      copy: "Groceries, birthdays, school forms, packing a trip, a move — anything that lives in group chats or brain-dump notes turns into one clear list.",
    },
    {
      icon: Briefcase,
      title: "Freelancers & consultants",
      copy: "Juggling three clients across four tools. One board. One source of truth. No more missed follow-ups.",
    },
    {
      icon: Users2,
      title: "Small teams",
      copy: "Where half the tasks live in someone's DMs. Now they live where everyone can see them.",
    },
  ];

  return (
    <section id="who" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Who it's for
          </span>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Made for people running on too many channels.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {personas.map(({ icon: Icon, title, copy }) => (
            <article
              key={title}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-8"
            >
              <span className="absolute right-6 top-6 text-[80px] font-semibold leading-none text-muted/60">
                {title.charAt(0)}
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ DARK TRUST ----------------------------- */

function OpenSource() {
  const features = [
    {
      icon: Server,
      title: "Self-host when you need control",
      description:
        "Run it on your own infrastructure so sensitive conversations, tasks, and workflows stay where you want them.",
    },
    {
      icon: Code2,
      title: "Built in the open",
      description:
        "Review the code, understand how it works, and contribute improvements instead of relying on a closed system.",
    },
    {
      icon: GitBranch,
      title: "Branch it and build more",
      description:
        "Developers can fork the project, create custom features, and adapt the product far beyond the default experience.",
    },
    {
      icon: Workflow,
      title: "Customize every workflow",
      description:
        "Adapt parsing rules, task categories, Kanban stages, and resolution suggestions to match your team’s process.",
    },
    {
      icon: Unlock,
      title: "No vendor lock-in",
      description:
        "Keep your conversations, cards, and workflow data portable, transparent, and under your control.",
    },
    {
      icon: Users2,
      title: "Community-powered",
      description:
        "Build alongside other developers and teams turning messy conversations into organized, trackable work.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-muted/30 px-6 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at top left, color-mix(in oklch, var(--primary) 25%, transparent), transparent 50%), radial-gradient(ellipse at bottom right, color-mix(in oklch, var(--muted-foreground) 18%, transparent), transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Open source
          </span>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            100% Open Source.
          </h2>
          <p className="mt-4 text-balance leading-relaxed text-muted-foreground">
            Self-host the platform, inspect the code, and extend it without
            limits. From custom workflows to entirely new features, developers
            can branch the project and build it around the way their team
            works.
          </p>
        </div>

        <FeatureGridContainer className="mt-14 grid divide-x divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureGridItem key={feature.title}>
              <FeatureCard feature={feature} />
            </FeatureGridItem>
          ))}
        </FeatureGridContainer>

        <div className="mt-14 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {brand.github && (
            <Link
              href={brand.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-lg bg-foreground px-7 text-sm font-medium text-background shadow-lg shadow-foreground/10 transition-colors hover:bg-foreground/90 cursor-pointer"
            >
              View on GitHub
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link
            href="/try"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-background/70 px-7 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-accent cursor-pointer"
          >
            Try the demo
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- NON-TECHNICALS ---------------------------- */

function NonTechnicals() {
  return (
    <section id="hosted" className="px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Non-Technicals
          </span>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Just want to use it?
          </h2>
          <p className="mt-4 text-balance leading-relaxed text-muted-foreground">
            You don&rsquo;t need to install anything, manage servers, or
            understand open source tools. If you want the benefits without the
            technical setup, reach out and I can help host it for you.
          </p>
        </div>

        <div className="mt-10">
          <HostedContactForm />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ COMING SOON ---------------------------- */

function ComingSoon() {
  return (
    <section
      id="roadmap"
      className="relative overflow-hidden px-6 py-24"
    >
      {/* Faded grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      >
        <svg
          className="absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <defs>
            <pattern
              id="roadmap-grid"
              x="0"
              y="0"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                className="stroke-foreground/10"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#roadmap-grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Roadmap
          </span>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Constantly evolving&mdash;more features ahead!
          </h2>
          <p className="mt-4 text-balance leading-relaxed text-muted-foreground">
            This is only the beginning. New features, integrations, and
            workflow improvements will continue to be added as the project
            grows, making it easier to turn messy conversations into
            organized, actionable work.
          </p>
        </div>

        <div className="mt-14">
          <RoadmapFlow />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ FOOTER CTA ----------------------------- */

function FooterCTA() {
  return (
    <section className="px-6 pb-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-background to-[#a4a3a3]/15 p-12 text-center sm:p-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, color-mix(in oklch, var(--primary) 25%, transparent), transparent 40%), radial-gradient(circle at 80% 80%, color-mix(in oklch, #a4a3a3 20%, transparent), transparent 45%)",
          }}
        />
        <div className="relative z-10">
          <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Cut through the commotion.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-balance text-muted-foreground sm:text-lg">
            Take it for a spin — the demo is the real app, seeded with sample
            data. Nothing to install, nothing to sign up for.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/try"
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-lg bg-foreground px-7 text-sm font-medium text-background shadow-lg shadow-foreground/10 transition-colors hover:bg-foreground/90 cursor-pointer"
            >
              Try the demo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-background/70 px-7 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-accent cursor-pointer"
            >
              Log in
            </Link>
          </div>
          <div className="mt-6 flex justify-center">
            <GithubStar />
          </div>
        </div>
      </div>
    </section>
  );
}

