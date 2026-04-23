"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ParsedCard } from "@/lib/ai/schema";
import type { Priority, Status } from "@/lib/validators";

const PRIORITY_OPTIONS: Priority[] = ["Low", "Normal", "High"];
const STATUS_OPTIONS: Status[] = [
  "Not Started",
  "Ready",
  "In Progress",
  "Blocked",
  "Review",
  "Approved",
];

export function PreviewDialog({
  cards,
  onOpenChange,
  redirectTo = "/app",
  confirmTourAttr,
}: {
  cards: ParsedCard[] | null;
  onOpenChange: (open: boolean) => void;
  redirectTo?: string;
  confirmTourAttr?: string;
}) {
  const open = cards !== null;
  const [editable, setEditable] = useState<ParsedCard[]>([]);
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    if (cards) setEditable(cards);
  }, [cards]);

  const confirm = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/cards/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: editable }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Create failed");
      return body.cards;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      onOpenChange(false);
      router.push(redirectTo);
    },
  });

  const update = (idx: number, patch: Partial<ParsedCard>) => {
    setEditable((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    );
  };

  const remove = (idx: number) => {
    setEditable((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Review {editable.length}{" "}
            {editable.length === 1 ? "card" : "cards"}
          </DialogTitle>
          <DialogDescription>
            Edit any field, drop cards you don&apos;t want. Confirm to add them
            all to the Queue column on your board.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-6 flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-3">
          {editable.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No cards left to add.
            </p>
          ) : (
            editable.map((card, idx) => (
              <PreviewRow
                key={idx}
                card={card}
                onChange={(patch) => update(idx, patch)}
                onRemove={() => remove(idx)}
              />
            ))
          )}
        </div>

        {confirm.error && (
          <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {(confirm.error as Error).message}
          </p>
        )}

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
            type="button"
            onClick={() => confirm.mutate()}
            disabled={editable.length === 0 || confirm.isPending}
            data-tour={confirmTourAttr}
            className="cursor-pointer"
          >
            {confirm.isPending
              ? "Creating…"
              : `Add ${editable.length} to Queue`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PreviewRow({
  card,
  onChange,
  onRemove,
}: {
  card: ParsedCard;
  onChange: (patch: Partial<ParsedCard>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
      <div className="flex items-start gap-2">
        <Input
          value={card.task}
          onChange={(e) => onChange({ task: e.target.value })}
          placeholder="Task title"
          className="flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="cursor-pointer shrink-0"
          aria-label="Remove card"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Input
          value={card.assignee}
          onChange={(e) => onChange({ assignee: e.target.value })}
          placeholder="Assignee"
        />
        <Input
          type="date"
          value={card.due_date ?? ""}
          onChange={(e) =>
            onChange({ due_date: e.target.value === "" ? null : e.target.value })
          }
        />
        <Select
          value={card.priority ?? "Normal"}
          onValueChange={(v) => onChange({ priority: v as Priority })}
        >
          <SelectTrigger>
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
        <Select
          value={card.status ?? "Not Started"}
          onValueChange={(v) => onChange({ status: v as Status })}
        >
          <SelectTrigger>
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
      </div>

      <Textarea
        value={card.notes ?? ""}
        onChange={(e) =>
          onChange({ notes: e.target.value === "" ? null : e.target.value })
        }
        rows={2}
        placeholder="Notes (optional)"
        className="text-xs"
      />
    </div>
  );
}
