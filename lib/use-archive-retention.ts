"use client";

import { useQuery } from "@tanstack/react-query";

// Days an archived card is kept before the daily purge deletes it.
// 0 = keep forever. Falls back to this when the setting is missing/unreadable.
export const ARCHIVE_RETENTION_DEFAULT = 90;

async function fetchArchiveRetentionDays(): Promise<number> {
  const res = await fetch("/api/settings", { cache: "no-store" });
  if (!res.ok) return ARCHIVE_RETENTION_DEFAULT;
  const body = await res.json();
  const raw = body?.settings?.archiveRetentionDays;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : ARCHIVE_RETENTION_DEFAULT;
}

// Reads the configured archive retention. Shared by the Archive page and the
// card drawer so their copy/countdown match the actual purge behavior.
export function useArchiveRetentionDays(): number {
  const { data } = useQuery({
    queryKey: ["settings", "archiveRetentionDays"],
    queryFn: fetchArchiveRetentionDays,
    staleTime: 60_000,
  });
  return data ?? ARCHIVE_RETENTION_DEFAULT;
}
