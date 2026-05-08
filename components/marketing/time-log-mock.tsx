// Screenshot-fidelity React mocks of the Time Log surface.
// Used by the homepage showcase section and the /docs Time Log section.
// Mirrors the real component styling in app/app/time-log/sheet-view.tsx
// and components/time-log/time-entries-dialog.tsx so the visual stays in
// sync with the product without shipping bitmap screenshots.

import {
  Download,
  GripVertical,
  Pencil,
  Play,
  Plus,
  Square,
} from "lucide-react";

// ─── shared chrome / chips ────────────────────────────────────────────────

function WindowChrome({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
      <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
      <span className="ml-3 inline-flex h-5 max-w-[60%] items-center gap-1.5 truncate rounded-md bg-background px-2 font-mono text-[10px] text-muted-foreground ring-1 ring-border">
        <span className="h-1 w-1 rounded-full bg-brand-success" />
        {url}
      </span>
    </div>
  );
}

const CAT_TONE = {
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  teal: "bg-teal-500/10 text-teal-600 dark:text-teal-300",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  slate: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
} as const;

type CatTone = keyof typeof CAT_TONE;

function CategoryChipMock({ name, tone }: { name: string; tone: CatTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${CAT_TONE[tone]}`}
    >
      {name}
    </span>
  );
}

type ColumnTone = "indigo" | "rose" | "emerald" | "amber";

function ColumnChipMock({
  label,
  tone,
}: {
  label: string;
  tone: ColumnTone;
}) {
  const cls =
    tone === "indigo"
      ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
      : tone === "rose"
        ? "bg-rose-500/10 text-rose-600 dark:text-rose-300"
        : tone === "emerald"
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

// ─── hero mock: full /app/time-log board ──────────────────────────────────

export function TimeLogBoardMock() {
  return (
    <div className="relative mx-auto">
      <div
        aria-hidden
        className="absolute -inset-6 z-0 rounded-[28px] bg-linear-to-br from-primary/15 via-transparent to-[#a4a3a3]/15 blur-2xl"
      />

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-foreground/10">
        <WindowChrome url="kamotion.io/app/time-log" />

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          {/* page header */}
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Time Log
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Mon May 4 → Sun May 10 · 13h logged
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <MockButton icon={<Plus className="h-3.5 w-3.5" />} label="New log" />
              <MockButton icon={<Pencil className="h-3.5 w-3.5" />} label="Add entry" />
              <MockButton icon={<Download className="h-3.5 w-3.5" />} label="Export CSV" />
            </div>
          </div>

          {/* filter bar */}
          <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-muted/30 p-3">
            <FilterPill label="Period" value="This week" />
            <FilterPill label="Card" value="All cards" wide />
            <FilterPill label="Category" value="All categories" />
            <FilterPill label="Group by" value="None" />
          </div>

          <div className="flex flex-col gap-3">
            <SectionTableMock
              label="In Progress"
              tone="indigo"
              meta="3 cards · 9h"
              rows={[
                {
                  date: "2026-05-08",
                  task: "Refresh quarterly partner deck",
                  status: { label: "In Progress", tone: "indigo" },
                  category: { name: "Design", tone: "rose" },
                  total: "3h 30m",
                  timer: "running",
                },
                {
                  date: "2026-05-07",
                  task: "Migrate analytics from UA to GA4",
                  status: { label: "In Progress", tone: "indigo" },
                  category: { name: "Code", tone: "teal" },
                  total: "4h 45m",
                  timer: "idle",
                },
                {
                  date: "2026-05-05",
                  task: "Fix mobile checkout double-tap bug",
                  status: { label: "Blocked", tone: "amber" },
                  category: { name: "Code", tone: "teal" },
                  total: "45m",
                  timer: "idle",
                },
              ]}
            />

            <SectionTableMock
              label="Review"
              tone="rose"
              meta="2 cards · 3h"
              rows={[
                {
                  date: "2026-05-06",
                  task: "Onboarding flow copy review",
                  status: { label: "Review", tone: "rose" },
                  category: { name: "Revision", tone: "indigo" },
                  total: "1h",
                  timer: "idle",
                },
                {
                  date: "2026-05-07",
                  task: "Q3 OKR review prep",
                  status: { label: "Review", tone: "rose" },
                  category: { name: "Meeting", tone: "sky" },
                  total: "2h",
                  timer: "idle",
                },
              ]}
            />

            <SectionTableMock
              label="Done"
              tone="emerald"
              meta="1 card · 1h"
              rows={[
                {
                  date: "2026-05-04",
                  task: "Wire Stripe webhook for invoice paid",
                  status: { label: "Done", tone: "emerald" },
                  category: { name: "Code", tone: "teal" },
                  total: "1h",
                  timer: "idle",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MockButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[11px] font-medium text-foreground/90">
      {icon}
      {label}
    </span>
  );
}

function FilterPill({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span
        className={`inline-flex h-7 items-center justify-between gap-2 rounded-md border border-border bg-card px-2 text-[11px] text-foreground ${
          wide ? "w-44" : "w-28"
        }`}
      >
        <span className="truncate">{value}</span>
        <svg
          className="h-3 w-3 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </div>
  );
}

type RowMock = {
  date: string;
  task: string;
  status: { label: string; tone: ColumnTone };
  category: { name: string; tone: CatTone };
  total: string;
  timer: "running" | "idle";
};

function SectionTableMock({
  label,
  tone,
  meta,
  rows,
}: {
  label: string;
  tone: "indigo" | "rose" | "emerald";
  meta: string;
  rows: RowMock[];
}) {
  const headerTone =
    tone === "indigo"
      ? "text-indigo-700 dark:text-indigo-300"
      : tone === "rose"
        ? "text-brand-accent"
        : "text-emerald-700 dark:text-emerald-300";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2">
        <span className={`text-xs font-semibold ${headerTone}`}>{label}</span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {meta}
        </span>
      </div>

      <table className="w-full table-fixed text-[11px]">
        <colgroup>
          <col className="w-7" />
          <col className="w-24" />
          <col />
          <col className="w-28" />
          <col className="w-28" />
          <col className="w-24" />
          <col className="w-20" />
        </colgroup>
        <thead className="border-b border-border bg-muted/20 text-left text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
          <tr>
            <th className="px-2 py-1.5" />
            <th className="px-3 py-1.5 font-medium">Last logged</th>
            <th className="px-3 py-1.5 font-medium">Card</th>
            <th className="px-3 py-1.5 font-medium">Status</th>
            <th className="px-3 py-1.5 font-medium">Category</th>
            <th className="px-3 py-1.5 font-medium">Timer</th>
            <th className="px-3 py-1.5 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border/60 last:border-b-0"
            >
              <td className="px-2 py-2 align-middle">
                <GripVertical className="h-3 w-3 text-muted-foreground/40" />
              </td>
              <td className="px-3 py-2 font-mono text-[10px] text-foreground">
                {row.date}
              </td>
              <td className="px-3 py-2 text-foreground">
                <span className="line-clamp-1">{row.task}</span>
              </td>
              <td className="px-3 py-2">
                <ColumnChipMock label={row.status.label} tone={row.status.tone} />
              </td>
              <td className="px-3 py-2">
                <CategoryChipMock name={row.category.name} tone={row.category.tone} />
              </td>
              <td className="px-3 py-2">
                {row.timer === "running" ? (
                  <span className="inline-flex h-6 items-center gap-1.5 rounded-md bg-destructive/10 px-2 text-[10px] font-medium text-destructive">
                    <Square className="h-2.5 w-2.5 fill-current" />
                    <span className="font-mono">27:01</span>
                  </span>
                ) : (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-primary">
                    <Play className="h-3 w-3 fill-current" />
                  </span>
                )}
              </td>
              <td className="px-3 py-2 text-right font-mono text-foreground">
                {row.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── secondary mock: card-detail entries dialog ────────────────────────────

export function TimeLogEntriesMock() {
  const entries: Array<{
    date: string;
    cat: { name: string; tone: CatTone };
    duration: string;
    notes: string;
  }> = [
    {
      date: "2026-05-08",
      cat: { name: "Design", tone: "rose" },
      duration: "1h 30m",
      notes: "Hero slide rework",
    },
    {
      date: "2026-05-07",
      cat: { name: "Design", tone: "rose" },
      duration: "2h",
      notes: "",
    },
    {
      date: "2026-05-05",
      cat: { name: "R&D", tone: "amber" },
      duration: "45m",
      notes: "Pull customer-logo refs",
    },
    {
      date: "2026-05-04",
      cat: { name: "Design", tone: "rose" },
      duration: "30m",
      notes: "Cover slide pass 1",
    },
  ];

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-3 z-0 rounded-2xl bg-linear-to-br from-primary/10 via-transparent to-transparent blur-xl"
      />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-foreground/5">
        <div className="border-b border-border bg-muted/40 px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="line-clamp-1 text-[12px] font-semibold text-foreground">
              Refresh quarterly partner deck
            </span>
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
              4 entries · 4h 45m
            </span>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            All time logged on this card. Edit a row to fix duration, date,
            category, or notes.
          </p>
        </div>

        <table className="w-full table-fixed text-[11px]">
          <colgroup>
            <col className="w-24" />
            <col className="w-24" />
            <col className="w-16" />
            <col />
          </colgroup>
          <thead className="border-b border-border bg-muted/20 text-left text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
            <tr>
              <th className="px-3 py-1.5 font-medium">Date</th>
              <th className="px-3 py-1.5 font-medium">Category</th>
              <th className="px-3 py-1.5 text-right font-medium">Duration</th>
              <th className="px-3 py-1.5 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i} className="border-b border-border/60 last:border-b-0">
                <td className="px-3 py-2 font-mono text-[10px] text-foreground">
                  {e.date}
                </td>
                <td className="px-3 py-2">
                  <CategoryChipMock name={e.cat.name} tone={e.cat.tone} />
                </td>
                <td className="px-3 py-2 text-right font-mono text-foreground">
                  {e.duration}
                </td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground">
                  <span className="line-clamp-1">{e.notes || "—"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/20 px-4 py-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            Card detail · entries
          </span>
          <span className="inline-flex h-7 items-center gap-1.5 rounded-md bg-foreground px-3 text-[10px] font-medium text-background">
            <Plus className="h-3 w-3" />
            Add entry
          </span>
        </div>
      </div>
    </div>
  );
}
