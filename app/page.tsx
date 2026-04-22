import Link from "next/link";
import {
  ArrowRight,
  ClipboardPaste,
  Sparkles,
  LayoutDashboard,
  GanttChartSquare,
  Users,
  Eye,
  KeyRound,
  MessageSquare,
  Mail,
  Video,
  Phone,
  FileText,
  Hash,
  ShieldCheck,
  Code2,
  Briefcase,
  Users2,
  Check,
  GitBranch,
} from "lucide-react";
import { brand } from "@/config/brand";

const ACCESS_EMAIL = `mailto:hello@${brand.domain}?subject=kamotion access request`;

export default function Home() {
  return (
    <>
      <PromoBar />
      <Nav />

      <main className="flex flex-col">
        <Hero />
        <ChannelStrip />
        <HowItWorks />
        <Features />
        <Personas />
        <DarkTrust />
        <Origin />
        <FooterCTA />
      </main>

      <SiteFooter />
    </>
  );
}

/* ----------------------------- PROMO BAR ----------------------------- */

function PromoBar() {
  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-6 py-2 text-xs sm:flex-row sm:gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-warning/15 px-2.5 py-0.5 font-medium text-brand-warning">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-warning motion-safe:animate-pulse" />
          Invite-only beta
        </span>
        <span className="text-background/70">
          Early access for people drowning in channels.
        </span>
        <a
          href={ACCESS_EMAIL}
          className="inline-flex items-center gap-1 font-medium text-background underline-offset-2 hover:underline"
        >
          Request access
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

/* --------------------------------- NAV -------------------------------- */

function Nav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-baseline gap-0.5 text-xl font-semibold tracking-tight cursor-pointer"
        >
          <span className="text-foreground">kamotion</span>
          <span className="text-muted-foreground">.io</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a
            href="#how"
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            How it works
          </a>
          <a
            href="#features"
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Features
          </a>
          <a
            href="#who"
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Who it's for
          </a>
          <a
            href="#origin"
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Origin
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden h-9 items-center justify-center rounded-md px-3 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer sm:inline-flex"
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
        </div>
      </div>
    </header>
  );
}

/* -------------------------------- HERO -------------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-24 sm:pt-28">
      <AuroraBackdrop />
      <ConvergingLines />

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
          <a
            href={ACCESS_EMAIL}
            className="inline-flex h-12 items-center justify-center gap-1.5 rounded-lg bg-foreground px-7 text-sm font-medium text-background shadow-lg shadow-foreground/10 transition-colors hover:bg-foreground/90 cursor-pointer"
          >
            Request access
            <ArrowRight className="h-4 w-4" />
          </a>
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

function AuroraBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute left-[20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-primary/25 blur-[120px] motion-safe:animate-[aurora_14s_ease-in-out_infinite]" />
      <div className="absolute right-[15%] top-[20%] h-[420px] w-[420px] rounded-full bg-brand-warning/15 blur-[110px] motion-safe:animate-[aurora_18s_ease-in-out_infinite_3s]" />
      <div className="absolute left-[30%] bottom-[-10%] h-[460px] w-[460px] rounded-full bg-brand-success/15 blur-[120px] motion-safe:animate-[aurora_16s_ease-in-out_infinite_6s]" />
    </div>
  );
}

function ConvergingLines() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] w-full opacity-40"
      viewBox="0 0 1200 640"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="line-fade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="40%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: 12 }).map((_, i) => {
        const startX = (i / 11) * 1200;
        return (
          <line
            key={i}
            x1={startX}
            y1={0}
            x2={600}
            y2={640}
            stroke="url(#line-fade)"
            strokeWidth={0.6}
            className="text-primary"
          />
        );
      })}
    </svg>
  );
}

function HeroMock() {
  const columns = [
    {
      title: "Queue",
      tone: "bg-muted text-muted-foreground",
      cards: [
        { title: "Pull social Q3 metrics", owner: "ME", accent: "rose" },
        { title: "Draft H3 roadmap email", owner: "EC", accent: "amber" },
      ],
    },
    {
      title: "In progress",
      tone: "bg-primary/10 text-primary",
      cards: [
        {
          title: "Reply to Acme contract thread",
          owner: "EC",
          accent: "teal",
        },
        { title: "Ship onboarding fix", owner: "ME", accent: "violet" },
      ],
    },
    {
      title: "Done",
      tone: "bg-brand-success/15 text-brand-success",
      cards: [
        {
          title: "Send invoice to Pied Piper",
          owner: "ME",
          accent: "emerald",
        },
      ],
    },
  ];

  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-primary/10 via-transparent to-brand-warning/10 blur-2xl" />

      <div className="rounded-2xl border border-border bg-card/90 p-3 shadow-2xl shadow-foreground/5 backdrop-blur sm:p-4">
        {/* fake browser chrome */}
        <div className="mb-3 flex items-center gap-1.5 px-2">
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="ml-3 inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-success" />
            kamotion.io/app
          </span>
        </div>

        <div className="grid gap-3 rounded-xl bg-background p-3 sm:grid-cols-3 sm:p-4">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium uppercase tracking-wide ${col.tone}`}
                >
                  {col.title}
                  <span className="text-muted-foreground/80">
                    {col.cards.length}
                  </span>
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {col.cards.map((card, idx) => (
                  <MockCard key={idx} {...card} />
                ))}
                <div className="rounded-md border border-dashed border-border/80 py-2 text-center text-[11px] text-muted-foreground">
                  + new card
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating AI preview badge */}
      <div className="absolute -right-2 -top-3 hidden rotate-2 rounded-xl border border-border bg-background p-3 shadow-lg shadow-foreground/5 sm:block sm:-right-6 sm:-top-6">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand-accent/15 text-brand-accent">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span>3 cards extracted</span>
        </div>
        <p className="mt-1 max-w-[180px] text-[11px] leading-snug text-muted-foreground">
          From "Acme handoff call · transcript.txt"
        </p>
      </div>
    </div>
  );
}

function MockCard({
  title,
  owner,
  accent,
}: {
  title: string;
  owner: string;
  accent: string;
}) {
  const accentMap: Record<string, string> = {
    rose: "bg-brand-accent",
    amber: "bg-brand-warning",
    teal: "bg-primary",
    violet: "bg-chart-3",
    emerald: "bg-brand-success",
  };
  return (
    <div className="group relative rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`absolute left-0 top-2 h-[calc(100%-1rem)] w-[3px] rounded-r ${accentMap[accent] ?? "bg-primary"}`}
      />
      <p className="pl-2 text-xs font-medium leading-snug text-foreground">
        {title}
      </p>
      <div className="mt-2 flex items-center justify-between pl-2">
        <span className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
          Ship this week
        </span>
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground ring-1 ring-border">
          {owner}
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
            ? "bg-gradient-to-br from-primary/15 via-brand-warning/10 to-brand-accent/10"
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
                ? "bg-brand-accent/15 text-brand-accent"
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

/* ------------------------------ FEATURES ------------------------------ */

function Features() {
  const features = [
    {
      icon: ClipboardPaste,
      title: "Paste anything",
      copy: "Transcripts, emails, Slack exports, raw notes. If it's text, kamotion reads it.",
    },
    {
      icon: GanttChartSquare,
      title: "Kanban + Gantt, synced",
      copy: "Flow view and timeline view, same data. Drag in one, it updates the other.",
    },
    {
      icon: KeyRound,
      title: "Bring your own AI",
      copy: "OpenRouter, Anthropic, OpenAI, or Gemini. Your key, your model, your cost.",
    },
    {
      icon: Eye,
      title: "Staged previews, not surprises",
      copy: "AI suggests cards. You review, edit, confirm. Nothing saves until you say so.",
    },
    {
      icon: Users,
      title: "Roles that make sense",
      copy: "Admin, Editor, Viewer. Give a client read-only access without giving up control.",
    },
    {
      icon: Users2,
      title: "Solo or team mode",
      copy: "Keep tasks for yourself or distribute across the crew with a single toggle.",
    },
  ];

  return (
    <section id="features" className="bg-muted/30 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Features
          </span>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Built for how work actually happens.
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            Not another "supercharge your productivity" SaaS. The tool you wish
            the last one had been.
          </p>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, copy }) => (
            <li
              key={title}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/20"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {copy}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------ PERSONAS ------------------------------ */

function Personas() {
  const personas = [
    {
      icon: Code2,
      title: "Full-stack devs",
      copy: "Wearing five hats — client calls, PRs, marketing side-work. kamotion keeps the non-code work from eating your focus.",
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

function DarkTrust() {
  const pillars = [
    {
      icon: KeyRound,
      title: "Your API key",
      copy: "Swap providers any time. Your model, your cost, no markup.",
    },
    {
      icon: ShieldCheck,
      title: "Your data",
      copy: "Google Sheets storage by default. You own it, export it, migrate any time.",
    },
    {
      icon: Users,
      title: "Granular roles",
      copy: "Admin, Editor, Viewer. Hand clients read-only access without losing control.",
    },
    {
      icon: GitBranch,
      title: "Open-source soon",
      copy: "Once it's proven, kamotion goes open-source for freelancers and solo operators.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-foreground px-6 py-24 text-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at top left, color-mix(in oklch, var(--primary) 30%, transparent), transparent 50%), radial-gradient(ellipse at bottom right, color-mix(in oklch, var(--brand-warning) 25%, transparent), transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
            The rules
          </span>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Your work, your tools, your rules.
          </h2>
          <p className="mt-4 text-balance text-background/70">
            No lock-in. No bloat. No upsell to an "enterprise tier" before
            you've even tried the thing.
          </p>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, copy }) => (
            <li
              key={title}
              className="rounded-xl border border-background/10 bg-background/5 p-6 backdrop-blur"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-background/10 text-background">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-background/70">
                {copy}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-14 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={ACCESS_EMAIL}
            className="inline-flex h-12 items-center justify-center gap-1.5 rounded-lg bg-background px-7 text-sm font-medium text-foreground shadow-lg transition-colors hover:bg-background/90 cursor-pointer"
          >
            Request access
            <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-background/20 px-7 text-sm font-medium text-background transition-colors hover:bg-background/10 cursor-pointer"
          >
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- ORIGIN ------------------------------- */

function Origin() {
  return (
    <section id="origin" className="px-6 py-24">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 sm:p-12">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Origin
        </span>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Built because I needed it.
        </h2>
        <p className="mt-5 text-balance leading-relaxed text-muted-foreground">
          I'm a full-stack dev who also runs marketing. Tasks come at me from
          Slack, email, Teams, client texts, Zoom transcripts, Google Docs —
          everywhere. I got tired of re-reading threads just to figure out what
          I was supposed to do.
        </p>
        <p className="mt-4 text-balance leading-relaxed text-muted-foreground">
          kamotion is the tool I built for myself. Paste the noise, get the
          work. I'm opening it up for other people who live in the same
          commotion.
        </p>
        <p className="mt-6 font-mono text-sm text-foreground">— Edward</p>
      </div>
    </section>
  );
}

/* ------------------------------ FOOTER CTA ----------------------------- */

function FooterCTA() {
  return (
    <section className="px-6 pb-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-background to-brand-warning/10 p-12 text-center sm:p-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, color-mix(in oklch, var(--primary) 25%, transparent), transparent 40%), radial-gradient(circle at 80% 80%, color-mix(in oklch, var(--brand-warning) 20%, transparent), transparent 45%)",
          }}
        />
        <div className="relative z-10">
          <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Cut through the commotion.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-balance text-muted-foreground sm:text-lg">
            kamotion is invite-only right now. If you're drowning in channels
            and want in, reach out.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={ACCESS_EMAIL}
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-lg bg-foreground px-7 text-sm font-medium text-background shadow-lg shadow-foreground/10 transition-colors hover:bg-foreground/90 cursor-pointer"
            >
              Request access
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-background/70 px-7 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-accent cursor-pointer"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- FOOTER ------------------------------- */

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/20 px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <Link
            href="/"
            className="flex items-baseline gap-0.5 text-lg font-semibold tracking-tight cursor-pointer"
          >
            <span className="text-foreground">kamotion</span>
            <span className="text-muted-foreground">.io</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            From scattered messages to organized work. Built for people running
            on too many channels.
          </p>
        </div>

        <FooterCol
          title="Product"
          links={[
            { label: "How it works", href: "#how" },
            { label: "Features", href: "#features" },
            { label: "Who it's for", href: "#who" },
            { label: "Log in", href: "/login" },
          ]}
        />
        <FooterCol
          title="Use cases"
          links={[
            { label: "Meeting follow-ups", href: "#how" },
            { label: "Client handoffs", href: "#who" },
            { label: "Slack cleanup", href: "#features" },
            { label: "Solo operators", href: "#who" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { label: "Origin", href: "#origin" },
            { label: "Request access", href: ACCESS_EMAIL },
            { label: "Contact", href: `mailto:hello@${brand.domain}` },
            { label: "GitHub (soon)", href: "#" },
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
