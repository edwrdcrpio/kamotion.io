import type { Card, Column } from "@/lib/validators";
import { cn } from "@/lib/utils";

// Compact title + kanban-column chip used inside <SelectItem>. Lets the
// dropdown surface "where this card lives" without the user having to
// open the kanban side-by-side. The chip is also reused as the Status
// column of the Time Log sheet so the two views always agree.

const COLUMN_TONE: Record<Column, string> = {
  Queue: "bg-muted text-muted-foreground",
  Ready: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  "In Progress": "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  Review: "bg-brand-accent/15 text-brand-accent",
  Done: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

export function ColumnChip({ column }: { column: Column }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium",
        COLUMN_TONE[column] ?? COLUMN_TONE.Queue,
      )}
    >
      {column}
    </span>
  );
}

export function CardOption({ card }: { card: Card }) {
  const title = card.task.replace(/^\[demo\]\s*/, "");
  const col = card.column_name as Column;
  // Rendered as two siblings (no outer wrapper) so they slot directly
  // into <SelectValue>'s flex layout — the title gets min-w-0 + truncate
  // and the chip stays shrunk on the left.
  return (
    <>
      <ColumnChip column={col} />
      <span className="min-w-0 flex-1 truncate">{title}</span>
    </>
  );
}
