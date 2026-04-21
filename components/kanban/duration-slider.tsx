"use client";

import { Slider } from "@/components/ui/slider";

type Position = { value: string | null; label: string };

// 0:        Not set
// 1:        30m
// 2..73:    1h..72h
// 74..84:   4d..14d
const POSITIONS: Position[] = [
  { value: null, label: "Not set" },
  { value: "30m", label: "30m" },
  ...Array.from({ length: 72 }, (_, i) => ({
    value: `${i + 1}h`,
    label: `${i + 1}h`,
  })),
  ...Array.from({ length: 11 }, (_, i) => ({
    value: `${i + 4}d`,
    label: `${i + 4}d`,
  })),
];

function parseToIndex(v: string | null | undefined): number {
  if (!v) return 0;
  const idx = POSITIONS.findIndex((p) => p.value === v);
  return idx >= 0 ? idx : 0;
}

function formatFromIndex(i: number): string | null {
  return POSITIONS[i]?.value ?? null;
}

export function DurationSlider({
  value,
  onChange,
}: {
  value: string | null | undefined;
  onChange: (next: string | null) => void;
}) {
  const idx = parseToIndex(value);
  const current = POSITIONS[idx];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end">
        <span className="font-mono text-sm font-medium">{current.label}</span>
      </div>
      <Slider
        min={0}
        max={POSITIONS.length - 1}
        step={1}
        value={[idx]}
        onValueChange={(vals) => {
          const next = vals[0] ?? 0;
          onChange(formatFromIndex(next));
        }}
      />
      <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>30m+</span>
        <span>14d</span>
      </div>
    </div>
  );
}
