import type { PeriodPreset } from "@/lib/validators";

// Period math for the Time Log. All periods are half-open ranges
// [start, end) — inclusive start, exclusive end — to keep day-boundary
// arithmetic clean.
//
// Week convention: weeks run Monday → Sunday. "This week" is the
// Monday-Sunday block containing today. "Bi-weekly current" is the
// pair last week + this week (Mon → Sun, 14 days). "Bi-weekly last"
// is the two Monday-Sunday weeks immediately before that.

export type Range = { start: Date; end: Date };

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

// 0 = Sun..6 = Sat → days since the most recent Monday.
function daysSinceMonday(d: Date): number {
  return (d.getDay() + 6) % 7;
}

function startOfWeekMonday(d: Date): Date {
  return startOfDay(addDays(d, -daysSinceMonday(d)));
}

function startOfMonth(d: Date): Date {
  const out = startOfDay(d);
  out.setDate(1);
  return out;
}

function addMonths(d: Date, n: number): Date {
  const out = new Date(d);
  out.setMonth(out.getMonth() + n);
  return out;
}

export function rangeForPreset(
  preset: PeriodPreset,
  now: Date,
  custom?: { from?: Date; to?: Date },
): Range | null {
  switch (preset) {
    case "this_week": {
      const start = startOfWeekMonday(now);
      return { start, end: addDays(start, 7) };
    }
    case "last_week": {
      const thisStart = startOfWeekMonday(now);
      return { start: addDays(thisStart, -7), end: thisStart };
    }
    case "biweekly_current": {
      // Last week + this week, aligned to Mon → Sun.
      const thisMonday = startOfWeekMonday(now);
      return { start: addDays(thisMonday, -7), end: addDays(thisMonday, 7) };
    }
    case "biweekly_last": {
      // The two Monday-Sunday weeks immediately before biweekly_current.
      const thisMonday = startOfWeekMonday(now);
      return { start: addDays(thisMonday, -21), end: addDays(thisMonday, -7) };
    }
    case "this_month": {
      const start = startOfMonth(now);
      return { start, end: addMonths(start, 1) };
    }
    case "last_month": {
      const thisStart = startOfMonth(now);
      return { start: addMonths(thisStart, -1), end: thisStart };
    }
    case "custom": {
      if (!custom?.from || !custom?.to) return null;
      return { start: startOfDay(custom.from), end: addDays(startOfDay(custom.to), 1) };
    }
    case "all":
      return null;
  }
}

const DOW_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Compact, human-readable label for a Range.
export function describeRange(r: Range): string {
  const inclusiveEnd = addDays(r.end, -1);
  const fmt = (d: Date) =>
    `${DOW_LABEL[d.getDay()]} ${d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })}`;
  return `${fmt(r.start)} → ${fmt(inclusiveEnd)}`;
}

export function formatMinutes(mins: number): string {
  const m = Math.max(0, Math.round(mins));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  if (rem === 0) return `${h}h`;
  return `${h}h ${rem}m`;
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
