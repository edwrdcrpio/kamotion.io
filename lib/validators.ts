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

export const Priority = z.enum(["Low", "Normal", "High"]);
export type Priority = z.infer<typeof Priority>;

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
  created_at: string;
  updated_at: string;
  created_by: string | null;
};
