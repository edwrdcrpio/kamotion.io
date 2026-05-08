// Full MSW handler set — covers every /api/* call the /try/* tree makes.
// Handler shapes match app/api/**/route.ts response bodies so the real
// components get the payloads they expect.
import { http, HttpResponse } from "msw";
import type {
  Card,
  TeamMember,
  TimeCategory,
  TimeEntry,
} from "@/lib/validators";
import type { ParsedCard } from "@/lib/ai/schema";
import { DEMO_EXAMPLES, type DemoCard } from "@/config/demo-examples";
import {
  rangeForPreset,
  parseAnchorMondayIso,
  formatMinutes,
} from "@/lib/time-log/period";
import { toCsv } from "@/lib/time-log/csv";
import {
  addCards,
  addCategory,
  addEntry,
  addTeamMember,
  DEMO_USER_ID,
  demoState,
  deleteCard,
  deleteCategory,
  deleteEntry,
  deleteTeamMember,
  findRunningEntry,
  newId,
  nextPositionFor,
  updateCard,
  updateCategory,
  updateEntry,
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
    default_category_id: input.default_category_id ?? null,
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

// ───────────────────────── time-log helpers ───────────────────────────────

type EntryWithJoins = TimeEntry & {
  cards: { task: string } | null;
  time_categories: { name: string; color: string | null } | null;
};

function joinEntry(entry: TimeEntry): EntryWithJoins {
  const card = entry.card_id
    ? demoState.cards.find((c) => c.id === entry.card_id) ?? null
    : null;
  const cat = entry.category_id
    ? demoState.categories.find((c) => c.id === entry.category_id) ?? null
    : null;
  return {
    ...entry,
    cards: card ? { task: card.task } : null,
    time_categories: cat ? { name: cat.name, color: cat.color } : null,
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

  // ========== time categories ==========
  http.get("/api/categories", () => {
    const categories = [...demoState.categories].sort(
      (a, b) => a.position - b.position,
    );
    return HttpResponse.json({ categories });
  }),

  http.post("/api/categories", async ({ request }) => {
    const body = (await request.json()) as Partial<TimeCategory>;
    if (!body.name || !body.name.trim()) {
      return HttpResponse.json(
        { error: "name is required" },
        { status: 400 },
      );
    }
    const category = addCategory({
      name: body.name,
      color: body.color ?? null,
      position: body.position,
      active: body.active,
    });
    return HttpResponse.json({ category }, { status: 201 });
  }),

  http.patch("/api/categories/:id", async ({ request, params }) => {
    const id = String(params.id);
    const patch = (await request.json()) as Partial<TimeCategory>;
    const category = updateCategory(id, patch);
    if (!category) {
      return HttpResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }
    return HttpResponse.json({ category });
  }),

  http.delete("/api/categories/:id", ({ params }) => {
    const id = String(params.id);
    if (!deleteCategory(id)) {
      return HttpResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }
    return HttpResponse.json({ ok: true });
  }),

  // ========== time entries ==========
  http.get("/api/time-entries", ({ request }) => {
    const url = new URL(request.url);
    const period = url.searchParams.get("period");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const cardId = url.searchParams.get("card_id");
    const categoryId = url.searchParams.get("category_id");
    const mine = url.searchParams.get("mine");
    const format = url.searchParams.get("format");

    // Real route: default mine=true, scoped to created_by=session.user.id.
    // In demo we only have one user, so anything not stamped with our id is
    // filtered out for parity (defence in depth — currently nothing else
    // creates entries).
    const showAll = mine === "false";
    let entries = demoState.entries.filter(
      (e) => showAll || e.created_by === DEMO_USER_ID,
    );

    if (cardId) entries = entries.filter((e) => e.card_id === cardId);
    if (categoryId)
      entries = entries.filter((e) => e.category_id === categoryId);

    if (period) {
      const anchor = parseAnchorMondayIso(
        (demoState.settings as Record<string, unknown>).biweeklyAnchorMonday,
      );
      const range = rangeForPreset(
        period as Parameters<typeof rangeForPreset>[0],
        new Date(),
        anchor,
        from && to
          ? { from: new Date(from), to: new Date(to) }
          : undefined,
      );
      if (range) {
        entries = entries.filter((e) => {
          const t = new Date(e.started_at);
          return t >= range.start && t < range.end;
        });
      }
    }

    entries = [...entries].sort((a, b) =>
      a.started_at < b.started_at ? 1 : -1,
    );

    const joined = entries.map(joinEntry);

    if (format === "csv") {
      const rows = joined.map((e) => ({
        date: e.started_at.slice(0, 10),
        card: e.cards?.task ?? "",
        category: e.time_categories?.name ?? "",
        started_at: e.started_at,
        ended_at: e.ended_at ?? "",
        duration:
          e.duration_minutes != null ? formatMinutes(e.duration_minutes) : "",
        duration_minutes: e.duration_minutes ?? "",
        source: e.source,
        notes: e.notes ?? "",
      }));
      const csv = toCsv(rows, [
        { key: "date", header: "Date" },
        { key: "card", header: "Card" },
        { key: "category", header: "Category" },
        { key: "started_at", header: "Started" },
        { key: "ended_at", header: "Ended" },
        { key: "duration", header: "Duration" },
        { key: "duration_minutes", header: "Minutes" },
        { key: "source", header: "Source" },
        { key: "notes", header: "Notes" },
      ]);
      return new HttpResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="time-log-${isoToday()}.csv"`,
        },
      });
    }

    return HttpResponse.json({ entries: joined });
  }),

  http.post("/api/time-entries", async ({ request }) => {
    const body = (await request.json()) as Partial<TimeEntry>;
    if (
      !body.started_at ||
      !body.ended_at ||
      typeof body.duration_minutes !== "number"
    ) {
      return HttpResponse.json(
        { error: "started_at, ended_at, and duration_minutes are required" },
        { status: 400 },
      );
    }
    const nowIso = new Date().toISOString();
    const entry: TimeEntry = {
      id: newId(),
      card_id: body.card_id ?? null,
      category_id: body.category_id ?? null,
      started_at: body.started_at,
      ended_at: body.ended_at,
      duration_minutes: body.duration_minutes,
      notes: body.notes ?? null,
      source: "manual",
      created_by: DEMO_USER_ID,
      created_at: nowIso,
      updated_at: nowIso,
    };
    addEntry(entry);
    return HttpResponse.json({ entry: joinEntry(entry) }, { status: 201 });
  }),

  http.patch("/api/time-entries/:id", async ({ request, params }) => {
    const id = String(params.id);
    const patch = (await request.json()) as Partial<TimeEntry>;
    const entry = updateEntry(id, patch);
    if (!entry) {
      return HttpResponse.json(
        { error: "Entry not found" },
        { status: 404 },
      );
    }
    return HttpResponse.json({ entry: joinEntry(entry) });
  }),

  http.delete("/api/time-entries/:id", ({ params }) => {
    const id = String(params.id);
    if (!deleteEntry(id)) {
      return HttpResponse.json(
        { error: "Entry not found" },
        { status: 404 },
      );
    }
    return HttpResponse.json({ ok: true });
  }),

  http.post("/api/time-entries/start", async ({ request }) => {
    const body = (await request
      .json()
      .catch(() => ({}))) as Partial<TimeEntry>;

    if (findRunningEntry()) {
      return HttpResponse.json(
        { error: "A timer is already running" },
        { status: 409 },
      );
    }

    // If no category passed, inherit from card.default_category_id —
    // matches the real handler.
    let categoryId = body.category_id ?? null;
    if (!categoryId && body.card_id) {
      const card = demoState.cards.find((c) => c.id === body.card_id);
      categoryId = card?.default_category_id ?? null;
    }

    const nowIso = new Date().toISOString();
    const entry: TimeEntry = {
      id: newId(),
      card_id: body.card_id ?? null,
      category_id: categoryId,
      started_at: nowIso,
      ended_at: null,
      duration_minutes: null,
      notes: body.notes ?? null,
      source: "timer",
      created_by: DEMO_USER_ID,
      created_at: nowIso,
      updated_at: nowIso,
    };
    addEntry(entry);
    return HttpResponse.json({ entry: joinEntry(entry) }, { status: 201 });
  }),

  http.post("/api/time-entries/stop", () => {
    const running = findRunningEntry();
    if (!running) {
      return HttpResponse.json(
        { error: "No timer is running" },
        { status: 404 },
      );
    }
    const ended = new Date();
    const started = new Date(running.started_at);
    const minutes = Math.max(
      1,
      Math.round((ended.getTime() - started.getTime()) / 60_000),
    );
    const updated = updateEntry(running.id, {
      ended_at: ended.toISOString(),
      duration_minutes: minutes,
    });
    if (!updated) {
      return HttpResponse.json(
        { error: "Failed to stop timer" },
        { status: 500 },
      );
    }
    return HttpResponse.json({ entry: joinEntry(updated) });
  }),

  http.get("/api/time-entries/active", () => {
    const running = findRunningEntry();
    return HttpResponse.json({
      entry: running ? joinEntry(running) : null,
    });
  }),
];
