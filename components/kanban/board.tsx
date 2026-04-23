"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Triangle, Circle, ClipboardList } from "lucide-react";
import type { Card, Column, Status, Priority } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { NewCardDialog } from "./new-card-dialog";
import { CardDetailDrawer } from "./card-detail-drawer";
import {
  FilterBar,
  INITIAL_FILTERS,
  type BoardFilters,
} from "./filter-bar";

const COLUMN_NAMES: Column[] = [
  "Queue",
  "Ready",
  "In Progress",
  "Review",
  "Done",
];

// Column → status mapping: moving a card takes on the column's default status.
// "Blocked" is deliberately not preserved — if you're moving the card, it's
// no longer blocked.
const COLUMN_TO_STATUS: Record<Column, Status> = {
  Queue: "Not Started",
  Ready: "Ready",
  "In Progress": "In Progress",
  Review: "Review",
  Done: "Approved",
};

type CardsResponse = { cards: Card[] };

async function fetchCards(): Promise<CardsResponse> {
  const res = await fetch("/api/cards", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load cards");
  return res.json();
}

async function patchCard(
  id: string,
  patch: Partial<Card>,
): Promise<Card> {
  const res = await fetch(`/api/cards/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Update failed");
  return body.card as Card;
}

const columnCollision: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  if (pointer.length > 0) return pointer;
  return rectIntersection(args);
};

function computePositionAt(
  reordered: Card[],
  index: number,
): number {
  const before = reordered[index - 1];
  const after = reordered[index + 1];
  if (!before && !after) return 1000;
  if (!before) return after.position - 1000;
  if (!after) return before.position + 1000;
  return (before.position + after.position) / 2;
}

function applyFilters(cards: Card[], f: BoardFilters): Card[] {
  const q = f.q.trim().toLowerCase();
  return cards.filter((c) => {
    if (f.assignee && c.assignee !== f.assignee) return false;
    if (f.priority !== "All") {
      if (f.priority === "Blocked") {
        if (c.status !== "Blocked") return false;
      } else {
        if (c.priority !== f.priority) return false;
      }
    }
    if (q) {
      const hay = `${c.task} ${c.notes ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function Board() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["cards"],
    queryFn: fetchCards,
  });
  const allCards = useMemo(() => data?.cards ?? [], [data]);

  const [filters, setFilters] = useState<BoardFilters>(INITIAL_FILTERS);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const cards = useMemo(
    () => applyFilters(allCards, filters),
    [allCards, filters],
  );

  const grouped = useMemo(() => {
    const init: Record<Column, Card[]> = {
      Queue: [],
      Ready: [],
      "In Progress": [],
      Review: [],
      Done: [],
    };
    for (const card of cards) {
      const col = card.column_name as Column;
      if (init[col]) init[col].push(card);
    }
    return init;
  }, [cards]);

  const assignees = useMemo(
    () => Array.from(new Set(allCards.map((c) => c.assignee))).sort(),
    [allCards],
  );

  const selectedCard =
    selectedCardId != null
      ? allCards.find((c) => c.id === selectedCardId) ?? null
      : null;

  const reorderCard = useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Card>;
    }) => patchCard(id, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: ["cards"] });
      const prev = qc.getQueryData<CardsResponse>(["cards"]);
      qc.setQueryData<CardsResponse>(["cards"], (old) => {
        const next = (old?.cards ?? []).map((c) =>
          c.id === id ? { ...c, ...patch } : c,
        );
        next.sort((a, b) => {
          if (a.column_name === b.column_name) return a.position - b.position;
          return a.column_name.localeCompare(b.column_name);
        });
        return { cards: next };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["cards"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const activeCard = activeId
    ? allCards.find((c) => c.id === activeId) ?? null
    : null;

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const sourceId = String(active.id);
    const source = allCards.find((c) => c.id === sourceId);
    if (!source) return;

    const overId = String(over.id);
    let destColumn: Column;
    let newIndex: number;

    if ((COLUMN_NAMES as string[]).includes(overId)) {
      destColumn = overId as Column;
      newIndex = grouped[destColumn].length;
    } else {
      const overCard = allCards.find((c) => c.id === overId);
      if (!overCard) return;
      destColumn = overCard.column_name as Column;
      newIndex = grouped[destColumn].findIndex((c) => c.id === overId);
    }

    const isSameColumn = destColumn === source.column_name;

    let reordered: Card[];
    if (isSameColumn) {
      const oldIndex = grouped[destColumn].findIndex(
        (c) => c.id === sourceId,
      );
      if (oldIndex === newIndex) return;
      reordered = arrayMove(grouped[destColumn], oldIndex, newIndex);
    } else {
      const destCards = grouped[destColumn];
      reordered = [
        ...destCards.slice(0, newIndex),
        source,
        ...destCards.slice(newIndex),
      ];
    }

    const insertAt = reordered.findIndex((c) => c.id === sourceId);
    const newPosition = computePositionAt(reordered, insertAt);

    const patch: Partial<Card> = { position: newPosition };
    if (!isSameColumn) {
      patch.column_name = destColumn;
      patch.status = COLUMN_TO_STATUS[destColumn];
    }

    reorderCard.mutate({ id: sourceId, patch });
  };

  const totalCount = allCards.length;
  const shownCount = cards.length;
  const isEmpty = !isLoading && totalCount === 0;
  const isFiltered =
    filters.q !== "" ||
    filters.assignee !== "" ||
    filters.priority !== "All";

  return (
    <main className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Board</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : error
                ? "Failed to load cards."
                : isFiltered
                  ? `${shownCount} of ${totalCount} cards`
                  : `${totalCount} ${totalCount === 1 ? "card" : "cards"}`}
          </p>
        </div>
        <NewCardDialog />
      </div>

      {!isEmpty && (
        <FilterBar
          filters={filters}
          onChange={setFilters}
          assignees={assignees}
        />
      )}

      {isEmpty ? (
        <EmptyState />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={columnCollision}
          onDragStart={handleDragStart}
          onDragCancel={() => setActiveId(null)}
          onDragEnd={handleDragEnd}
        >
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {COLUMN_NAMES.map((col) => (
              <ColumnView
                key={col}
                name={col}
                cards={grouped[col]}
                onOpen={setSelectedCardId}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeCard ? <CardView card={activeCard} overlay /> : null}
          </DragOverlay>
        </DndContext>
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

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <ClipboardList className="h-6 w-6 text-primary" />
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight">
        Your board is empty
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Click{" "}
        <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px]">
          + New card
        </span>{" "}
        in the top right to drop your first task into the Queue — or paste a
        chunk of text and let Kamotion extract cards from it once the AI parser
        ships in Milestone C.
      </p>
    </div>
  );
}

const COLUMN_TITLE_COLOR: Record<Column, string> = {
  Queue: "text-muted-foreground",
  Ready: "text-teal-600 dark:text-teal-300",
  "In Progress": "text-indigo-600 dark:text-indigo-300",
  Review: "text-brand-accent",
  Done: "text-foreground",
};

function ColumnView({
  name,
  cards,
  onOpen,
}: {
  name: Column;
  cards: Card[];
  onOpen: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: name });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[40vh] flex-col overflow-hidden rounded-xl border bg-muted/30 transition-colors",
        isOver ? "border-primary/60 bg-primary/5" : "border-border",
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <span className={cn("text-sm font-medium", COLUMN_TITLE_COLOR[name])}>
          {name}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {cards.length}
        </span>
      </div>
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-2 p-3">
          {cards.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border/70 py-6 text-xs italic text-muted-foreground/60">
              Drop a card here
            </div>
          ) : (
            cards.map((card) => (
              <SortableCard key={card.id} card={card} onOpen={onOpen} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableCard({
  card,
  onOpen,
}: {
  card: Card;
  onOpen: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(card.id)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
      }}
      className="cursor-grab touch-none active:cursor-grabbing"
    >
      <CardView card={card} />
    </div>
  );
}

// In Progress deliberately decoupled from --primary so the brand palette can
// change without shifting the semantic meaning of the status chip.
const STATUS_TONE: Record<Status, string> = {
  "Not Started": "bg-muted text-muted-foreground",
  Ready: "bg-teal-500/10 text-teal-600 dark:text-teal-300",
  "In Progress": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
  Blocked: "bg-brand-warning/15 text-amber-700 dark:text-amber-300",
  Review: "bg-brand-accent/10 text-brand-accent",
  Approved: "bg-brand-success/15 text-emerald-700 dark:text-emerald-300",
};

const PRIORITY_META: Record<
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

function CardView({ card, overlay }: { card: Card; overlay?: boolean }) {
  const title = card.task.replace(/^\[demo\]\s*/, "");
  const priority =
    PRIORITY_META[card.priority as Priority] ?? PRIORITY_META.Normal;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow",
        overlay ? "rotate-[1.5deg] shadow-lg" : "hover:shadow-md",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 flex-1 text-sm font-medium leading-snug">
          {title}
        </p>
        <span
          className="mt-0.5 shrink-0"
          title={priority.label}
          aria-label={priority.label}
        >
          {priority.node}
        </span>
      </div>
      {card.notes && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {card.notes}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="truncate text-xs text-muted-foreground">
          {card.assignee}
        </span>
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium",
            STATUS_TONE[card.status as Status] ?? STATUS_TONE["Not Started"],
          )}
        >
          {card.status}
        </span>
      </div>
      {card.due_date && (
        <div className="mt-2 font-mono text-[10px] text-muted-foreground">
          Due {card.due_date}
        </div>
      )}
    </div>
  );
}
