import Link from "next/link";
import { ClipboardPaste, Sparkles, LayoutDashboard, Users, Keyboard, GanttChartSquare } from "lucide-react";
import { brand } from "@/config/brand";

export default function Home() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative flex min-h-[88vh] flex-1 items-center justify-center overflow-hidden px-6">
        <AuroraBackdrop />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground mb-8">
            {brand.domain}
          </span>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.05] mb-6">
            Turn the{" "}
            <span className="text-primary">commotion</span>
            <br />
            into clarity.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-10">
            {brand.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 cursor-pointer"
            >
              Log in
            </Link>
            <a
              href={`mailto:hello@${brand.domain}?subject=Kamotion access request`}
              className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-background/60 backdrop-blur px-8 text-sm font-medium text-foreground transition-colors hover:bg-accent cursor-pointer"
            >
              Request access
            </a>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="border-t border-border bg-muted/40 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              How it works
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              From scattered text to a board you can ship from.
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <Step
              n="01"
              icon={<ClipboardPaste className="h-5 w-5" />}
              title="Paste the chaos"
              description="Drop in an email thread, meeting transcript, or Slack dump — however messy."
            />
            <Step
              n="02"
              icon={<Sparkles className="h-5 w-5" aria-hidden />}
              title="Let AI structure it"
              description="Kamotion extracts tasks, owners, requesters, and due dates. You preview and edit before anything saves."
              accent
            />
            <Step
              n="03"
              icon={<LayoutDashboard className="h-5 w-5" />}
              title="Work the board"
              description="Cards land in Queue. Drag across Ready → In Progress → Review → Done. Switch to Gantt anytime."
            />
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Built for
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Solo operators who occasionally need a team.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={<Sparkles className="h-5 w-5 text-primary" />}
              title="AI text-to-cards"
              description="Provider-agnostic: OpenRouter, Anthropic, OpenAI, or Gemini. Swap in Settings."
            />
            <Feature
              icon={<GanttChartSquare className="h-5 w-5 text-primary" />}
              title="Kanban + Gantt"
              description="Same data, two views. Drag to reschedule; Kanban stays in sync."
            />
            <Feature
              icon={<Users className="h-5 w-5 text-primary" />}
              title="Admin, editor, viewer"
              description="Hand access to collaborators without giving them your whole workspace."
            />
            <Feature
              icon={<Keyboard className="h-5 w-5 text-primary" />}
              title="Keyboard-first"
              description="Drag-and-drop is accessible; shortcuts for everything you touch twice a day."
            />
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-border px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            © {new Date().getFullYear()} {brand.name}
          </span>
          <div className="flex items-center gap-6 text-sm">
            <a
              href={`mailto:hello@${brand.domain}?subject=Kamotion access request`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Request access
            </a>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}

function AuroraBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute left-[20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-primary/25 blur-[120px] motion-safe:animate-[aurora_14s_ease-in-out_infinite]" />
      <div className="absolute right-[15%] top-[20%] h-[420px] w-[420px] rounded-full bg-brand-accent/20 blur-[110px] motion-safe:animate-[aurora_18s_ease-in-out_infinite_3s]" />
      <div className="absolute left-[30%] bottom-[-10%] h-[460px] w-[460px] rounded-full bg-brand-success/20 blur-[120px] motion-safe:animate-[aurora_16s_ease-in-out_infinite_6s]" />
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  description,
  accent,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-md ${
            accent ? "bg-brand-accent/10 text-brand-accent" : "bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </span>
        <span className="font-mono text-xs text-muted-foreground">{n}</span>
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-6 transition-colors hover:bg-accent/50">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
        {icon}
      </div>
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
