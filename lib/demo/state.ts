// In-memory demo state. Singleton module — refresh the page and the module is
// re-evaluated, wiping state. This is intentional: /try is a throw-away
// sandbox, not a persistent account.
import { DEMO_TEAM, type DemoExample } from "@/config/demo-examples";
import type { Card, TeamMember } from "@/lib/validators";

type SettingsMap = Record<string, unknown>;

export type DemoState = {
  cards: Card[];
  team: TeamMember[];
  settings: SettingsMap;
  selectedExampleId: DemoExample["id"] | null;
  tourCompleted: boolean;
  tourSkipped: boolean;
  dragHintDismissed: boolean;
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

export const demoState: DemoState = {
  cards: [],
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
