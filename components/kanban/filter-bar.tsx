"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Priority } from "@/lib/validators";

// "Priority" filter collapses the main priorities plus the "Blocked" status
// signal into a single dropdown — per product feedback that priority + blocked
// is what actually needs surfacing; other statuses correlate with column.
export type PriorityFilter = Priority | "Blocked" | "All";

export type BoardFilters = {
  q: string;
  assignee: string; // "" = all
  priority: PriorityFilter;
};

export const INITIAL_FILTERS: BoardFilters = {
  q: "",
  assignee: "",
  priority: "All",
};

const PRIORITY_FILTER_OPTIONS: PriorityFilter[] = [
  "All",
  "High",
  "Normal",
  "Low",
  "Blocked",
];

export function FilterBar({
  filters,
  onChange,
  assignees,
}: {
  filters: BoardFilters;
  onChange: (next: BoardFilters) => void;
  assignees: string[];
}) {
  const hasActive =
    filters.q !== "" ||
    filters.assignee !== "" ||
    filters.priority !== "All";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder="Search tasks or notes…"
          value={filters.q}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
          className="pl-8"
        />
      </div>

      <Select
        value={filters.assignee || "__all"}
        onValueChange={(v) =>
          onChange({ ...filters, assignee: v === "__all" ? "" : v })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">All assignees</SelectItem>
          {assignees.map((a) => (
            <SelectItem key={a} value={a}>
              {a}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority}
        onValueChange={(v) =>
          onChange({ ...filters, priority: v as PriorityFilter })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          {PRIORITY_FILTER_OPTIONS.map((p) => (
            <SelectItem key={p} value={p}>
              {p === "All" ? "All priorities" : p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActive && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(INITIAL_FILTERS)}
          className="cursor-pointer"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
