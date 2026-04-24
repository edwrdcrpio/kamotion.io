// Full MSW handler set — covers every /api/* call the /try/* tree makes.
// Handler shapes match app/api/**/route.ts response bodies so the real
// components get the payloads they expect.
import { http, HttpResponse } from "msw";
import type { Card, TeamMember } from "@/lib/validators";
import type { ParsedCard } from "@/lib/ai/schema";
import { DEMO_EXAMPLES, type DemoCard } from "@/config/demo-examples";
import {
  addCards,
  addTeamMember,
  demoState,
  deleteCard,
  deleteTeamMember,
  newId,
  nextPositionFor,
  updateCard,
  updateSettings,
  updateTeamMember,
} from "./state";

// ────────────────────────────── helpers ───────────────────────────────────

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function offsetToIsoDate(offset: number | null): string | null {
  if (offset === null) return null;
  return addDays(new Date(), offset).toISOString().slice(0, 10);
}

type CardInput = Partial<Omit<Card, "id" | "created_at" | "updated_at">>;

function hydrateCard(input: CardInput): Card {
  const nowIso = new Date().toISOString();
  // Default to Queue to match the real DB column default. ParsedCard doesn't
  // carry column_name, so bulk-inserted cards from /api/ai/parse → /api/cards/bulk
  // land here without one and should go to Queue, not Ready.
  const column = input.column_name ?? "Queue";
  return {
    id: newId(),
    task: input.task ?? "",
    assignee: input.assignee ?? "",
    requester: input.requester ?? "",
    request_date: input.request_date ?? isoToday(),
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

function demoCardToParsed(card: DemoCard): ParsedCard {
  return {
    task: card.task,
    assignee: card.assignee,
    requester: card.requester,
    request_date: isoToday(),
    due_date: offsetToIsoDate(card.dueDayOffset),
    estimated_duration: card.estimated_duration,
    notes: card.notes,
    priority: card.priority,
    status: card.status,
  };
}

// ─────────────────────────────── handlers ─────────────────────────────────

export const handlers = [
  // ========== cards ==========
  http.get("/api/cards", ({ request }) => {
    const url = new URL(request.url);
    const archivedOnly = url.searchParams.get("archived") === "true";
    const assignee = url.searchParams.get("assignee");
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const column = url.searchParams.get("column_name");
    const q = url.searchParams.get("q")?.toLowerCase() ?? null;

    let cards = demoState.cards.filter((c) =>
      archivedOnly ? c.archived_at !== null : c.archived_at === null,
    );
    if (assignee) cards = cards.filter((c) => c.assignee === assignee);
    if (status) cards = cards.filter((c) => c.status === status);
    if (priority) cards = cards.filter((c) => c.priority === priority);
    if (column) cards = cards.filter((c) => c.column_name === column);
    if (q) {
      cards = cards.filter(
        (c) =>
          c.task.toLowerCase().includes(q) ||
          (c.notes ?? "").toLowerCase().includes(q),
      );
    }

    cards = [...cards].sort((a, b) => {
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

  http.patch("/api/cards/:id", async ({ request, params }) => {
    const id = String(params.id);
    const patch = (await request.json()) as Partial<Card>;
    const card = updateCard(id, patch);
    if (!card) {
      return HttpResponse.json({ error: "Card not found" }, { status: 404 });
    }
    return HttpResponse.json({ card });
  }),

  http.delete("/api/cards/:id", ({ params }) => {
    const id = String(params.id);
    if (!deleteCard(id)) {
      return HttpResponse.json({ error: "Card not found" }, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/cards/bulk", async ({ request }) => {
    const body = (await request.json()) as { cards: CardInput[] };
    const hydrated = body.cards.map(hydrateCard);
    addCards(hydrated);
    return HttpResponse.json({ cards: hydrated }, { status: 201 });
  }),

  // ========== team ==========
  http.get("/api/team", () => {
    const members = [...demoState.team].sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return HttpResponse.json({ members });
  }),

  http.post("/api/team", async ({ request }) => {
    const body = (await request.json()) as Partial<TeamMember>;
    const nowIso = new Date().toISOString();
    const member: TeamMember = {
      id: newId(),
      name: body.name ?? "",
      email: body.email ?? null,
      role: body.role ?? null,
      active: body.active ?? true,
      user_id: null,
      created_at: nowIso,
      updated_at: nowIso,
    };
    addTeamMember(member);
    return HttpResponse.json({ member }, { status: 201 });
  }),

  http.patch("/api/team/:id", async ({ request, params }) => {
    const id = String(params.id);
    const patch = (await request.json()) as Partial<TeamMember>;
    const member = updateTeamMember(id, patch);
    if (!member) {
      return HttpResponse.json(
        { error: "Team member not found" },
        { status: 404 },
      );
    }
    return HttpResponse.json({ member });
  }),

  http.delete("/api/team/:id", ({ params }) => {
    const id = String(params.id);
    if (!deleteTeamMember(id)) {
      return HttpResponse.json(
        { error: "Team member not found" },
        { status: 404 },
      );
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // ========== settings ==========
  http.get("/api/settings", () => {
    return HttpResponse.json({ settings: demoState.settings });
  }),

  http.patch("/api/settings", async ({ request }) => {
    const patch = (await request.json()) as Record<string, unknown>;
    updateSettings(patch);
    return HttpResponse.json({ updated: Object.keys(patch).length });
  }),

  // ========== AI parse ==========
  // Returns the cards from the currently-selected demo example (set by the
  // Batch 5 picker). Defaults to the first example so the real <GenerateForm>
  // still produces something useful if someone types text and hits Parse.
  http.post("/api/ai/parse", async () => {
    const selectedId = demoState.selectedExampleId ?? DEMO_EXAMPLES[0].id;
    const example =
      DEMO_EXAMPLES.find((e) => e.id === selectedId) ?? DEMO_EXAMPLES[0];
    const cards: ParsedCard[] = example.cards.map(demoCardToParsed);
    // Simulate a small parse delay so the UI's "Extracting…" spinner feels
    // realistic instead of flashing instantly.
    await new Promise((r) => setTimeout(r, 450));
    return HttpResponse.json({ cards });
  }),
];
