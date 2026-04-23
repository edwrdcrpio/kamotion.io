"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import {
  CardUpdateInput,
  type Card,
  type Status,
  type Priority,
  type Column,
} from "@/lib/validators";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PersonCombobox } from "@/components/ui/person-combobox";
import { DurationSlider } from "./duration-slider";

type FormIn = z.input<typeof CardUpdateInput>;
type FormOut = z.output<typeof CardUpdateInput>;

const STATUS_OPTIONS: Status[] = [
  "Not Started",
  "Ready",
  "In Progress",
  "Blocked",
  "Review",
  "Approved",
];

const PRIORITY_OPTIONS: Priority[] = ["Low", "Normal", "High"];

const STATUS_TO_COLUMN: Partial<Record<Status, Column>> = {
  "Not Started": "Queue",
  Ready: "Ready",
  "In Progress": "In Progress",
  Review: "Review",
  Approved: "Done",
};

type CardsResponse = { cards: Card[] };

export function CardDetailDrawer({
  card,
  onOpenChange,
}: {
  card: Card | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = card !== null;
  const qc = useQueryClient();
  const [discardOpen, setDiscardOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(CardUpdateInput),
  });

  useEffect(() => {
    if (card) {
      reset({
        task: card.task,
        assignee: card.assignee,
        requester: card.requester,
        request_date: card.request_date,
        due_date: card.due_date ?? "",
        estimated_duration: card.estimated_duration ?? "",
        notes: card.notes ?? "",
        status: card.status,
        priority: card.priority,
      });
    }
  }, [card, reset]);

  // ⌘/Ctrl+S saves without leaving the drawer.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const update = useMutation({
    mutationFn: async (input: FormOut) => {
      if (!card) throw new Error("No card selected");
      const finalPatch: Partial<Card> & FormOut = { ...input };

      if (input.status && input.status !== card.status) {
        const targetCol = STATUS_TO_COLUMN[input.status];
        if (targetCol && targetCol !== card.column_name) {
          const all =
            qc.getQueryData<CardsResponse>(["cards"])?.cards ?? [];
          const maxPos = all
            .filter((c) => c.column_name === targetCol)
            .reduce((m, c) => Math.max(m, c.position), 0);
          finalPatch.column_name = targetCol;
          finalPatch.position = maxPos + 1000;
        }
      }

      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPatch),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Update failed");
      return body.card as Card;
    },
    onSuccess: (updated) => {
      qc.setQueryData<CardsResponse>(["cards"], (old) => ({
        cards: (old?.cards ?? []).map((c) =>
          c.id === updated.id ? updated : c,
        ),
      }));
      qc.invalidateQueries({ queryKey: ["cards"] });
      onOpenChange(false);
    },
  });

  const archive = useMutation({
    mutationFn: async () => {
      if (!card) throw new Error("No card selected");
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archived_at: new Date().toISOString(),
          archived_from_column: card.column_name,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Archive failed");
      return body.card as Card;
    },
    onSuccess: () => {
      if (!card) return;
      // Card vanishes from the main board query (API filters archived out).
      qc.setQueryData<CardsResponse>(["cards"], (old) => ({
        cards: (old?.cards ?? []).filter((c) => c.id !== card.id),
      }));
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["cards", "archived"] });
      onOpenChange(false);
    },
  });

  const del = useMutation({
    mutationFn: async () => {
      if (!card) throw new Error("No card selected");
      const res = await fetch(`/api/cards/${card.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Delete failed");
      }
    },
    onSuccess: () => {
      if (!card) return;
      qc.setQueryData<CardsResponse>(["cards"], (old) => ({
        cards: (old?.cards ?? []).filter((c) => c.id !== card.id),
      }));
      qc.invalidateQueries({ queryKey: ["cards"] });
      onOpenChange(false);
    },
  });

  const handleSheetOpenChange = (next: boolean) => {
    if (!next && isDirty && !update.isPending) {
      setDiscardOpen(true);
      return;
    }
    onOpenChange(next);
  };

  const confirmDiscard = () => {
    setDiscardOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="flex flex-col gap-0 data-[side=right]:w-full data-[side=right]:sm:w-3/4 data-[side=right]:sm:max-w-[38rem]">
          {card && (
            <form
              ref={formRef}
              onSubmit={handleSubmit((data) => update.mutate(data))}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <SheetHeader className="border-b border-border">
                <SheetTitle>Edit card</SheetTitle>
                <SheetDescription className="font-mono text-[10px] uppercase tracking-widest">
                  id · {card.id.slice(0, 8)}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="drawer-task">Task</Label>
                  <Input id="drawer-task" {...register("task")} />
                  {errors.task && (
                    <p className="text-xs text-destructive">
                      {errors.task.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="drawer-assignee">Assignee</Label>
                    <Controller
                      name="assignee"
                      control={control}
                      render={({ field }) => (
                        <PersonCombobox
                          id="drawer-assignee"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="drawer-requester">Requester</Label>
                    <Controller
                      name="requester"
                      control={control}
                      render={({ field }) => (
                        <PersonCombobox
                          id="drawer-requester"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label>Status</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value ?? "Not Started"}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Priority</Label>
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value ?? "Normal"}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITY_OPTIONS.map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="drawer-request-date">Requested</Label>
                    <Input
                      id="drawer-request-date"
                      type="date"
                      {...register("request_date")}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="drawer-due-date">Due</Label>
                    <Input
                      id="drawer-due-date"
                      type="date"
                      {...register("due_date")}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Estimated duration</Label>
                  <Controller
                    name="estimated_duration"
                    control={control}
                    render={({ field }) => (
                      <DurationSlider
                        value={
                          (field.value as string | null | undefined) ?? null
                        }
                        onChange={(v) => field.onChange(v ?? "")}
                      />
                    )}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="drawer-notes">Notes</Label>
                  <Textarea
                    id="drawer-notes"
                    {...register("notes")}
                    rows={6}
                    placeholder="Context, links, constraints…"
                  />
                </div>

                <div className="border-t border-border pt-3 text-[11px] text-muted-foreground">
                  <div>
                    Column:{" "}
                    <span className="font-medium">{card.column_name}</span>
                  </div>
                  <div>
                    Created:{" "}
                    <span className="font-mono">
                      {card.created_at.slice(0, 10)}
                    </span>
                  </div>
                  <div>
                    Updated:{" "}
                    <span className="font-mono">
                      {card.updated_at.slice(0, 10)}
                    </span>
                  </div>
                </div>

                {update.error && (
                  <p className="text-sm text-destructive">
                    {(update.error as Error).message}
                  </p>
                )}
                {archive.error && (
                  <p className="text-sm text-destructive">
                    {(archive.error as Error).message}
                  </p>
                )}
                {del.error && (
                  <p className="text-sm text-destructive">
                    {(del.error as Error).message}
                  </p>
                )}
              </div>

              <SheetFooter className="flex-row flex-wrap items-center justify-between gap-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                      >
                        Archive
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Archive this card?</AlertDialogTitle>
                        <AlertDialogDescription>
                          It disappears from the board but you can restore it
                          from the Archive page any time. Auto-deletes after 90
                          days.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => archive.mutate()}
                          className="cursor-pointer"
                        >
                          Archive
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete permanently?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This can&apos;t be undone. The card will be removed
                          immediately and skip the archive.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => del.mutate()}
                          className="cursor-pointer bg-destructive text-white hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSheetOpenChange(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={update.isPending || !isDirty}
                    className="cursor-pointer"
                  >
                    {update.isPending ? "Saving…" : "Save"}
                  </Button>
                </div>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ve edited this card but haven&apos;t saved yet. Closing
              now will discard those changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* Visual weight inverted: the safe action (Keep editing) is the
                prominent filled button; Discard is the quieter outline. */}
            <AlertDialogCancel
              variant="default"
              className="cursor-pointer"
            >
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction
              variant="outline"
              onClick={confirmDiscard}
              className="cursor-pointer"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
