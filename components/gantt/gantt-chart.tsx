"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarOff, Triangle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Card, Priority, Status } from "@/lib/validators";
import { CardDetailDrawer } from "@/components/kanban/card-detail-drawer";
import {
  FilterBar,
  INITIAL_FILTERS,
  type BoardFilters,
} from "@/components/kanban/filter-bar";

type CardsResponse = { cards: Card[] };

async function fetchCards(): Promise<CardsResponse> {
  const res = await fetch("/api/cards", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load cards");
  return res.json();
}

async function patchCard(id: string, patch: Partial<Card>): Promise<Card> {
  const res = await fetch(`/api/cards/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Update failed");
  return body.card as Card;
}

const ROW_HEIGHT = 36;
const HEADER_HEIGHT = 56;
const DAY_WIDTH = 48;
const BAR_INSET = 4;
const DRAG_THRESHOLD_PX = 6;

const STATUS_ORDER: Status[] = [
  "Not Started",
  "Ready",
  "In Progress",
  "Blocked",
  "Review",
  "Approved",
];

const STATUS_COLOR: Record<Status, string> = {
  "Not Started": "text-slate-400 dark:text-slate-500",
  Ready: "text-teal-500",
  "In Progress": "text-indigo-500",
  Blocked: "text-amber-500",
  Review: "text-rose-500",
  Approved: "text-emerald-500",
};

const PRIORITY_ICON: Record<
  Priority,
  { node: React.ReactNode; label: string }
> = {
  High: {
    node: (
      <Triangle
        aria-hidden
        className="h-3.5 w-3.5 fill-red-400/60 text-red-400/60"
      />
    ),
    label: "High priority",
  },
  Normal: {
    node: (
      <Circle
        aria-hidden
        className="h-3.5 w-3.5 fill-emerald-400/60 text-emerald-400/60"
      />
    ),
    label: "Normal priority",
  },
  Low: {
    node: (
      <Triangle
        aria-hidden
        className="h-3.5 w-3.5 rotate-180 fill-yellow-400/60 text-yellow-400/60"
      />
    ),
    label: "Low priority",
  },
};

// "30m" / "1h"…"72h" / "4d"…"14d" → days, min 1 for visualization.
function durationToDays(d: string | null | undefined): number {
  if (!d) return 1;
  const m = d.match(/^(\d+(?:\.\d+)?)(m|h|d)$/);
  if (!m) return 1;
  const n = Number(m[1]);
  const unit = m[2];
  if (unit === "d") return Math.max(1, Math.round(n));
  if (unit === "h") return Math.max(1, Math.ceil(n / 24));
  return 1;
}

// Parse "YYYY-MM-DD" as UTC so day arithmetic is timezone-stable.
function toDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + n);
  return next;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}

function applyFilters(cards: Card[], f: BoardFilters): Card[] {
  const q = f.q.trim().toLowerCase();
  return cards.filter((c) => {
    if (f.assignee && c.assignee !== f.assignee) return false;
    if (f.priority !== "All") {
      if (f.priority === "Blocked") {
        if (c.status !== "Blocked") return false;
      } else if (c.priority !== f.priority) return false;
    }
    if (q) {
      const hay = `${c.task} ${c.notes ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

type ScheduledCard = {
  card: Card;
  start: Date;
  end: Date;
  durationDays: number;
};

export function GanttChart() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["cards"],
    queryFn: fetchCards,
  });
  const allCards = useMemo(() => data?.cards ?? [], [data]);

  const [filters, setFilters] = useState<BoardFilters>(INITIAL_FILTERS);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [dragOffsetDays, setDragOffsetDays] = useState<Record<string, number>>(
    {},
  );
  // Resize offsets are separate from move offsets so the bar can grow/shrink
  // without shifting its start date.
  const [resizeOffsetDays, setResizeOffsetDays] = useState<
    Record<string, number>
  >({});

  const filtered = useMemo(
    () => applyFilters(allCards, filters),
    [allCards, filters],
  );

  const assignees = useMemo(
    () => Array.from(new Set(allCards.map((c) => c.assignee))).sort(),
    [allCards],
  );

  const scheduled: ScheduledCard[] = useMemo(() => {
    const out: ScheduledCard[] = [];
    for (const c of filtered) {
      if (!c.due_date) continue;
      const end = toDate(c.due_date);
      const days = durationToDays(c.estimated_duration);
      const start = addDays(end, -(days - 1));
      out.push({ card: c, start, end, durationDays: days });
    }
    out.sort((a, b) => a.start.getTime() - b.start.getTime());
    return out;
  }, [filtered]);

  const undated = useMemo(
    () => filtered.filter((c) => !c.due_date),
    [filtered],
  );

  const { rangeStart, totalDays } = useMemo(() => {
    const today = toDate(new Date().toISOString().slice(0, 10));
    if (scheduled.length === 0) {
      return { rangeStart: addDays(today, -3), totalDays: 14 };
    }
    let min = scheduled[0].start;
    let max = scheduled[0].end;
    for (const s of scheduled) {
      if (s.start < min) min = s.start;
      if (s.end > max) max = s.end;
    }
    if (today < min) min = today;
    if (today > max) max = today;
    const start = addDays(min, -3);
    const end = addDays(max, 3);
    return { rangeStart: start, totalDays: diffDays(end, start) + 1 };
  }, [scheduled]);

  const months = useMemo(() => {
    const out: { label: string; startIdx: number; widthDays: number }[] = [];
    let cur: { label: string; startIdx: number; widthDays: number } | null =
      null;
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(rangeStart, i);
      const label = d.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
      if (!cur || cur.label !== label) {
        if (cur) out.push(cur);
        cur = { label, startIdx: i, widthDays: 1 };
      } else {
        cur.widthDays++;
      }
    }
    if (cur) out.push(cur);
    return out;
  }, [rangeStart, totalDays]);

  const updateDueDate = useMutation({
    mutationFn: ({ id, due_date }: { id: string; due_date: string }) =>
      patchCard(id, { due_date }),
    onMutate: async ({ id, due_date }) => {
      await qc.cancelQueries({ queryKey: ["cards"] });
      const prev = qc.getQueryData<CardsResponse>(["cards"]);
      qc.setQueryData<CardsResponse>(["cards"], (old) => ({
        cards: (old?.cards ?? []).map((c) =>
          c.id === id ? { ...c, due_date } : c,
        ),
      }));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["cards"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });

  const updateSchedule = useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: { due_date: string; estimated_duration: string };
    }) => patchCard(id, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: ["cards"] });
      const prev = qc.getQueryData<CardsResponse>(["cards"]);
      qc.setQueryData<CardsResponse>(["cards"], (old) => ({
        cards: (old?.cards ?? []).map((c) =>
          c.id === id ? { ...c, ...patch } : c,
        ),
      }));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["cards"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });

  const selectedCard =
    selectedCardId != null
      ? allCards.find((c) => c.id === selectedCardId) ?? null
      : null;

  const todayIdx = diffDays(
    toDate(new Date().toISOString().slice(0, 10)),
    rangeStart,
  );

  const totalCount = allCards.length;
  const shownCount = filtered.length;
  const isFiltered =
    filters.q !== "" ||
    filters.assignee !== "" ||
    filters.priority !== "All";

  const svgWidth = totalDays * DAY_WIDTH;
  const svgHeight = HEADER_HEIGHT + scheduled.length * ROW_HEIGHT;

  return (
    <main className="flex flex-1 flex-col p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gantt</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : error
                ? "Failed to load cards."
                : isFiltered
                  ? `${shownCount} of ${totalCount} cards`
                  : `${scheduled.length} scheduled · ${undated.length} unscheduled`}
          </p>
        </div>
      </div>

      {totalCount > 0 && (
        <FilterBar
          filters={filters}
          onChange={setFilters}
          assignees={assignees}
        />
      )}

      {scheduled.length > 0 && <StatusLegend />}

      {scheduled.length === 0 ? (
        <EmptyChart hasCards={totalCount > 0} />
      ) : (
        <div className="flex overflow-hidden rounded-xl border border-border bg-card">
          <LabelColumn
            cards={scheduled.map((s) => s.card)}
            onOpen={setSelectedCardId}
          />
          <div className="flex-1 overflow-x-auto">
            <ChartSvg
              width={svgWidth}
              height={svgHeight}
              totalDays={totalDays}
              months={months}
              rangeStart={rangeStart}
              todayIdx={todayIdx}
              scheduled={scheduled}
              dragOffsetDays={dragOffsetDays}
              setDragOffsetDays={setDragOffsetDays}
              resizeOffsetDays={resizeOffsetDays}
              setResizeOffsetDays={setResizeOffsetDays}
              onOpen={setSelectedCardId}
              onCommit={(id, due_date) =>
                updateDueDate.mutate({ id, due_date })
              }
              onResize={(id, patch) => updateSchedule.mutate({ id, patch })}
            />
          </div>
        </div>
      )}

      {undated.length > 0 && (
        <UndatedList cards={undated} onOpen={setSelectedCardId} />
      )}

      <CardDetailDrawer
        card={selectedCard}
        onOpenChange={(open) => {
          if (!open) setSelectedCardId(null);
        }}
      />
    </main>
  );
}

function LabelColumn({
  cards,
  onOpen,
}: {
  cards: Card[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="shrink-0 border-r border-border bg-muted/20 w-[140px] md:w-[340px]">
      <div
        className="border-b border-border"
        style={{ height: HEADER_HEIGHT }}
      />
      {cards.map((c) => {
        const priority =
          PRIORITY_ICON[c.priority as Priority] ?? PRIORITY_ICON.Normal;
        return (
          <button
            type="button"
            key={c.id}
            onClick={() => onOpen(c.id)}
            className="flex w-full items-center gap-2 border-b border-border px-2 md:px-3 text-sm text-left transition-colors cursor-pointer hover:bg-accent"
            style={{ height: ROW_HEIGHT }}
            title={c.task}
          >
            <span
              className="shrink-0"
              aria-label={priority.label}
              title={priority.label}
            >
              {priority.node}
            </span>
            <span className="truncate">
              {c.task.replace(/^\[demo\]\s*/, "")}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function StatusLegend() {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border bg-card px-3 py-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Status
      </span>
      {STATUS_ORDER.map((s) => (
        <div key={s} className={cn("flex items-center gap-1.5", STATUS_COLOR[s])}>
          <span className="h-3 w-3 rounded-sm bg-current opacity-80" />
          <span className="text-xs text-foreground">{s}</span>
        </div>
      ))}
    </div>
  );
}

type ChartSvgProps = {
  width: number;
  height: number;
  totalDays: number;
  months: { label: string; startIdx: number; widthDays: number }[];
  rangeStart: Date;
  todayIdx: number;
  scheduled: ScheduledCard[];
  dragOffsetDays: Record<string, number>;
  setDragOffsetDays: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  resizeOffsetDays: Record<string, number>;
  setResizeOffsetDays: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  onOpen: (id: string) => void;
  onCommit: (id: string, due_date: string) => void;
  onResize: (
    id: string,
    patch: { due_date: string; estimated_duration: string },
  ) => void;
};

function ChartSvg({
  width,
  height,
  totalDays,
  months,
  rangeStart,
  todayIdx,
  scheduled,
  dragOffsetDays,
  setDragOffsetDays,
  resizeOffsetDays,
  setResizeOffsetDays,
  onOpen,
  onCommit,
  onResize,
}: ChartSvgProps) {
  const dragRef = useRef<{
    id: string;
    startX: number;
    moved: boolean;
  } | null>(null);
  const resizeRef = useRef<{
    id: string;
    startX: number;
    moved: boolean;
    baseDays: number;
  } | null>(null);

  const clearOffset = (id: string) =>
    setDragOffsetDays((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  const clearResize = (id: string) =>
    setResizeOffsetDays((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });

  const handlePointerDown =
    (id: string) => (e: React.PointerEvent<SVGRectElement>) => {
      e.preventDefault();
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      dragRef.current = { id, startX: e.clientX, moved: false };
    };

  const handlePointerMove = (e: React.PointerEvent<SVGRectElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) >= DRAG_THRESHOLD_PX) drag.moved = true;
    const days = Math.round(dx / DAY_WIDTH);
    setDragOffsetDays((prev) =>
      prev[drag.id] === days ? prev : { ...prev, [drag.id]: days },
    );
  };

  const handlePointerUp =
    (id: string) => (e: React.PointerEvent<SVGRectElement>) => {
      const drag = dragRef.current;
      dragRef.current = null;
      const target = e.currentTarget as Element;
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }
      const offset = dragOffsetDays[id] ?? 0;

      if (!drag?.moved) {
        clearOffset(id);
        onOpen(id);
        return;
      }
      if (offset === 0) {
        clearOffset(id);
        return;
      }
      const sched = scheduled.find((s) => s.card.id === id);
      if (sched) {
        const newEnd = addDays(sched.end, offset);
        onCommit(id, toIso(newEnd));
      }
      clearOffset(id);
    };

  // Right-edge resize: shifts the due_date without moving the start. The
  // bar's effective duration in days becomes base + offset (clamped ≥ 1).
  const handleResizeDown =
    (id: string, baseDays: number) =>
    (e: React.PointerEvent<SVGRectElement>) => {
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      resizeRef.current = { id, startX: e.clientX, moved: false, baseDays };
    };

  const handleResizeMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = resizeRef.current;
    if (!r) return;
    const dx = e.clientX - r.startX;
    if (Math.abs(dx) >= DRAG_THRESHOLD_PX) r.moved = true;
    const days = Math.round(dx / DAY_WIDTH);
    const clamped = Math.max(days, -(r.baseDays - 1));
    setResizeOffsetDays((prev) =>
      prev[r.id] === clamped ? prev : { ...prev, [r.id]: clamped },
    );
  };

  const handleResizeUp =
    (id: string) => (e: React.PointerEvent<SVGRectElement>) => {
      const r = resizeRef.current;
      resizeRef.current = null;
      const target = e.currentTarget as Element;
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }
      const offset = resizeOffsetDays[id] ?? 0;
      if (!r?.moved || offset === 0) {
        clearResize(id);
        return;
      }
      const sched = scheduled.find((s) => s.card.id === id);
      if (sched) {
        const newDurationDays = Math.max(1, sched.durationDays + offset);
        const newEnd = addDays(sched.start, newDurationDays - 1);
        onResize(id, {
          due_date: toIso(newEnd),
          estimated_duration: `${newDurationDays}d`,
        });
      }
      clearResize(id);
    };

  return (
    <svg width={width} height={height} className="block">
      {months.map((m) => (
        <g key={`${m.label}-${m.startIdx}`}>
          <rect
            x={m.startIdx * DAY_WIDTH}
            y={0}
            width={m.widthDays * DAY_WIDTH}
            height={HEADER_HEIGHT / 2}
            className="fill-muted"
          />
          <text
            x={m.startIdx * DAY_WIDTH + 8}
            y={HEADER_HEIGHT / 2 - 8}
            className="fill-muted-foreground text-[11px] font-medium uppercase tracking-wider"
          >
            {m.label}
          </text>
        </g>
      ))}

      {Array.from({ length: totalDays }).map((_, i) => {
        const d = addDays(rangeStart, i);
        const dow = d.getUTCDay();
        const isWeekend = dow === 0 || dow === 6;
        return (
          <g key={i}>
            {isWeekend && (
              <rect
                x={i * DAY_WIDTH}
                y={HEADER_HEIGHT}
                width={DAY_WIDTH}
                height={height - HEADER_HEIGHT}
                className="fill-muted/40"
              />
            )}
            <line
              x1={i * DAY_WIDTH}
              y1={HEADER_HEIGHT / 2}
              x2={i * DAY_WIDTH}
              y2={height}
              className="stroke-border"
              strokeWidth={1}
            />
            <text
              x={i * DAY_WIDTH + DAY_WIDTH / 2}
              y={HEADER_HEIGHT - 18}
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[10px]"
            >
              {d.toLocaleString("en-US", {
                weekday: "short",
                timeZone: "UTC",
              })[0]}
            </text>
            <text
              x={i * DAY_WIDTH + DAY_WIDTH / 2}
              y={HEADER_HEIGHT - 4}
              textAnchor="middle"
              className="fill-foreground font-mono text-[11px]"
            >
              {d.getUTCDate()}
            </text>
          </g>
        );
      })}

      <line
        x1={0}
        y1={HEADER_HEIGHT}
        x2={width}
        y2={HEADER_HEIGHT}
        className="stroke-border"
        strokeWidth={1}
      />

      {todayIdx >= 0 && todayIdx < totalDays && (
        <line
          x1={todayIdx * DAY_WIDTH + DAY_WIDTH / 2}
          y1={HEADER_HEIGHT / 2}
          x2={todayIdx * DAY_WIDTH + DAY_WIDTH / 2}
          y2={height}
          className="stroke-primary"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      )}

      {scheduled.map((_, i) => (
        <line
          key={i}
          x1={0}
          y1={HEADER_HEIGHT + (i + 1) * ROW_HEIGHT}
          x2={width}
          y2={HEADER_HEIGHT + (i + 1) * ROW_HEIGHT}
          className="stroke-border/60"
          strokeWidth={1}
        />
      ))}

      {scheduled.map((s, i) => {
        const moveOffset = dragOffsetDays[s.card.id] ?? 0;
        const resizeOffset = resizeOffsetDays[s.card.id] ?? 0;
        const startIdx = diffDays(s.start, rangeStart) + moveOffset;
        const x = startIdx * DAY_WIDTH + 2;
        const y = HEADER_HEIGHT + i * ROW_HEIGHT + BAR_INSET;
        const effectiveDays = Math.max(1, s.durationDays + resizeOffset);
        const w = Math.max(effectiveDays * DAY_WIDTH - 4, 12);
        const h = ROW_HEIGHT - BAR_INSET * 2;
        const newEnd = addDays(s.end, moveOffset + resizeOffset);
        const labelChars = Math.max(0, Math.floor((w - 16) / 7));
        const labelText = s.card.task
          .replace(/^\[demo\]\s*/, "")
          .slice(0, labelChars);
        const handleW = 6;
        return (
          <g
            key={s.card.id}
            className={
              STATUS_COLOR[s.card.status] ?? STATUS_COLOR["Not Started"]
            }
          >
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={4}
              className="fill-current opacity-80 transition-opacity hover:opacity-100"
              onPointerDown={handlePointerDown(s.card.id)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp(s.card.id)}
              onPointerCancel={handlePointerUp(s.card.id)}
              style={{ cursor: "grab", touchAction: "none" }}
            >
              <title>
                {s.card.task} · ends {toIso(newEnd)} · {effectiveDays}d
              </title>
            </rect>
            {labelText.length > 0 && (
              <text
                x={x + 8}
                y={y + h / 2 + 4}
                className="pointer-events-none fill-white text-[11px] font-medium"
              >
                {labelText}
              </text>
            )}
            {/* Right-edge resize handle. Wider hit area than the visible grip
                so it's easier to grab on touch devices. */}
            <rect
              x={x + w - handleW}
              y={y}
              width={handleW}
              height={h}
              className="fill-white/30 hover:fill-white/60"
              onPointerDown={handleResizeDown(s.card.id, s.durationDays)}
              onPointerMove={handleResizeMove}
              onPointerUp={handleResizeUp(s.card.id)}
              onPointerCancel={handleResizeUp(s.card.id)}
              style={{ cursor: "ew-resize", touchAction: "none" }}
            >
              <title>Drag to change due date</title>
            </rect>
          </g>
        );
      })}
    </svg>
  );
}

function EmptyChart({ hasCards }: { hasCards: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <CalendarOff className="h-6 w-6 text-primary" />
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight">
        Nothing scheduled
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasCards
          ? "Cards need a due date to appear on the timeline. Open a card and set one."
          : "Create cards from the Board to populate the Gantt."}
      </p>
    </div>
  );
}

function UndatedList({
  cards,
  onOpen,
}: {
  cards: Card[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="mt-6">
      <h2 className="mb-2 text-sm font-medium text-muted-foreground">
        Unscheduled — {cards.length}
      </h2>
      <div className="flex flex-wrap gap-2">
        {cards.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onOpen(c.id)}
            className={cn(
              "rounded-md border border-dashed border-border bg-card px-3 py-2 text-left text-sm",
              "hover:border-primary/50 hover:bg-primary/5",
            )}
          >
            <div className="font-medium">
              {c.task.replace(/^\[demo\]\s*/, "")}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {c.assignee} · {c.status}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
