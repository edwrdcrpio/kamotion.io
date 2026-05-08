import type { PeriodPreset } from "@/lib/validators";

// Period math for the Time Log. All periods are half-open ranges
// [start, end) — inclusive start, exclusive end — to keep day-boundary
// arithmetic clean. Bi-weekly is anchored to a configurable Monday
// stored in settings.biweeklyAnchorMonday.

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

// Anchored bi-weekly: count 14-day blocks from the anchor Monday and
// return the block that contains `today`. Works with anchors in the
// past or in the future thanks to Math.floor on a signed delta.
function biweeklyWindow(today: Date, anchorMonday: Date): Range {
  const startToday = startOfWeekMonday(today);
  const startAnchor = startOfWeekMonday(anchorMonday);
  const weeks = Math.floor(
    (startToday.getTime() - startAnchor.getTime()) /
      (7 * 86_400_000),
  );
  const period = Math.floor(weeks / 2);
  const start = addDays(startAnchor, period * 14);
  const end = addDays(start, 14);
  return { start, end };
}

export function rangeForPreset(
  preset: PeriodPreset,
  now: Date,
  anchorMonday: Date,
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
    case "biweekly_current":
      return biweeklyWindow(now, anchorMonday);
    case "biweekly_last": {
      const cur = biweeklyWindow(now, anchorMonday);
      return { start: addDays(cur.start, -14), end: cur.start };
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

// Most recent Monday relative to `d`, as YYYY-MM-DD. Used as a fallback
// when the settings.biweeklyAnchorMonday key isn't present.
export function mostRecentMondayIso(d: Date = new Date()): string {
  return isoDate(startOfWeekMonday(d));
}

// Defensive parser — accepts "YYYY-MM-DD" only. Returns local-midnight
// Date so day arithmetic stays correct.
export function parseAnchorMondayIso(s: unknown): Date {
  if (typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-").map((p) => Number(p));
    return new Date(y, m - 1, d);
  }
  return startOfWeekMonday(new Date());
}
