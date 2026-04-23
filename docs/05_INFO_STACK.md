---
Created: 2026-04-21
Updated: 2026-04-22
Status: Reference
Purpose: Stack / schema / env reference for Kamotion
---

# Kamotion — Stack, Schema & Environment Reference

## Package versions (current)

| Package | Version |
|---|---|
| next | 16.2.4 |
| react | 19.2.4 |
| tailwindcss | ^4 |
| typescript | ^5 |
| @supabase/supabase-js | latest |
| @supabase/ssr | latest |
| @dnd-kit/core, sortable, utilities | latest |
| @tanstack/react-query | latest |
| react-hook-form + @hookform/resolvers | latest |
| zod | latest |
| ai | ^6.0.168 |
| @ai-sdk/openai | latest |
| @ai-sdk/anthropic | latest |
| @ai-sdk/google | latest |
| cmdk | ^1.1.1 |
| @radix-ui/react-popover | latest (via shadcn) |

## Environment Variables

### `.env.local` (gitignored)

```
NEXT_PUBLIC_SUPABASE_URL=https://njlidscexyofixjbtyhd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_…   # publishable key
SUPABASE_SERVICE_ROLE_KEY=                       # required for /app/settings/users (D.3). Legacy service_role JWT works.
NEXT_PUBLIC_APP_URL=http://localhost:3000
LOG_LEVEL=debug
AI_API_KEY_OPENROUTER=sk-or-v1-…                 # primary AI path
AI_API_KEY_OPENAI=                               # optional
AI_API_KEY_ANTHROPIC=                            # optional
AI_API_KEY_GOOGLE=                               # optional
```

### `.env.example` (committed)

Template — actual values not committed. Same keys with blank values.

## Supabase

- **Project**: `kamotion.io`
- **Ref**: `njlidscexyofixjbtyhd`
- **URL**: `https://njlidscexyofixjbtyhd.supabase.co`
- **Region**: us-east-2
- **Postgres**: 17

### Migrations (applied in order)

1. `01_kamotion_schema` — 4 tables + helper functions + triggers
2. `02_kamotion_rls` — Row-level security policies
3. `03_kamotion_function_hardening` — `set search_path` on trigger functions
4. `04_kamotion_auth_helpers` — `mark_logged_in()` SECURITY DEFINER
5. `05_kamotion_priority` — `priority` column + check constraint
6. `06_kamotion_position` — `position` column + ordering trigger + composite index
7. `07_kamotion_ready_status` — Added `Ready` to status enum
8. `08_kamotion_archive` — `archived_at` + `archived_from_column` + pg_cron cleanup job
9. `09_kamotion_settings_read` — RLS relax so editors can read settings

### Schema

**`auth.users`** — Supabase-managed (email, encrypted_password, etc.)

**`public.profiles`** — extends auth.users
- `id uuid PK → auth.users.id`, `full_name`, `role` (admin/editor/viewer), `status` (active/disabled), `last_logged_in_at`, `created_at`, `updated_at`

**`public.cards`** — kanban cards
- `id uuid PK`
- `task`, `assignee`, `requester`
- `request_date`, `due_date` (date)
- `estimated_duration` text (e.g. "2h", "5d")
- `status` — `Not Started | Ready | In Progress | Blocked | Review | Approved`
- `priority` — `Low | Normal | High`
- `column_name` — `Queue | Ready | In Progress | Review | Done`
- `position real` (for within-column ordering; midpoint math)
- `notes` text
- `archived_at timestamptz`, `archived_from_column text` — soft-delete
- `created_by uuid → profiles.id`, `created_at`, `updated_at`

**`public.team_members`** — assignable people
- `id`, `user_id → profiles.id (nullable)`, `name`, `email`, `role`, `active`, timestamps

**`public.settings`** — key/value config
- `key text PK`, `value jsonb`, `updated_at`, `updated_by → profiles.id`
- Current keys: `aiProvider`, `aiApiKeyRef`, `aiModel`, `processingPath`, `n8nWebhookUrl`, `systemPrompt`

### Helper functions

- `public.is_admin()` — SECURITY DEFINER, returns bool, used in RLS
- `public.current_user_role()` — SECURITY DEFINER, returns role text
- `public.mark_logged_in()` — SECURITY DEFINER, stamps `last_logged_in_at`
- `public.set_updated_at()` — trigger fn
- `public.cards_auto_move_on_approved()` — trigger fn (status=Approved → column=Done)
- `public.cards_assign_position()` — trigger fn (append to bottom on insert)

### Scheduled jobs (pg_cron)

- `kamotion-archive-cleanup` — `0 3 * * *` UTC, deletes `cards` where `archived_at < now() - 90 days`

### RLS summary

| Table | SELECT | WRITE |
|---|---|---|
| `profiles` | any authenticated | admin only |
| `team_members` | any authenticated | admin only |
| `cards` | any authenticated | admin + editor |
| `settings` | any authenticated (relaxed for server AI parse) | admin only |

## MCP

- **Project-scoped**: `.mcp.json` at repo root, gitignored
- **Auth**: personal access token, scoped with `--project-ref=njlidscexyofixjbtyhd`
- **Purpose**: isolated from employer Supabase account

## File Map (key files)

### Auth + Session
- `proxy.ts` — root middleware for Supabase cookie refresh (Next.js 16 renamed from `middleware.ts`)
- `lib/supabase/{client,server,middleware}.ts` — typed factories
- `lib/supabase/admin.ts` — service-role client (D.3); throws `HttpError(503)` if `SUPABASE_SERVICE_ROLE_KEY` missing
- `lib/auth.ts` — `getSession()` with React cache (server-only)
- `lib/rbac.ts` — `requireRole()` + `toResponse()` error handler
- `app/login/{page,login-form,actions}.tsx`
- `app/app/layout.tsx` — auth-guarded shell

### App shell
- `components/app-shell/{sidebar,header,nav-config}.tsx`
- `config/brand.ts` — single-source brand config

### Kanban
- `components/kanban/board.tsx` — DndContext, columns, cards, reorder math
- `components/kanban/new-card-dialog.tsx` — "+ New card" form
- `components/kanban/card-detail-drawer.tsx` — Sheet with full edit + archive/delete
- `components/kanban/duration-slider.tsx` — 85-position slider (30m → 72h → 14d)
- `components/kanban/filter-bar.tsx` — search + assignee + priority/blocked

### Archive
- `app/app/archive/{page,archive-table}.tsx`

### AI Parser
- `lib/ai/schema.ts` — `ParsedCard`, `ParseOutput`, `ParseInput` Zod schemas
- `lib/ai/providers.ts` — `getModel(provider, modelId, apiKey)` factory
- `lib/ai/parse.ts` — `parseViaAi()` + `parseViaN8n()`
- `app/api/ai/parse/route.ts` — parse endpoint (reads settings, routes)
- `app/api/cards/bulk/route.ts` — bulk insert
- `app/app/generate/{page,generate-form,preview-dialog}.tsx`

### Gantt (D.1)
- `app/app/gantt/page.tsx` — auth-guarded entry
- `components/gantt/gantt-chart.tsx` — single-file chart (~430 LOC), reuses `["cards"]` query, drag-to-shift due_date, click → `CardDetailDrawer`, status legend, today line, weekend tint, unscheduled list

### Team CRUD (D.2)
- `app/app/team/{page,team-table}.tsx` — admin-guarded
- `app/api/team/route.ts` (GET, POST)
- `app/api/team/[id]/route.ts` (PATCH, DELETE)

### Users CRUD (D.3) + sync (D.3.5)
- `app/app/settings/users/{page,users-table}.tsx` — admin-guarded; passes `serviceRoleConfigured` flag to client
- `app/api/admin/users/route.ts` (GET list joined with profiles, POST create + mirror to team_members)
- `app/api/admin/users/[id]/route.ts` (PATCH name/role/status/password + mirror to team_members; DELETE unlinks team_members.user_id then deletes profile + auth user). Self-protection guards in PATCH and DELETE.

### Person picker (D.3.5)
- `components/ui/person-combobox.tsx` — searchable team-member dropdown with free-text "Other" fallback. Used in NewCardDialog + CardDetailDrawer. Selected item indicated by `font-medium text-primary` (no leading checkmark — see Lessons Learned).
- `components/ui/{command,popover,input-group}.tsx` — shadcn primitives installed by `npx shadcn add command popover`

### API routes
- `app/api/cards/route.ts` (GET, POST)
- `app/api/cards/[id]/route.ts` (PATCH, DELETE)
- `app/api/cards/bulk/route.ts` (POST)
- `app/api/ai/parse/route.ts` (POST)
- `app/api/team/route.ts` (GET, POST), `app/api/team/[id]/route.ts` (PATCH, DELETE)
- `app/api/admin/users/route.ts` (GET, POST), `app/api/admin/users/[id]/route.ts` (PATCH, DELETE)

### Shared validators + types
- `lib/validators.ts` — Zod schemas + domain `Card` type
- `lib/types/database.types.ts` — Supabase-generated types

### Landing
- `app/page.tsx` — Aurora hero + 3-step how-it-works + 4 features + footer
- `app/globals.css` — Tailwind v4 `@theme`, light+dark tokens, aurora keyframes
- `app/layout.tsx` — root with `next/font` wiring

## Design Tokens (key pieces)

```css
/* Primary (light) */
--primary: oklch(0.704 0.14 182.503);       /* teal-500 */
--primary-foreground: oklch(0.985 0 0);     /* white */

/* Primary (dark) */
--primary: oklch(0.777 0.152 181.912);      /* teal-400 */
--primary-foreground: oklch(0.18 0.03 265); /* dark bg */

/* Brand tokens (custom — outside shadcn slots) */
--brand-success: oklch(0.696 0.17 162.48);  /* emerald-500 */
--brand-accent:  oklch(0.645 0.246 16.439); /* rose-500, AI moments only */
--brand-warning: oklch(0.769 0.188 70.08);  /* amber-500 */

/* Radius + fonts */
--radius: 0.625rem;
--font-sans: var(--font-plus-jakarta);
--font-mono: var(--font-jetbrains-mono);
```

## Status ↔ Column Mapping

### On drag (column → status, except Blocked which is preserved nowhere since user explicitly moved)
- Queue → Not Started
- Ready → Ready
- In Progress → In Progress
- Review → Review
- Done → Approved
- (Blocked status gets cleared on drag — "if it's moving, it's not blocked")

### On save (status → column, except Blocked which stays in current column)
- Not Started → Queue
- Ready → Ready
- In Progress → In Progress
- Review → Review
- Approved → Done
- Blocked → (no column change)

### DB trigger (defense-in-depth)
- `cards_auto_move_on_approved` — if status=Approved and column!=Done, flip column to Done
