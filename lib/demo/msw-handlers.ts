// Minimal handler set for Batch 1 — GET/POST /api/cards only.
// Batch 3 extends with Team, Settings, AI parse, archive, etc.
import { http, HttpResponse } from "msw";
import type { Card } from "@/lib/validators";
import { addCards, demoState, newId, nextPositionFor } from "./state";

type CardInput = Partial<Omit<Card, "id" | "created_at" | "updated_at">>;

function hydrateCard(input: CardInput): Card {
  const nowIso = new Date().toISOString();
  const column = input.column_name ?? "Ready";
  return {
    id: newId(),
    task: input.task ?? "",
    assignee: input.assignee ?? "",
    requester: input.requester ?? "",
    request_date: input.request_date ?? nowIso.slice(0, 10),
    estimated_duration: input.estimated_duration ?? null,
    due_date: input.due_date ?? null,
    status: input.status ?? "Ready",
    priority: input.priority ?? "Normal",
    column_name: column,
    notes: input.notes ?? null,
    position: input.position ?? nextPositionFor(column),
    archived_at: null,
    archived_from_column: null,
    created_at: nowIso,
    updated_at: nowIso,
    created_by: null,
  };
}

export const handlers = [
  http.get("/api/cards", ({ request }) => {
    const url = new URL(request.url);
    const archivedOnly = url.searchParams.get("archived") === "true";
    const cards = demoState.cards
      .filter((c) =>
        archivedOnly ? c.archived_at !== null : c.archived_at === null,
      )
      .sort((a, b) => {
        if (a.column_name !== b.column_name) {
          return a.column_name.localeCompare(b.column_name);
        }
        return a.position - b.position;
      });
    return HttpResponse.json({ cards });
  }),

  http.post("/api/cards", async ({ request }) => {
    const body = (await request.json()) as CardInput;
    const card = hydrateCard(body);
    addCards([card]);
    return HttpResponse.json({ card }, { status: 201 });
  }),
];
