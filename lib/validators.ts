import { z } from "zod";

export const Status = z.enum([
  "Not Started",
  "Ready",
  "In Progress",
  "Blocked",
  "Review",
  "Approved",
]);
export type Status = z.infer<typeof Status>;

export const Column = z.enum([
  "Queue",
  "Ready",
  "In Progress",
  "Review",
  "Done",
]);
export type Column = z.infer<typeof Column>;

// Canonical status → board column mapping. Single source of truth for placing
// a card in the right column when its status is set — on create (API + demo)
// and on edit (card drawer). "Blocked" is intentionally absent: it has no
// fixed column, so an edited blocked card stays put and a newly-created one
// falls back to the DB column default ("Queue").
export const STATUS_TO_COLUMN: Partial<Record<Status, Column>> = {
  "Not Started": "Queue",
  Ready: "Ready",
  "In Progress": "In Progress",
  Review: "Review",
  Approved: "Done",
};

export function columnForStatus(status: Status | undefined): Column | undefined {
  return status ? STATUS_TO_COLUMN[status] : undefined;
}

export const Priority = z.enum(["Low", "Normal", "High"]);
export type Priority = z.infer<typeof Priority>;

// Domain classification — what kind of work the card represents. Used to
// shape AI suggestions and (optionally) filter the board. Nullable on the
// card row; the AI sets it during parse, the user can edit it on the card.
export const Domain = z.enum([
  "Engineering",
  "Design",
  "UX",
  "Content",
  "Marketing",
  "Client",
  "Admin",
  "Other",
]);
export type Domain = z.infer<typeof Domain>;

export const Role = z.enum(["admin", "editor", "viewer"]);
export type Role = z.infer<typeof Role>;

export const ProfileStatus = z.enum(["active", "disabled"]);
export type ProfileStatus = z.infer<typeof ProfileStatus>;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

// HTML form inputs yield "" for empty optional fields.
//  - For NOT NULL columns with DB defaults: coerce "" → undefined so the DB
//    default kicks in and we never send a null.
//  - For nullable columns: coerce "" → null so the user can explicitly clear.
const emptyToUndef = (v: unknown) =>
  v === "" || v === undefined || v === null ? undefined : v;
const emptyToNull = (v: unknown) =>
  v === "" || v === undefined ? null : v;

const optionalIsoDateOmitEmpty = z.preprocess(
  emptyToUndef,
  isoDate.optional(),
);
const nullableIsoDate = z.preprocess(
  emptyToNull,
  isoDate.nullable().optional(),
);
const nullableText = (max: number) =>
  z.preprocess(emptyToNull, z.string().max(max).nullable().optional());

const nullableUuid = z.preprocess(
  emptyToNull,
  z.string().uuid().nullable().optional(),
);

export const CardCreateInput = z.object({
  task: z.string().min(1, "Task is required").max(500),
  assignee: z.string().min(1).max(120),
  requester: z.string().min(1).max(120),
  request_date: optionalIsoDateOmitEmpty,
  estimated_duration: nullableText(50),
  due_date: nullableIsoDate,
  status: Status.optional(),
  priority: Priority.optional(),
  notes: nullableText(10_000),
  column_name: Column.optional(),
  default_category_id: nullableUuid,
  domain: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    Domain.nullable().optional(),
  ),
  // Position omitted from create — DB trigger assigns append-to-bottom.
});
export type CardCreateInput = z.infer<typeof CardCreateInput>;

export const CardUpdateInput = CardCreateInput.partial().extend({
  position: z.number().optional(),
  // ISO timestamp when the card was archived; null = active.
  archived_at: z.string().datetime().nullable().optional(),
  archived_from_column: Column.nullable().optional(),
});
export type CardUpdateInput = z.infer<typeof CardUpdateInput>;

export const CardListQuery = z.object({
  assignee: z.string().optional(),
  status: Status.optional(),
  column_name: Column.optional(),
  priority: Priority.optional(),
  due_before: isoDate.optional(),
  due_after: isoDate.optional(),
  q: z.string().optional(),
});
export type CardListQuery = z.infer<typeof CardListQuery>;

export const AiProvider = z.enum([
  "openrouter",
  "openai",
  "anthropic",
  "google",
]);
export type AiProvider = z.infer<typeof AiProvider>;

export const ProcessingPath = z.enum(["in-app", "n8n"]);
export type ProcessingPath = z.infer<typeof ProcessingPath>;

// All keys editable from the admin UI. `aiApiKeyRef` is the *name* of the env
// var that holds the API key — never the key itself.
// Form uses the required-fields schema; the PATCH endpoint uses the partial
// twin below so callers can send a subset.
export const SettingsFormInput = z.object({
  aiProvider: AiProvider,
  aiModel: z.string().min(1).max(200),
  aiApiKeyRef: z.string().min(1).max(120),
  systemPrompt: z.string().min(1).max(20_000),
  processingPath: ProcessingPath,
  // settings.value is NOT NULL; "" means unset, any non-empty value must be a URL.
  n8nWebhookUrl: z.union([z.string().url(), z.literal("")]),
  // Days an archived card is kept before the daily purge deletes it.
  // 0 = keep forever (purge skipped). UI offers presets (30/60/90/forever).
  archiveRetentionDays: z.number().int().min(0).max(3650),
});
export type SettingsFormInput = z.infer<typeof SettingsFormInput>;

export const SettingsUpdateInput = SettingsFormInput.partial();
export type SettingsUpdateInput = z.infer<typeof SettingsUpdateInput>;

// Admin user provisioning (Supabase Admin API). Password min length matches
// the Supabase Auth default; tighten in dashboard if you want.
export const AdminUserCreateInput = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(72),
  full_name: z.string().min(1).max(120),
  role: Role,
});
export type AdminUserCreateInput = z.infer<typeof AdminUserCreateInput>;

export const AdminUserUpdateInput = z
  .object({
    email: z.string().email().max(254).optional(),
    full_name: z.string().min(1).max(120).optional(),
    role: Role.optional(),
    status: ProfileStatus.optional(),
    // Empty string = no password change; non-empty must meet min length.
    password: z.preprocess(
      emptyToUndef,
      z.string().min(8).max(72).optional(),
    ),
  })
  .partial();
export type AdminUserUpdateInput = z.infer<typeof AdminUserUpdateInput>;

export type AppUser = {
  id: string;
  email: string | null;
  full_name: string;
  role: Role;
  status: ProfileStatus;
  last_logged_in_at: string | null;
  created_at: string;
};

// Team members are assignable people. `role` is a free-text label
// (e.g. "Designer") — NOT the auth Role enum.
export const TeamMemberCreateInput = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.preprocess(
    emptyToNull,
    z.string().email().max(254).nullable().optional(),
  ),
  role: nullableText(80),
  active: z.boolean().optional(),
});
export type TeamMemberCreateInput = z.infer<typeof TeamMemberCreateInput>;

export const TeamMemberUpdateInput = TeamMemberCreateInput.partial();
export type TeamMemberUpdateInput = z.infer<typeof TeamMemberUpdateInput>;

export type TeamMember = {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  active: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

export const SETTINGS_KEYS = [
  "aiProvider",
  "aiModel",
  "aiApiKeyRef",
  "systemPrompt",
  "processingPath",
  "n8nWebhookUrl",
  "archiveRetentionDays",
] as const;
export type SettingsKey = (typeof SETTINGS_KEYS)[number];

// Domain Card type — narrows DB string columns to enum unions.
export type Card = {
  id: string;
  task: string;
  assignee: string;
  requester: string;
  request_date: string;
  estimated_duration: string | null;
  due_date: string | null;
  status: Status;
  priority: Priority;
  column_name: Column;
  notes: string | null;
  position: number;
  archived_at: string | null;
  archived_from_column: Column | null;
  default_category_id: string | null;
  domain: Domain | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

// ─────────────────────────────────────────────────────────────────────
// Time Log
// ─────────────────────────────────────────────────────────────────────

export const TimeEntrySource = z.enum(["timer", "manual"]);
export type TimeEntrySource = z.infer<typeof TimeEntrySource>;

export type TimeCategory = {
  id: string;
  name: string;
  color: string | null;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export const TimeCategoryCreateInput = z.object({
  name: z.string().min(1).max(60),
  color: nullableText(40),
  position: z.number().optional(),
  active: z.boolean().optional(),
});
export type TimeCategoryCreateInput = z.infer<typeof TimeCategoryCreateInput>;

export const TimeCategoryUpdateInput = TimeCategoryCreateInput.partial();
export type TimeCategoryUpdateInput = z.infer<typeof TimeCategoryUpdateInput>;

export type TimeEntry = {
  id: string;
  card_id: string | null;
  category_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
  source: TimeEntrySource;
  created_by: string;
  created_at: string;
  updated_at: string;
};

const isoDateTime = z.string().datetime({ offset: true });

// Manual entry — must include start + end + duration. Timer-style entries
// (started, no end yet) go through /start instead.
export const TimeEntryCreateInput = z.object({
  card_id: nullableUuid,
  category_id: nullableUuid,
  started_at: isoDateTime,
  ended_at: isoDateTime,
  duration_minutes: z.number().int().min(1).max(60 * 24 * 31),
  notes: nullableText(2000),
});
export type TimeEntryCreateInput = z.infer<typeof TimeEntryCreateInput>;

export const TimeEntryUpdateInput = z.object({
  card_id: nullableUuid,
  category_id: nullableUuid,
  started_at: isoDateTime.optional(),
  ended_at: isoDateTime.optional(),
  duration_minutes: z.number().int().min(1).max(60 * 24 * 31).optional(),
  notes: nullableText(2000),
}).partial();
export type TimeEntryUpdateInput = z.infer<typeof TimeEntryUpdateInput>;

export const TimeEntryStartInput = z.object({
  card_id: nullableUuid,
  category_id: nullableUuid,
  notes: nullableText(2000),
});
export type TimeEntryStartInput = z.infer<typeof TimeEntryStartInput>;

export const PeriodPreset = z.enum([
  "this_week",
  "last_week",
  "biweekly_current",
  "biweekly_last",
  "this_month",
  "last_month",
  "custom",
  "all",
]);
export type PeriodPreset = z.infer<typeof PeriodPreset>;

export const TimeEntryListQuery = z.object({
  period: PeriodPreset.optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
  card_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  mine: z.enum(["true", "false"]).optional(),
  format: z.enum(["json", "csv"]).optional(),
});
export type TimeEntryListQuery = z.infer<typeof TimeEntryListQuery>;
