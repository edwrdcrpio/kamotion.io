import { Fragment } from "react";
import {
  Sparkles,
  ClipboardPaste,
  ArrowRight,
  Check,
  Circle,
  Triangle,
  User,
} from "lucide-react";

function MockWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 font-mono text-[10px] text-muted-foreground">
          kamotion.io
        </span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

export function GenerateMock() {
  return (
    <MockWindow>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          <ClipboardPaste className="h-3.5 w-3.5 text-primary" />
          Paste unstructured text
        </div>
        <div className="rounded-md border border-border bg-muted/30 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
          Slack: <span className="text-foreground">&ldquo;Need the API docs draft
          by Friday, and can someone ping the client about the onboarding call?
          Also, staging is still broken &mdash; blocker.&rdquo;</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          AI extracts 3 cards
          <ArrowRight className="h-3 w-3" />
        </div>
        <div className="flex flex-col gap-1.5">
          {[
            { t: "Draft API docs", meta: "Due Fri · high" },
            { t: "Ping client re: onboarding call", meta: "medium" },
            { t: "Fix staging", meta: "blocker · high" },
          ].map((c) => (
            <div
              key={c.t}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-[12px]"
            >
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-brand-success" />
                <span className="font-medium text-foreground">{c.t}</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                {c.meta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </MockWindow>
  );
}

export function BoardMock() {
  const columns = [
    {
      title: "Ready",
      tone: "bg-primary",
      cards: [
        { t: "Draft API docs", p: "high" },
        { t: "Client onboarding call", p: "med" },
      ],
    },
    {
      title: "In Progress",
      tone: "bg-indigo-500",
      cards: [{ t: "Rewrite auth middleware", p: "med" }],
    },
    {
      title: "Review",
      tone: "bg-brand-accent",
      cards: [{ t: "PR #214 · kanban polish", p: "low" }],
    },
    {
      title: "Done",
      tone: "bg-brand-success",
      cards: [{ t: "Fix staging outage", p: "high" }],
    },
  ];
  return (
    <MockWindow>
      <div className="grid grid-cols-4 gap-2">
        {columns.map((col) => (
          <div key={col.title} className="rounded-md border border-border bg-muted/20 p-2">
            <div className="mb-2 flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${col.tone}`} />
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                {col.title}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {col.cards.map((c) => (
                <div
                  key={c.t}
                  className="rounded border border-border bg-background px-2 py-1.5 text-[10px]"
                >
                  <div className="flex items-start gap-1">
                    {c.p === "high" && (
                      <Triangle
                        aria-hidden
                        className="mt-0.5 h-2.5 w-2.5 shrink-0 fill-red-400/60 text-red-400/60"
                      />
                    )}
                    {c.p === "med" && (
                      <Circle
                        aria-hidden
                        className="mt-0.5 h-2.5 w-2.5 shrink-0 fill-emerald-400/60 text-emerald-400/60"
                      />
                    )}
                    {c.p === "low" && (
                      <Triangle
                        aria-hidden
                        className="mt-0.5 h-2.5 w-2.5 shrink-0 rotate-180 fill-yellow-400/60 text-yellow-400/60"
                      />
                    )}
                    <span className="text-foreground">{c.t}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MockWindow>
  );
}

export function GanttMock() {
  const rows = [
    { t: "Draft API docs", offset: 1, width: 3, tone: "bg-primary/70" },
    { t: "Rewrite auth middleware", offset: 2, width: 5, tone: "bg-indigo-500/70" },
    { t: "Client onboarding call", offset: 4, width: 1, tone: "bg-primary/70" },
    { t: "PR #214", offset: 5, width: 2, tone: "bg-brand-accent/70" },
  ];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];
  return (
    <MockWindow>
      <div className="grid grid-cols-[140px_1fr] gap-x-2">
        <div className="border-b border-border pb-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          Task
        </div>
        <div className="grid grid-cols-8 border-b border-border pb-1">
          {days.map((d, i) => (
            <div
              key={`${d}-${i}`}
              className="text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>
        {rows.map((r) => (
          <Fragment key={r.t}>
            <div className="border-b border-border/60 py-2 text-[11px] text-foreground">
              {r.t}
            </div>
            <div className="relative grid grid-cols-8 border-b border-border/60 py-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`border-r border-dashed border-border/40 ${
                    i === 5 || i === 6 ? "bg-muted/40" : ""
                  }`}
                />
              ))}
              <div
                className={`absolute inset-y-1.5 rounded ${r.tone}`}
                style={{
                  left: `${(r.offset / 8) * 100}%`,
                  width: `${(r.width / 8) * 100}%`,
                }}
              />
            </div>
          </Fragment>
        ))}
      </div>
    </MockWindow>
  );
}

export function TeamMock() {
  const rows = [
    { name: "Lucy Lu", email: "lucy@example.com", role: "member", linked: true },
    { name: "Dana Park", email: "dana@example.com", role: "viewer", linked: false },
    { name: "Ari Shore", email: "ari@example.com", role: "member", linked: true },
  ];
  return (
    <MockWindow>
      <div className="flex flex-col">
        <div className="grid grid-cols-[1fr_1fr_80px_60px] gap-2 border-b border-border pb-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span className="text-right">Active</span>
        </div>
        {rows.map((r) => (
          <div
            key={r.email}
            className="grid grid-cols-[1fr_1fr_80px_60px] items-center gap-2 border-b border-border/60 py-2 text-[11px]"
          >
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-foreground">{r.name}</span>
              {r.linked && (
                <span className="rounded bg-primary/15 px-1 py-0.5 font-mono text-[8px] uppercase tracking-wider text-primary">
                  linked
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              {r.email}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {r.role}
            </span>
            <span className="flex justify-end">
              <span className="h-3 w-5 rounded-full bg-primary/70" />
            </span>
          </div>
        ))}
      </div>
    </MockWindow>
  );
}

export function FlowMock() {
  const cells = [
    { label: "Paste", tone: "bg-muted/60", border: "border-border" },
    {
      label: "AI parse",
      tone: "bg-primary/15",
      border: "border-primary/40",
      accent: true,
    },
    { label: "Preview", tone: "bg-muted/60", border: "border-border" },
    { label: "Kanban", tone: "bg-muted/60", border: "border-border" },
  ];
  return (
    <div className="my-2 grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-2">
      {cells.map((c, i) => (
        <Fragment key={c.label}>
          <div
            className={`rounded-lg border ${c.border} ${c.tone} px-4 py-3 text-center`}
          >
            <div className="flex items-center justify-center gap-1.5">
              {c.accent && <Sparkles className="h-3.5 w-3.5 text-primary" />}
              <span
                className={`font-mono text-[11px] uppercase tracking-wider ${
                  c.accent ? "text-primary" : "text-foreground"
                }`}
              >
                {c.label}
              </span>
            </div>
          </div>
          {i < cells.length - 1 && (
            <ArrowRight className="h-4 w-4 text-muted-foreground/60" />
          )}
        </Fragment>
      ))}
    </div>
  );
}
