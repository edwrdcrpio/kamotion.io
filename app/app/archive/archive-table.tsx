"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Card, Column } from "@/lib/validators";
import { cn } from "@/lib/utils";

type CardsResponse = { cards: Card[] };

async function fetchArchived(): Promise<CardsResponse> {
  const res = await fetch("/api/cards?archived=true", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load archive");
  return res.json();
}

async function fetchActive(): Promise<CardsResponse> {
  const res = await fetch("/api/cards", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load cards");
  return res.json();
}

function daysBetween(iso: string): number {
  const then = new Date(iso).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

const DAYS_BEFORE_AUTODELETE = 90;

export function ArchiveTable() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["cards", "archived"],
    queryFn: fetchArchived,
  });

  const cards = useMemo(
    () =>
      (data?.cards ?? []).slice().sort((a, b) => {
        if (!a.archived_at || !b.archived_at) return 0;
        return (
          new Date(b.archived_at).getTime() -
          new Date(a.archived_at).getTime()
        );
      }),
    [data],
  );

  const restore = useMutation({
    mutationFn: async (c: Card) => {
      // Compute bottom position in the target column by looking at currently
      // active cards.
      const active = await fetchActive();
      const targetCol = (c.archived_from_column as Column | null) ?? "Queue";
      const maxPos = active.cards
        .filter((x) => x.column_name === targetCol)
        .reduce((m, x) => Math.max(m, x.position), 0);

      const res = await fetch(`/api/cards/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archived_at: null,
          archived_from_column: null,
          column_name: targetCol,
          position: maxPos + 1000,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Restore failed");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards", "archived"] });
      qc.invalidateQueries({ queryKey: ["cards"] });
    },
  });

  const permaDelete = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Delete failed");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards", "archived"] });
    },
  });

  return (
    <main className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Archive</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Archived cards auto-delete {DAYS_BEFORE_AUTODELETE} days after
            archiving. Restore keeps them; Delete removes them immediately.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-sm text-destructive">Failed to load archive.</p>
      ) : cards.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Archive className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight">
            Archive is empty
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Archived cards land here. They auto-delete after{" "}
            {DAYS_BEFORE_AUTODELETE} days. You can restore any time before
            then.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Assignee</th>
                <th className="px-4 py-3 font-medium">Archived</th>
                <th className="px-4 py-3 font-medium">Auto-delete in</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((c) => {
                const archivedAgo = c.archived_at
                  ? daysBetween(c.archived_at)
                  : 0;
                const daysLeft = Math.max(
                  0,
                  DAYS_BEFORE_AUTODELETE - archivedAgo,
                );
                const urgent = daysLeft <= 14;
                return (
                  <tr
                    key={c.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <div className="line-clamp-1 font-medium">
                        {c.task.replace(/^\[demo\]\s*/, "")}
                      </div>
                      {c.notes && (
                        <div className="line-clamp-1 text-xs text-muted-foreground">
                          {c.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.archived_from_column ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.status}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.priority}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.assignee}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {archivedAgo === 0
                        ? "today"
                        : `${archivedAgo}d ago`}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 font-mono text-xs",
                        urgent
                          ? "text-amber-700 dark:text-amber-300"
                          : "text-muted-foreground",
                      )}
                    >
                      {daysLeft}d
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => restore.mutate(c)}
                          disabled={restore.isPending}
                          className="cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Restore
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete permanently?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This card will be removed immediately. This
                                can&apos;t be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="cursor-pointer">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => permaDelete.mutate(c.id)}
                                className="cursor-pointer bg-destructive text-white hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
