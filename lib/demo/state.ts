// In-memory demo state. Singleton module — refresh the page and the module is
// re-evaluated, wiping state. This is intentional: /try is a throw-away
// sandbox, not a persistent account.
import { DEMO_TEAM, type DemoExample } from "@/config/demo-examples";
import type {
  Card,
  Domain,
  TeamMember,
  TimeCategory,
  TimeEntry,
} from "@/lib/validators";

type SettingsMap = Record<string, unknown>;

export type DemoState = {
  cards: Card[];
  team: TeamMember[];
  settings: SettingsMap;
  selectedExampleId: DemoExample["id"] | null;
  tourCompleted: boolean;
  tourSkipped: boolean;
  dragHintDismissed: boolean;
  categories: TimeCategory[];
  entries: TimeEntry[];
};

function now(): string {
  return new Date().toISOString();
}

function makeUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Synthesized "current user" for the demo. Real route handlers gate everything
// on session.user.id; the MSW handlers stamp this value as created_by so
// the mine=true filter always matches.
export const DEMO_USER_ID = makeUuid();

// ───────────────────── seed: time categories ──────────────────────────────
// Mirrors the production seed in migration 10 (name + color + position).
function seedCategories(): TimeCategory[] {
  const ts = now();
  const rows: Array<Pick<TimeCategory, "name" | "color" | "position">> = [
    { name: "Design", color: "rose", position: 1000 },
    { name: "R&D", color: "amber", position: 2000 },
    { name: "Code", color: "teal", position: 3000 },
    { name: "Revision", color: "indigo", position: 4000 },
    { name: "Meeting", color: "sky", position: 5000 },
    { name: "Admin", color: "slate", position: 6000 },
  ];
  return rows.map((r) => ({
    id: makeUuid(),
    name: r.name,
    color: r.color,
    position: r.position,
    active: true,
    created_at: ts,
    updated_at: ts,
  }));
}

const DEMO_CATEGORIES = seedCategories();
const CATEGORY_BY_NAME: Record<string, string> = Object.fromEntries(
  DEMO_CATEGORIES.map((c) => [c.name, c.id]),
);

// ───────────────────── seed: cards (for time-log demo) ────────────────────
// A small set of in-flight cards spanning In Progress / Review / Done so the
// /try/time-log page lights up with rows + totals. Generate-flow cards land
// in Queue/Ready and stack on top of these.
function seedCards(): Card[] {
  const ts = now();
  const today = new Date().toISOString().slice(0, 10);
  const offset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  type Seed = {
    task: string;
    assignee: string;
    requester: string;
    estimated_duration: string | null;
    due_date: string | null;
    request_date: string;
    priority: Card["priority"];
    status: Card["status"];
    column_name: Card["column_name"];
    notes: string | null;
    default_category_id: string | null;
    domain: Domain | null;
    position: number;
  };

  const seeds: Seed[] = [
    {
      task: "Refresh quarterly partner deck",
      assignee: "Dana Park",
      requester: "Lucy Lu",
      estimated_duration: "6h",
      due_date: offset(4),
      request_date: offset(-9),
      priority: "High",
      status: "In Progress",
      column_name: "In Progress",
      notes:
        "Cover slides, customer logos, two case-study slides. Lucy will review before partner sync.",
      default_category_id: CATEGORY_BY_NAME["Design"],
      domain: "Design",
      position: 1,
    },
    {
      task: "Migrate analytics from UA to GA4",
      assignee: "Casey Brooks",
      requester: "Morgan Reyes",
      estimated_duration: "8h",
      due_date: offset(7),
      request_date: offset(-12),
      priority: "Normal",
      status: "In Progress",
      column_name: "In Progress",
      notes:
        "Set up GA4 property, port custom events, sanity-check ecommerce funnel parity for two weeks.",
      default_category_id: CATEGORY_BY_NAME["Code"],
      domain: "Engineering",
      position: 2,
    },
    {
      task: "Fix mobile checkout double-tap bug",
      assignee: "Jamie Liu",
      requester: "Casey Brooks",
      estimated_duration: "3h",
      due_date: offset(2),
      request_date: offset(-5),
      priority: "High",
      status: "Blocked",
      column_name: "In Progress",
      notes:
        "Repro on iOS Safari only. Suspected event-handler race after the recent Stripe.js upgrade.",
      default_category_id: CATEGORY_BY_NAME["Code"],
      domain: "Engineering",
      position: 3,
    },
    {
      task: "Onboarding flow copy review",
      assignee: "Sarah Chen",
      requester: "Lucy Lu",
      estimated_duration: "2h",
      due_date: offset(3),
      request_date: offset(-7),
      priority: "Normal",
      status: "Review",
      column_name: "Review",
      notes:
        "Tighten step 2 + step 4 copy. Drop the legalese; product team wants an empty-state nudge instead.",
      default_category_id: CATEGORY_BY_NAME["Revision"],
      domain: "Content",
      position: 1,
    },
    {
      task: "Q3 OKR review prep",
      assignee: "Lucy Lu",
      requester: "Lucy Lu",
      estimated_duration: "4h",
      due_date: offset(5),
      request_date: offset(-10),
      priority: "Normal",
      status: "Review",
      column_name: "Review",
      notes:
        "Slide 4 needs the latest activation numbers — pull from Mixpanel before sending to leadership.",
      default_category_id: CATEGORY_BY_NAME["Meeting"],
      domain: "Admin",
      position: 2,
    },
    {
      task: "Wire Stripe webhook for invoice paid",
      assignee: "Jamie Liu",
      requester: "Sam Torres",
      estimated_duration: "3h",
      due_date: offset(-2),
      request_date: offset(-14),
      priority: "Normal",
      status: "Approved",
      column_name: "Done",
      notes:
        "Shipped behind feature flag. Verified end-to-end with a $1 test charge.",
      default_category_id: CATEGORY_BY_NAME["Code"],
      domain: "Engineering",
      position: 1,
    },
  ];

  return seeds.map((s) => ({
    id: makeUuid(),
    task: s.task,
    assignee: s.assignee,
    requester: s.requester,
    request_date: s.request_date,
    estimated_duration: s.estimated_duration,
    due_date: s.due_date,
    status: s.status,
    priority: s.priority,
    column_name: s.column_name,
    notes: s.notes,
    position: s.position,
    archived_at: null,
    archived_from_column: null,
    default_category_id: s.default_category_id,
    domain: s.domain,
    created_at: ts,
    updated_at: ts,
    created_by: null,
  }));
}

const DEMO_CARDS = seedCards();

// ───────────────────── seed: time entries ─────────────────────────────────
// Spread across the past two weeks, mostly card-attached, mostly timer
// source. One entry is currently running (ended_at: null) for visual punch
// in the "Timer" column.
function entryAt(
  daysAgo: number,
  hour: number,
  durationMinutes: number,
  cardId: string | null,
  categoryId: string | null,
  source: TimeEntry["source"] = "timer",
  notes: string | null = null,
): TimeEntry {
  const start = new Date();
  start.setDate(start.getDate() - daysAgo);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const ts = start.toISOString();
  return {
    id: makeUuid(),
    card_id: cardId,
    category_id: categoryId,
    started_at: ts,
    ended_at: end.toISOString(),
    duration_minutes: durationMinutes,
    notes,
    source,
    created_by: DEMO_USER_ID,
    created_at: ts,
    updated_at: ts,
  };
}

function runningEntry(
  minutesAgo: number,
  cardId: string | null,
  categoryId: string | null,
): TimeEntry {
  const start = new Date(Date.now() - minutesAgo * 60_000);
  const ts = start.toISOString();
  return {
    id: makeUuid(),
    card_id: cardId,
    category_id: categoryId,
    started_at: ts,
    ended_at: null,
    duration_minutes: null,
    notes: null,
    source: "timer",
    created_by: DEMO_USER_ID,
    created_at: ts,
    updated_at: ts,
  };
}

function seedEntries(): TimeEntry[] {
  const [partnerDeck, ga4, checkout, copyReview, okrPrep, stripe] = DEMO_CARDS;
  const cat = (name: string) => CATEGORY_BY_NAME[name] ?? null;

  return [
    // Currently running on the partner deck.
    runningEntry(27, partnerDeck.id, cat("Design")),

    // partner deck — past sessions
    entryAt(1, 10, 90, partnerDeck.id, cat("Design"), "timer"),
    entryAt(3, 14, 120, partnerDeck.id, cat("Design"), "timer", "Hero slide rework"),

    // GA4 migration — multiple sessions
    entryAt(0, 9, 75, ga4.id, cat("Code"), "timer"),
    entryAt(2, 15, 60, ga4.id, cat("Code"), "manual", "Audit existing UA events"),
    entryAt(4, 11, 105, ga4.id, cat("Code"), "timer"),
    entryAt(8, 13, 45, ga4.id, cat("R&D"), "manual", "Compare GA4 vs UA reporting drift"),

    // Checkout bug — short repro session
    entryAt(2, 16, 45, checkout.id, cat("Code"), "timer", "Repro attempt on iOS 17"),

    // Onboarding copy — review pass
    entryAt(1, 16, 60, copyReview.id, cat("Revision"), "manual", "Pass 1 — drop legal copy"),

    // OKR prep — meeting/prep mix
    entryAt(0, 13, 30, okrPrep.id, cat("Meeting"), "timer"),
    entryAt(5, 9, 90, okrPrep.id, cat("Admin"), "manual"),

    // Stripe — finished card, last touched a couple days ago
    entryAt(3, 11, 60, stripe.id, cat("Code"), "timer", "Webhook + test charge"),
  ];
}

const DEMO_ENTRIES = seedEntries();

export const demoState: DemoState = {
  cards: DEMO_CARDS,
  team: DEMO_TEAM.map((m) => ({
    id: makeUuid(),
    name: m.name,
    email: m.email,
    role: m.role,
    active: true,
    user_id: null,
    created_at: now(),
    updated_at: now(),
  })),
  settings: {
    aiProvider: "openrouter",
    aiModel: "anthropic/claude-sonnet-4-5",
    aiApiKeyRef: "AI_API_KEY_OPENROUTER",
    systemPrompt:
      "You are a project management assistant. Extract actionable tasks from the provided text and return them as structured cards. Return only valid JSON matching the schema.",
    processingPath: "in-app",
    n8nWebhookUrl: "",
  },
  selectedExampleId: null,
  tourCompleted: false,
  tourSkipped: false,
  dragHintDismissed: false,
  categories: DEMO_CATEGORIES,
  entries: DEMO_ENTRIES,
};

export function newId(): string {
  return makeUuid();
}

// ────────────────────────────────── cards ─────────────────────────────────

export function addCards(cards: Card[]): void {
  demoState.cards.push(...cards);
}

export function updateCard(id: string, patch: Partial<Card>): Card | null {
  const idx = demoState.cards.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const next: Card = { ...demoState.cards[idx], ...patch, updated_at: now() };
  demoState.cards[idx] = next;
  return next;
}

export function deleteCard(id: string): boolean {
  const idx = demoState.cards.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  demoState.cards.splice(idx, 1);
  return true;
}

export function nextPositionFor(columnName: Card["column_name"]): number {
  const cols = demoState.cards
    .filter((c) => c.column_name === columnName && c.archived_at === null)
    .map((c) => c.position);
  return cols.length ? Math.max(...cols) + 1 : 1;
}

// ─────────────────────────────────── team ─────────────────────────────────

export function addTeamMember(member: TeamMember): void {
  demoState.team.push(member);
}

export function updateTeamMember(
  id: string,
  patch: Partial<TeamMember>,
): TeamMember | null {
  const idx = demoState.team.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  const next: TeamMember = {
    ...demoState.team[idx],
    ...patch,
    updated_at: now(),
  };
  demoState.team[idx] = next;
  return next;
}

export function deleteTeamMember(id: string): boolean {
  const idx = demoState.team.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  demoState.team.splice(idx, 1);
  return true;
}

// ───────────────────────────────── settings ───────────────────────────────

export function updateSettings(patch: SettingsMap): void {
  Object.assign(demoState.settings, patch);
}

// ───────────────────────────── demo example select ────────────────────────

export function setSelectedExample(id: DemoExample["id"] | null): void {
  demoState.selectedExampleId = id;
}

// ───────────────────────────── time categories ────────────────────────────

export function addCategory(input: {
  name: string;
  color?: string | null;
  position?: number;
  active?: boolean;
}): TimeCategory {
  const ts = now();
  const maxPos = demoState.categories.reduce(
    (m, c) => Math.max(m, c.position),
    0,
  );
  const cat: TimeCategory = {
    id: makeUuid(),
    name: input.name,
    color: input.color ?? null,
    position: input.position ?? maxPos + 1000,
    active: input.active ?? true,
    created_at: ts,
    updated_at: ts,
  };
  demoState.categories.push(cat);
  return cat;
}

export function updateCategory(
  id: string,
  patch: Partial<TimeCategory>,
): TimeCategory | null {
  const idx = demoState.categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const next: TimeCategory = {
    ...demoState.categories[idx],
    ...patch,
    updated_at: now(),
  };
  demoState.categories[idx] = next;
  return next;
}

export function deleteCategory(id: string): boolean {
  const idx = demoState.categories.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  demoState.categories.splice(idx, 1);
  // Null-out references on cards + entries so the UI stays consistent —
  // matches ON DELETE SET NULL on the real FKs.
  for (const card of demoState.cards) {
    if (card.default_category_id === id) card.default_category_id = null;
  }
  for (const entry of demoState.entries) {
    if (entry.category_id === id) entry.category_id = null;
  }
  return true;
}

// ─────────────────────────────── time entries ─────────────────────────────

export function addEntry(entry: TimeEntry): void {
  demoState.entries.push(entry);
}

export function updateEntry(
  id: string,
  patch: Partial<TimeEntry>,
): TimeEntry | null {
  const idx = demoState.entries.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const next: TimeEntry = {
    ...demoState.entries[idx],
    ...patch,
    updated_at: now(),
  };
  demoState.entries[idx] = next;
  return next;
}

export function deleteEntry(id: string): boolean {
  const idx = demoState.entries.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  demoState.entries.splice(idx, 1);
  return true;
}

export function findRunningEntry(): TimeEntry | null {
  return (
    demoState.entries.find(
      (e) => e.created_by === DEMO_USER_ID && e.ended_at === null,
    ) ?? null
  );
}
