"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  type Card,
  type TimeCategory,
  type TimeEntry,
} from "@/lib/validators";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CardOption } from "@/components/time-log/card-option";
import { preventFocusOutsideClose } from "@/lib/dialog-stacking";

export type EntryWithJoins = TimeEntry & {
  cards: { task: string } | null;
  time_categories: { name: string; color: string | null } | null;
};

const EntryFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hours: z.coerce.number().int().min(0).max(24),
  minutes: z.coerce.number().int().min(0).max(59),
  card_id: z.string(),
  category_id: z.string(),
  notes: z.string().max(2000).optional(),
});
type EntryFormIn = z.input<typeof EntryFormSchema>;
type EntryFormOut = z.output<typeof EntryFormSchema>;

export function ManualEntryDialog({
  open,
  onOpenChange,
  editing,
  presetCardId,
  cards,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: EntryWithJoins | null;
  presetCardId: string | null;
  cards: Card[];
  categories: TimeCategory[];
}) {
  const qc = useQueryClient();
  const isEdit = editing !== null;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<EntryFormIn, unknown, EntryFormOut>({
    resolver: zodResolver(EntryFormSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      hours: 0,
      minutes: 30,
      card_id: "__none",
      category_id: "__none",
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const total = editing.duration_minutes ?? 0;
      reset({
        date: editing.started_at.slice(0, 10),
        hours: Math.floor(total / 60),
        minutes: total % 60,
        card_id: editing.card_id ?? "__none",
        category_id: editing.category_id ?? "__none",
        notes: editing.notes ?? "",
      });
    } else {
      const presetCategory =
        presetCardId &&
        cards.find((c) => c.id === presetCardId)?.default_category_id;
      reset({
        date: new Date().toISOString().slice(0, 10),
        hours: 0,
        minutes: 30,
        card_id: presetCardId ?? "__none",
        category_id: presetCategory ?? "__none",
        notes: "",
      });
    }
  }, [open, editing, presetCardId, cards, reset]);

  const save = useMutation({
    mutationFn: async (input: EntryFormOut) => {
      const totalMinutes = input.hours * 60 + input.minutes;
      if (totalMinutes < 1)
        throw new Error("Duration must be at least 1 minute");

      const [y, m, d] = input.date.split("-").map(Number);
      const start = new Date(y, m - 1, d, 9, 0, 0);
      const end = new Date(start.getTime() + totalMinutes * 60_000);

      const body = {
        card_id: input.card_id === "__none" ? null : input.card_id,
        category_id: input.category_id === "__none" ? null : input.category_id,
        started_at: start.toISOString(),
        ended_at: end.toISOString(),
        duration_minutes: totalMinutes,
        notes: input.notes?.trim() ? input.notes : null,
      };

      const res = await fetch(
        isEdit ? `/api/time-entries/${editing!.id}` : "/api/time-entries",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Save failed");
      return json.entry as TimeEntry;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time-entries"] });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="min-w-0 sm:max-w-2xl"
        onInteractOutside={preventFocusOutsideClose}
      >
        <form
          onSubmit={(e) => {
            // CRITICAL: stop bubble. React synthetic submit events
            // propagate through the React tree (ignoring portals), so
            // without this the click on "Save" would also trigger any
            // ancestor <form> — e.g. CardDetailDrawer wraps its body
            // in a card-edit form, and that form's onSubmit would
            // close the drawer mid-save.
            e.stopPropagation();
            void handleSubmit((data) => save.mutate(data))(e);
          }}
          className="min-w-0"
        >
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit time entry" : "Add time entry"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update an existing entry."
                : "Log time you forgot to track. Start time defaults to 9:00 — only the date and duration matter for billing."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2 flex flex-col gap-2">
                <Label htmlFor="entry-date">Date</Label>
                <Input id="entry-date" type="date" {...register("date")} />
                {errors.date && (
                  <p className="text-xs text-destructive">
                    {errors.date.message}
                  </p>
                )}
              </div>
              <div className="col-span-1 flex flex-col gap-2">
                <Label htmlFor="entry-hours">Hours</Label>
                <Input
                  id="entry-hours"
                  type="number"
                  min={0}
                  max={24}
                  {...register("hours")}
                />
              </div>
              <div className="col-span-1 flex flex-col gap-2">
                <Label htmlFor="entry-minutes">Minutes</Label>
                <Input
                  id="entry-minutes"
                  type="number"
                  min={0}
                  max={59}
                  {...register("minutes")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Card (optional)</Label>
              <Controller
                name="card_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full min-w-0 overflow-hidden">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="w-(--radix-select-trigger-width) min-w-0">
                      <SelectItem value="__none">No card</SelectItem>
                      {cards.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <CardOption card={c} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Category (optional)</Label>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="entry-notes">Notes (optional)</Label>
              <Textarea
                id="entry-notes"
                {...register("notes")}
                rows={3}
                placeholder="Issues, pain points, context…"
              />
            </div>

            {save.error && (
              <p className="text-sm text-destructive">
                {(save.error as Error).message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={save.isPending}
              className="cursor-pointer"
            >
              {save.isPending ? "Saving…" : isEdit ? "Save" : "Add entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
