import { z } from "zod";
import { Priority, Status } from "@/lib/validators";

// OpenAI strict structured-output mode requires every field be present in
// `required`, so we can't use `.optional()` or `.default()`. Fields that may
// be genuinely empty use `.nullable()` and we fill sensible defaults after
// the parse.
//
// Also: no `maxItems` on the outer array (Azure/OpenRouter rejects that).
// We cap at the API boundary via BulkInput.max(50).
export const ParsedCard = z.object({
  task: z.string().min(1).max(500),
  assignee: z.string().min(1).max(120),
  requester: z.string().min(1).max(120),
  request_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  estimated_duration: z.string().nullable(),
  notes: z.string().nullable(),
  priority: Priority,
  status: Status,
});
export type ParsedCard = z.infer<typeof ParsedCard>;

export const ParseOutput = z.object({
  cards: z.array(ParsedCard),
});
export type ParseOutput = z.infer<typeof ParseOutput>;

export const ParseInput = z.object({
  text: z.string().min(1).max(100_000),
  mode: z.enum(["solo", "team"]),
  teamMembers: z.array(z.string()).optional(),
});
export type ParseInput = z.infer<typeof ParseInput>;
