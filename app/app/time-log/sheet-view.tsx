"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  Plus,
  Pencil,
  Download,
  Clock4,
  Play,
  Square,
  GripVertical,
} from "lucide-react";
import {
  type Card,
  type Column,
  type Status,
  type TimeCategory,
  type PeriodPreset,
} from "@/lib/validators";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  describeRange,
  formatMinutes,
  parseAnchorMondayIso,
  rangeForPreset,
} from "@/lib/time-log/period";
import { CardOption, ColumnChip } from "@/components/time-log/card-option";
import { CardDetailDrawer } from "@/components/kanban/card-detail-drawer";
import {
  ManualEntryDialog,
  type EntryWithJoins,
} from "@/components/time-log/manual-entry-dialog";

type EntriesResponse = { entries: EntryWithJoins[] };
type CardsResponse = { cards: Card[] };
type CategoriesResponse = { categories: TimeCategory[] };
type SettingsResponse = { settings: { biweeklyAnchorMonday?: string } };
type ActiveResponse = { entry: EntryWithJoins | null };

type SectionKey = "in_progress" | "review" | "done";

type CardWithStats = Card & {
  totalMinutes: number;
  lastEntryAt: string | null;
  category: TimeCategory | null;
};

const PERIOD_LABEL: Record<PeriodPreset, string> = {
  this_week: "This week",
  last_week: "Last week",
  biweekly_current: "Bi-weekly · current",
  biweekly_last: "Bi-weekly · last",
  this_month: "This month",
  last_month: "Last month",
  custom: "Custom range",
  all: "All time",
};

type GroupBy = "none" | "day" | "category";

const COLUMN_COUNT = 8;

// Shared column geometry: table-fixed + this <colgroup> so all
// section tables stay perfectly aligned.
function SheetColgroup() {
  return (
    <colgroup>
      <col className="w-10" />
      <col className="w-28" />
      <col />
      <col className="w-32" />
      <col className="w-32" />
      <col className="w-28" />
      <col className="w-24" />
      <col className="w-12" />
    </colgroup>
  );
}

async function fetchCards(): Promise<CardsResponse> {
  const res = await fetch("/api/cards", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load cards");
  return res.json();
}

async function fetchAllEntries(): Promise<EntriesResponse> {
  const res = await fetch("/api/time-entries?period=all", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load time entries");
  return res.json();
}

async function fetchCategories(): Promise<CategoriesResponse> {
  const res = await fetch("/api/categories", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load categories");
  return res.json();
}

async function fetchSettings(): Promise<SettingsResponse> {
  const res = await fetch("/api/settings", { cache: "no-store" });
  if (!res.ok) return { settings: {} };
  return res.json();
}

async function fetchActive(): Promise<ActiveResponse> {
  const res = await fetch("/api/time-entries/active", { cache: "no-store" });
  if (!res.ok) return { entry: null };
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

async function startTimer(input: {
  card_id: string | null;
  category_id: string | null;
  notes?: string | null;
}): Promise<EntryWithJoins> {
  const res = await fetch("/api/time-entries/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Failed to start timer");
  return body.entry as EntryWithJoins;
}

async function stopTimer(): Promise<EntryWithJoins> {
  const res = await fetch("/api/time-entries/stop", { method: "POST" });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Failed to stop timer");
  return body.entry as EntryWithJoins;
}

export function TimeLogSheet() {
  const qc = useQueryClient();
  const [period, setPeriod] = useState<PeriodPreset>("this_week");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [cardFilter, setCardFilter] = useState<string>("__all");
  const [categoryFilter, setCategoryFilter] = useState<string>("__all");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [addOpen, setAddOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EntryWithJoins | null>(null);
  const [presetCardId, setPresetCardId] = useState<string | null>(null);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const { data: cardsData, isLoading: cardsLoading } = useQuery({
    queryKey: ["cards"],
    queryFn: fetchCards,
  });
  const { data: entriesData } = useQuery({
    queryKey: ["time-entries", "all"],
    queryFn: fetchAllEntries,
  });
  const { data: catsData } = useQuery({
    queryKey: ["time-categories"],
    queryFn: fetchCategories,
  });
  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });
  const { data: activeData } = useQuery({
    queryKey: ["time-entries", "active"],
    queryFn: fetchActive,
    refetchInterval: 30_000,
  });

  const cards = useMemo(() => cardsData?.cards ?? [], [cardsData]);
  const entries = useMemo(
    () => entriesData?.entries ?? [],
    [entriesData],
  );
  const categories = useMemo(
    () => catsData?.categories ?? [],
    [catsData],
  );
  const active = activeData?.entry ?? null;

  const anchor = parseAnchorMondayIso(
    settingsData?.settings?.biweeklyAnchorMonday,
  );
  const range = rangeForPreset(
    period,
    new Date(),
    anchor,
    period === "custom" && customFrom && customTo
      ? { from: new Date(customFrom), to: new Date(customTo) }
      : undefined,
  );

  // Aggregations per card. lastEntryAt drives the "Last logged" column
  // and is what the Period filter compares against.
  const statsByCard = useMemo(() => {
    const m = new Map<
      string,
      { totalMinutes: number; lastEntryAt: string | null }
    >();
    for (const e of entries) {
      if (!e.card_id) continue;
      const cur = m.get(e.card_id) ?? {
        totalMinutes: 0,
        lastEntryAt: null,
      };
      cur.totalMinutes += e.duration_minutes ?? 0;
      if (!cur.lastEntryAt || e.started_at > cur.lastEntryAt) {
        cur.lastEntryAt = e.started_at;
      }
      m.set(e.card_id, cur);
    }
    return m;
  }, [entries]);

  const enrichedCards: CardWithStats[] = useMemo(() => {
    return cards.map((c) => {
      const stats = statsByCard.get(c.id);
      const cat = c.default_category_id
        ? categories.find((x) => x.id === c.default_category_id) ?? null
        : null;
      return {
        ...c,
        totalMinutes: stats?.totalMinutes ?? 0,
        lastEntryAt: stats?.lastEntryAt ?? null,
        category: cat,
      };
    });
  }, [cards, statsByCard, categories]);

  // Filter cards by Period using the most recent logged time. Cards
  // with no entries fall back to request_date so the "all-time" view
  // still shows everything.
  const periodFilteredCards = useMemo(() => {
    if (!range) return enrichedCards;
    return enrichedCards.filter((c) => {
      const anchorIso = c.lastEntryAt ?? c.request_date;
      if (!anchorIso) return false;
      const d = new Date(anchorIso);
      return d >= range.start && d < range.end;
    });
  }, [enrichedCards, range]);

  const visibleCards = useMemo(() => {
    return periodFilteredCards.filter((c) => {
      if (cardFilter !== "__all" && c.id !== cardFilter) return false;
      if (
        categoryFilter !== "__all" &&
        c.default_category_id !== categoryFilter
      )
        return false;
      return true;
    });
  }, [periodFilteredCards, cardFilter, categoryFilter]);

  const sections = useMemo(() => {
    const inProgress: CardWithStats[] = [];
    const review: CardWithStats[] = [];
    const done: CardWithStats[] = [];
    for (const c of visibleCards) {
      const col = c.column_name as Column;
      if (col === "Done") done.push(c);
      else if (col === "Review") review.push(c);
      else inProgress.push(c);
    }
    return { in_progress: inProgress, review, done };
  }, [visibleCards]);

  const totalMinutes = visibleCards.reduce(
    (sum, c) => sum + c.totalMinutes,
    0,
  );

  // CSV export uses the per-entry feed so the spreadsheet keeps full
  // fidelity (one row per session). Period filter applies on the
  // server side via started_at to keep payloads sane.
  const csvQueryString = useMemo(() => {
    const qs = new URLSearchParams();
    qs.set("period", period);
    if (period === "custom") {
      if (customFrom) qs.set("from", customFrom);
      if (customTo) qs.set("to", customTo);
    }
    if (cardFilter !== "__all") qs.set("card_id", cardFilter);
    if (categoryFilter !== "__all") qs.set("category_id", categoryFilter);
    qs.set("format", "csv");
    return qs;
  }, [period, customFrom, customTo, cardFilter, categoryFilter]);

  const moveCard = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Card> }) =>
      patchCard(id, patch),
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const activeDragCard = activeDragId
    ? cards.find((c) => c.id === activeDragId) ?? null
    : null;

  const handleDragStart = (e: DragStartEvent) =>
    setActiveDragId(String(e.active.id));

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragId(null);
    const { active: dragActive, over } = e;
    if (!over) return;
    const dest = String(over.id) as SectionKey;
    const card = cards.find((c) => c.id === String(dragActive.id));
    if (!card) return;

    const TARGET: Record<
      SectionKey,
      { column_name: Column; status: Status }
    > = {
      in_progress: { column_name: "In Progress", status: "In Progress" },
      review: { column_name: "Review", status: "Review" },
      done: { column_name: "Done", status: "Approved" },
    };
    const target = TARGET[dest];
    if (card.column_name === target.column_name) return;

    moveCard.mutate({ id: card.id, patch: target });
  };

  const isEmpty = !cardsLoading && visibleCards.length === 0;

  const openAddEntry = (cardId: string | null) => {
    setEditingEntry(null);
    setPresetCardId(cardId);
    setAddOpen(true);
  };

  const openCard = (id: string) => {
    setOpenCardId(id);
    setDrawerOpen(true);
  };

  return (
    <main className="flex flex-1 flex-col p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Time Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {cardsLoading
              ? "Loading…"
              : range
                ? `${describeRange(range)} · ${formatMinutes(totalMinutes)} logged`
                : `All time · ${formatMinutes(totalMinutes)} logged`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NewLogButton active={active} categories={categories} />
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => openAddEntry(null)}
          >
            <Pencil className="h-4 w-4" />
            Add entry
          </Button>
          <a
            href={`/api/time-entries?${csvQueryString.toString()}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-accent"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-muted/20 p-3">
        <FilterField label="Period">
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodPreset)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PERIOD_LABEL) as PeriodPreset[]).map((p) => (
                <SelectItem key={p} value={p}>
                  {PERIOD_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        {period === "custom" && (
          <>
            <FilterField label="From">
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-40"
              />
            </FilterField>
            <FilterField label="To">
              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-40"
              />
            </FilterField>
          </>
        )}

        <FilterField label="Card">
          <Select value={cardFilter} onValueChange={setCardFilter}>
            <SelectTrigger className="w-[36rem] min-w-0 max-w-full overflow-hidden">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-(--radix-select-trigger-width) min-w-0">
              <SelectItem value="__all">All cards</SelectItem>
              {cards.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <CardOption card={c} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Category">
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Group by">
          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </div>

      {isEmpty ? (
        <EmptyState onAdd={() => openAddEntry(null)} />
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragCancel={() => setActiveDragId(null)}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col gap-4">
            <SectionTable
              section="in_progress"
              label="In Progress"
              tone="indigo"
              cards={sections.in_progress}
              groupBy={groupBy}
              active={active}
              onOpenCard={openCard}
              onAddEntry={openAddEntry}
            />
            <SectionTable
              section="review"
              label="Review"
              tone="rose"
              cards={sections.review}
              groupBy={groupBy}
              active={active}
              onOpenCard={openCard}
              onAddEntry={openAddEntry}
            />
            <SectionTable
              section="done"
              label="Done"
              tone="emerald"
              cards={sections.done}
              groupBy={groupBy}
              active={active}
              onOpenCard={openCard}
              onAddEntry={openAddEntry}
            />
          </div>

          <DragOverlay dropAnimation={null}>
            {activeDragCard ? <DragGhost card={activeDragCard} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <ManualEntryDialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) {
            setEditingEntry(null);
            setPresetCardId(null);
          }
        }}
        editing={editingEntry}
        presetCardId={presetCardId}
        cards={cards}
        categories={categories}
      />

      <CardDetailDrawer
        card={openCardId ? cards.find((c) => c.id === openCardId) ?? null : null}
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setOpenCardId(null);
        }}
      />
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────
// New-log popover (standalone timer for admin/calls/issues)
// ───────────────────────────────────────────────────────────────────

function NewLogButton({
  active,
  categories,
}: {
  active: EntryWithJoins | null;
  categories: TimeCategory[];
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string>("__none");
  const [notes, setNotes] = useState<string>("");

  const isStandaloneRunning = active !== null && active.card_id === null;

  const start = useMutation({
    mutationFn: () =>
      startTimer({
        card_id: null,
        category_id: categoryId === "__none" ? null : categoryId,
        notes: notes.trim() ? notes : null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time-entries"] });
      setNotes("");
      setOpen(false);
    },
  });

  const stop = useMutation({
    mutationFn: stopTimer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time-entries"] });
    },
  });

  const elapsed = useElapsedSince(
    isStandaloneRunning ? active.started_at : null,
  );

  if (isStandaloneRunning) {
    return (
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer ring-1 ring-primary/40"
        onClick={() => stop.mutate()}
        disabled={stop.isPending}
      >
        <Square className="h-4 w-4 fill-current text-destructive" />
        <span className="font-mono text-xs">{elapsed}</span>
        <span className="text-xs text-muted-foreground">
          {active.time_categories?.name ?? "uncategorized"}
        </span>
      </Button>
    );
  }

  // Disabled when a card-attached timer is running — can't start two.
  const disabled = active !== null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
          New log
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 gap-3">
        <div className="flex flex-col gap-2">
          <Label className="text-xs">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">No category</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xs">Notes (optional)</Label>
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Admin call, issue, miscellaneous…"
          />
        </div>
        {start.error && (
          <p className="text-xs text-destructive">
            {(start.error as Error).message}
          </p>
        )}
        <Button
          className="w-full cursor-pointer"
          onClick={() => start.mutate()}
          disabled={start.isPending}
        >
          {start.isPending ? "Starting…" : "Start"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}

// ───────────────────────────────────────────────────────────────────
// Section + card rows
// ───────────────────────────────────────────────────────────────────

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function SectionTable({
  section,
  label,
  tone,
  cards,
  groupBy,
  active,
  onOpenCard,
  onAddEntry,
}: {
  section: SectionKey;
  label: string;
  tone: "indigo" | "rose" | "emerald";
  cards: CardWithStats[];
  groupBy: GroupBy;
  active: EntryWithJoins | null;
  onOpenCard: (id: string) => void;
  onAddEntry: (cardId: string | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: section });
  const total = cards.reduce((sum, c) => sum + c.totalMinutes, 0);

  const groups = useMemo(() => {
    if (groupBy === "none") {
      return [{ key: "all", label: "", cards }];
    }
    const map = new Map<
      string,
      { key: string; label: string; cards: CardWithStats[] }
    >();
    for (const c of cards) {
      let key: string;
      let lbl: string;
      if (groupBy === "day") {
        key = (c.lastEntryAt ?? c.request_date)?.slice(0, 10) ?? "—";
        lbl = key;
      } else {
        key = c.default_category_id ?? "__none";
        lbl = c.category?.name ?? "(no category)";
      }
      if (!map.has(key)) map.set(key, { key, label: lbl, cards: [] });
      map.get(key)!.cards.push(c);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [cards, groupBy]);

  const headerTone =
    tone === "indigo"
      ? "text-indigo-700 dark:text-indigo-300"
      : tone === "rose"
        ? "text-brand-accent"
        : "text-emerald-700 dark:text-emerald-300";

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "overflow-hidden rounded-xl border bg-card transition-colors",
        isOver ? "border-primary/60 ring-2 ring-primary/30" : "border-border",
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
        <span className={cn("text-sm font-semibold", headerTone)}>{label}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {cards.length} {cards.length === 1 ? "card" : "cards"} ·{" "}
          {formatMinutes(total)}
        </span>
      </div>

      <table className="w-full table-fixed text-sm">
        <SheetColgroup />
        <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-2 py-2" />
            <th className="px-3 py-2 font-medium">Last logged</th>
            <th className="px-3 py-2 font-medium">Card</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Category</th>
            <th className="px-3 py-2 font-medium">Timer</th>
            <th className="px-3 py-2 text-right font-medium">Total time</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {cards.length === 0 ? (
            <tr>
              <td
                colSpan={COLUMN_COUNT}
                className="px-3 py-6 text-center text-xs italic text-muted-foreground/60"
              >
                Drop a card here to mark it {label.toLowerCase()}.
              </td>
            </tr>
          ) : (
            groups.map((g) => (
              <GroupBlock
                key={g.key}
                label={groupBy === "none" ? null : g.label}
                cards={g.cards}
                active={active}
                onOpenCard={onOpenCard}
                onAddEntry={onAddEntry}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function GroupBlock({
  label,
  cards,
  active,
  onOpenCard,
  onAddEntry,
}: {
  label: string | null;
  cards: CardWithStats[];
  active: EntryWithJoins | null;
  onOpenCard: (id: string) => void;
  onAddEntry: (cardId: string | null) => void;
}) {
  const groupTotal = cards.reduce((sum, c) => sum + c.totalMinutes, 0);
  return (
    <>
      {label !== null && (
        <tr className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
          <td className="px-2 py-1.5" />
          <td className="px-3 py-1.5" colSpan={5}>
            {label}
          </td>
          <td className="px-3 py-1.5 text-right font-mono">
            {formatMinutes(groupTotal)}
          </td>
          <td />
        </tr>
      )}
      {cards.map((c) => (
        <CardRow
          key={c.id}
          card={c}
          active={active}
          onOpen={() => onOpenCard(c.id)}
          onAddEntry={() => onAddEntry(c.id)}
        />
      ))}
    </>
  );
}

function CardRow({
  card,
  active,
  onOpen,
  onAddEntry,
}: {
  card: CardWithStats;
  active: EntryWithJoins | null;
  onOpen: () => void;
  onAddEntry: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card.id,
  });

  const dateText = (card.lastEntryAt ?? card.request_date)?.slice(0, 10) ?? "—";
  const col = card.column_name as Column;

  return (
    <tr
      ref={setNodeRef}
      className={cn(
        "border-b border-border/60 last:border-b-0 hover:bg-muted/20",
        isDragging && "opacity-30",
      )}
    >
      <td className="px-2 py-2 align-middle">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to move card between sections"
          title="Drag to move between In Progress / Review / Done"
          className="flex h-6 w-6 cursor-grab items-center justify-center rounded text-muted-foreground/50 hover:bg-accent hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      </td>
      <td className="px-3 py-2 font-mono text-xs">{dateText}</td>
      <td className="px-3 py-2">
        <button
          type="button"
          onClick={onOpen}
          className="line-clamp-1 cursor-pointer text-left hover:underline"
        >
          {card.task.replace(/^\[demo\]\s*/, "")}
        </button>
      </td>
      <td className="px-3 py-2">
        <ColumnChip column={col} />
      </td>
      <td className="px-3 py-2">
        {card.category ? (
          <CategoryChip
            name={card.category.name}
            color={card.category.color}
          />
        ) : (
          <span className="text-muted-foreground/60">—</span>
        )}
      </td>
      <td className="px-3 py-2">
        <CardTimerControls card={card} active={active} onAddEntry={onAddEntry} />
      </td>
      <td className="px-3 py-2 text-right font-mono">
        {card.totalMinutes > 0 ? formatMinutes(card.totalMinutes) : "—"}
      </td>
      <td className="px-3 py-2 text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          onClick={onOpen}
          aria-label="Edit card"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}

function CardTimerControls({
  card,
  active,
  onAddEntry,
}: {
  card: CardWithStats;
  active: EntryWithJoins | null;
  onAddEntry: () => void;
}) {
  const qc = useQueryClient();
  const isThisRow = active?.card_id === card.id;
  const otherTimerRunning = active !== null && !isThisRow;

  const start = useMutation({
    mutationFn: () =>
      startTimer({
        card_id: card.id,
        category_id: card.default_category_id ?? null,
        notes: null,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["time-entries"] }),
  });

  const stop = useMutation({
    mutationFn: stopTimer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["time-entries"] }),
  });

  const elapsed = useElapsedSince(
    isThisRow && active ? active.started_at : null,
  );

  return (
    <div className="flex items-center gap-1">
      {isThisRow ? (
        <button
          type="button"
          onClick={() => stop.mutate()}
          disabled={stop.isPending}
          aria-label="Stop timer"
          title="Stop timer"
          className="inline-flex h-7 items-center gap-1.5 rounded-md bg-destructive/10 px-2 text-xs font-medium text-destructive hover:bg-destructive/20"
        >
          <Square className="h-3 w-3 fill-current" />
          <span className="font-mono">{elapsed}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => start.mutate()}
          disabled={start.isPending || otherTimerRunning}
          aria-label="Start timer"
          title={otherTimerRunning ? "Another timer is running" : "Start timer"}
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-md text-primary hover:bg-primary/10",
            otherTimerRunning && "opacity-30 hover:bg-transparent",
          )}
        >
          <Play className="h-3.5 w-3.5 fill-current" />
        </button>
      )}
      <button
        type="button"
        onClick={onAddEntry}
        aria-label="Add manual entry"
        title="Add manual entry"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function DragGhost({ card }: { card: Card }) {
  const title = card.task.replace(/^\[demo\]\s*/, "");
  return (
    <div className="rotate-[1deg] rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg ring-1 ring-primary/30">
      <p className="line-clamp-1 max-w-[24rem] font-medium">{title}</p>
      <p className="text-[11px] text-muted-foreground">
        Drop on a section to move
      </p>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────

// Live-ticking elapsed string for a started_at ISO timestamp. Returns
// null when no timer is running, "h:mm:ss" otherwise.
function useElapsedSince(startedAt: string | null): string {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!startedAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);
  if (!startedAt) return "";
  const ms = now - new Date(startedAt).getTime();
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const CHIP_TONE: Record<string, string> = {
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  teal: "bg-teal-500/10 text-teal-600 dark:text-teal-300",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  slate: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
};

function CategoryChip({
  name,
  color,
}: {
  name: string;
  color: string | null;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium",
        CHIP_TONE[color ?? ""] ?? "bg-muted text-muted-foreground",
      )}
    >
      {name}
    </span>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Clock4 className="h-6 w-6 text-primary" />
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight">
        No cards in this period
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Switch the period filter to <span className="font-medium">All time</span>{" "}
        to see every card, or log work on a card from the kanban first.
      </p>
      <Button className="mt-4 cursor-pointer" onClick={onAdd}>
        <Pencil className="h-4 w-4" />
        Add manual entry
      </Button>
    </div>
  );
}


