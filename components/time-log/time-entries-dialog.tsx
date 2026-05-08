"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  type Card,
  type TimeCategory,
} from "@/lib/validators";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMinutes } from "@/lib/time-log/period";
import { preventFocusOutsideClose } from "@/lib/dialog-stacking";
import {
  ManualEntryDialog,
  type EntryWithJoins,
} from "@/components/time-log/manual-entry-dialog";

type EntriesResponse = { entries: EntryWithJoins[] };
type CardsResponse = { cards: Card[] };
type CategoriesResponse = { categories: TimeCategory[] };

async function fetchEntriesForCard(
  cardId: string,
): Promise<EntriesResponse> {
  const res = await fetch(
    `/api/time-entries?period=all&card_id=${encodeURIComponent(cardId)}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to load time entries");
  return res.json();
}

async function fetchCards(): Promise<CardsResponse> {
  const res = await fetch("/api/cards", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load cards");
  return res.json();
}

async function fetchCategories(): Promise<CategoriesResponse> {
  const res = await fetch("/api/categories", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load categories");
  return res.json();
}

export function TimeEntriesDialog({
  cardId,
  cardTitle,
  open,
  onOpenChange,
}: {
  cardId: string | null;
  cardTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<EntryWithJoins | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<EntryWithJoins | null>(null);

  // Only run the entries query when the dialog is open and we have a
  // card — keeps the network quiet while the drawer sits idle.
  const { data, isLoading } = useQuery({
    queryKey: ["time-entries", "card", cardId],
    queryFn: () => fetchEntriesForCard(cardId!),
    enabled: open && cardId !== null,
  });

  const { data: cardsData } = useQuery({
    queryKey: ["cards"],
    queryFn: fetchCards,
    enabled: open,
  });

  const { data: catsData } = useQuery({
    queryKey: ["time-categories"],
    queryFn: fetchCategories,
    enabled: open,
  });

  const entries = useMemo(() => data?.entries ?? [], [data]);
  const cards = useMemo(() => cardsData?.cards ?? [], [cardsData]);
  const categories = useMemo(
    () => catsData?.categories ?? [],
    [catsData],
  );

  const total = entries.reduce(
    (sum, e) => sum + (e.duration_minutes ?? 0),
    0,
  );

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/time-entries/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Delete failed");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time-entries"] });
      setDeleting(null);
    },
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex max-h-[80vh] min-w-0 flex-col gap-0 sm:max-w-3xl"
          onInteractOutside={preventFocusOutsideClose}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3 pr-8">
              <span className="line-clamp-1">{cardTitle}</span>
              <span className="shrink-0 font-mono text-xs font-normal text-muted-foreground">
                {isLoading ? "…" : `${entries.length} · ${formatMinutes(total)}`}
              </span>
            </DialogTitle>
            <DialogDescription>
              All time logged on this card. Edit a row to fix duration, date,
              category, or notes.
            </DialogDescription>
          </DialogHeader>

          <div className="-mx-4 flex-1 overflow-y-auto border-y border-border bg-muted/10">
            {isLoading ? (
              <p className="p-6 text-sm text-muted-foreground">Loading…</p>
            ) : entries.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                No time logged yet. Use Add entry to log time you forgot to
                track, or start the timer from the Time Log page.
              </p>
            ) : (
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-28" />
                  <col className="w-32" />
                  <col className="w-20" />
                  <col />
                  <col className="w-20" />
                </colgroup>
                <thead className="sticky top-0 z-10 border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 text-right font-medium">
                      Duration
                    </th>
                    <th className="px-3 py-2 font-medium">Notes</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr
                      key={e.id}
                      className="border-b border-border/60 last:border-b-0 hover:bg-muted/20"
                    >
                      <td className="px-3 py-2 font-mono text-xs">
                        {e.started_at.slice(0, 10)}
                      </td>
                      <td className="px-3 py-2">
                        {e.time_categories?.name ? (
                          <CategoryChip
                            name={e.time_categories.name}
                            color={e.time_categories.color}
                          />
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {e.duration_minutes != null
                          ? formatMinutes(e.duration_minutes)
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        <span className="line-clamp-1">{e.notes ?? ""}</span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => setEditing(e)}
                            aria-label="Edit entry"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeleting(e)}
                            aria-label="Delete entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-3">
            <Button
              type="button"
              variant="ghost"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              className="cursor-pointer"
              onClick={() => setAdding(true)}
            >
              <Plus className="h-4 w-4" />
              Add entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit / add stack on top of this dialog. Radix handles focus +
          z-index correctly when modals stack. */}
      <ManualEntryDialog
        open={editing !== null}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
        editing={editing}
        presetCardId={cardId}
        cards={cards}
        categories={categories}
      />
      <ManualEntryDialog
        open={adding}
        onOpenChange={setAdding}
        editing={null}
        presetCardId={cardId}
        cards={cards}
        categories={categories}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this time entry?</AlertDialogTitle>
            <AlertDialogDescription>
              Removes this single row from the log. The card and other entries
              are unaffected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {remove.error && (
            <p className="text-sm text-destructive">
              {(remove.error as Error).message}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && remove.mutate(deleting.id)}
              className="cursor-pointer bg-destructive text-white hover:bg-destructive/90"
            >
              {remove.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
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
