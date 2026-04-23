---
Created: 2026-04-23
Status: Active — drafting
Purpose: Canonical plan for F.4 (interactive in-app demo at /try) — survives /compact or /clear
Delete when: Phase A v2 is shipped and committed; archive into 01_PLAN_KAMOTION.md F.4 lessons
---

# F.4 — Interactive in-app demo (Phase A v2)

Replaces the F.3 "parallel demo app" approach with an in-app guided tour against the real components, backed by MSW-mocked API responses.

## Motivation

F.3 v1 (shipped earlier in this session) was a parallel UI at `/try` — separate board, separate drawer, separate card chip. User clarified they want the **real app** rendering unauthenticated, with seeded state and guided nudges so visitors experience the actual product surface, not a stripped-down facsimile. This doc plans the rebuild.

## Scope

**In**: Visitor hits `/try` → lands on real Board UI (with real AppShell chrome, sidebar, header) → guided 7-step tour → fully interactive kanban + Generate + Gantt + Team + Archive.

**Out (stub only)**: `/try/settings` and `/try/settings/users` show a locked panel ("Admin features — log in to explore") because they're maintainer-facing and not part of the discovery funnel.

**Scope table**:

| Route | Status | Behavior |
|---|---|---|
| `/try` (board) | Full | Starts empty with "Generate your first task" CTA; populates after tour step 5 |
| `/try/generate` | Full | Shows 3 pre-filled source options instead of textarea; returns pre-generated cards |
| `/try/gantt` | Full | Live against whatever cards are in local state |
| `/try/team` | Full | Seeded with `DEMO_TEAM` (9 members); fully CRUD |
| `/try/archive` | Full | Soft-delete flow works; restore + permanent delete hit MSW |
| `/try/settings` | Stub | Locked panel with "Log in to configure AI" |
| `/try/settings/users` | Stub | Locked panel — admin surface |

## Architecture decisions

### 1. MSW (Mock Service Worker) for API mocking
- Install `msw` as a prod dep (it's lazy-loaded; only visitors who hit `/try` pay the ~150 KB cost)
- Run `npx msw init public/ --save` to generate `public/mockServiceWorker.js`
- `lib/demo/msw-handlers.ts` — handlers for every `/api/*` the demo routes exercise
- `lib/demo/state.ts` — module-level mutable state singleton (cards, team, settings) shared across handlers
- `lib/demo/msw-client.tsx` — client-side `setupWorker()` registration, only runs on `/try/*` pages
- **Why MSW and not a context/adapter refactor**: MSW is invisible to the app. The existing `Board`, `Gantt`, `Team` etc components make `fetch("/api/cards")` calls — MSW intercepts them. Zero refactor to the app proper. Alternative paths would require touching every `useQuery` call in the codebase.

### 2. Auth bypass via proxy.ts whitelist
- `proxy.ts` currently redirects `/app/**` → `/login` when no session
- `/try/**` is a *different* route tree (not under `/app`), so middleware doesn't redirect it by default
- We will duplicate the `/app` page.tsx files under `/try/` as thin `"use client"` wrappers that import the same components. No middleware change actually needed.
- `AppShell` component needs to accept an optional `profile` prop instead of always computing from session. We'll synthesize a fake "Demo User" profile in the DemoProvider.

### 3. Route tree duplication (parallel `/try/*` tree)
```
app/
  app/              # existing auth-gated app (unchanged)
  try/              # new, public, demo mode
    layout.tsx      # <DemoProvider><MswBootstrap><AppShell>...
    page.tsx        # <Board />
    generate/
      page.tsx      # <Generate demoMode /> or demo-aware variant
    gantt/
      page.tsx      # <Gantt />
    team/
      page.tsx      # <Team />
    archive/
      page.tsx      # <Archive />
    settings/
      page.tsx      # <LockedPanel />
      users/
        page.tsx    # <LockedPanel />
```

Each `app/try/**/page.tsx` is 3–10 lines: a client wrapper that renders the existing component.

### 4. `DemoProvider` + tour state
- React context at `app/try/layout.tsx` scope
- Manages: current tour step, completion, user-dismissed-tour flag
- `components/demo/tour.tsx` — react-joyride wrapper with 7 steps
- Steps target elements by DOM ID or data-attribute (`data-tour="generate-link"`)

### 5. react-joyride for the hard tour
- Install: `react-joyride` (MIT licensed, actively maintained)
- Config: `continuous={true}`, `showProgress={true}`, `showSkipButton={true}`, `hideCloseButton={false}`
- Custom styling to match kamotion palette (teal accents, neutral chrome)
- Spotlight blocks clicks outside current step (the "hard" gate you asked for)
- Step advance triggered by user actions (click Generate link → step advances; not by tour's own button when action-required)

### 6. Sidebar adaptation
- In demo mode, sidebar links point at `/try/*` instead of `/app/*`
- "Generate Task(s)" link gets `data-tour="generate-link"` for joyride targeting
- Demo-mode detection: either a prop passed through `AppShell` or a context check
- Admin items ("Users", "Settings") show a lock icon in demo mode

### 7. Drag-and-drop hint dialog (your new addition)
- After tour step 5 (cards added to board), show a secondary modal
- Content: short copy + CSS-animated demo showing a card moving from Ready → In Progress
- Dismissible; does not count as a tour step
- Lives in `components/demo/drag-hint-dialog.tsx`

### 8. State lifecycle
- In-memory only via `lib/demo/state.ts`
- Refresh page = state wipes (module is re-evaluated on hard reload)
- No localStorage — consistent with user's earlier "wipe on visit" preference
- Tour completion flag is per-session (same — wipes on refresh, so returning visitors see the tour again)

## File deletion plan (kicks off Batch 1)

**Delete** (from F.3 v1):
- `components/demo/demo-experience.tsx`
- `components/demo/demo-picker.tsx`
- `components/demo/demo-board.tsx`
- `components/demo/demo-card.tsx`
- `components/demo/demo-drawer.tsx`
- `components/demo/demo-types.ts`

**Keep** (from F.3 v1):
- `config/demo-examples.ts` — data is fully reusable (3 examples, DEMO_TEAM roster, date helpers)
- `components/demo/demo-banner.tsx` — reusable in v2

**Revert**:
- `app/try/page.tsx` → will be rewritten as thin wrapper

## Implementation batches

Each batch is independently runnable + verifiable. Commit after each (or at natural stopping points).

### Batch 1 — Cleanup + dependencies + MSW scaffolding
1. Delete old demo components (list above)
2. Revert `app/try/page.tsx` to empty scaffold
3. `npm install msw react-joyride`
4. `npx msw init public/ --save` — generates `public/mockServiceWorker.js`
5. Create `lib/demo/state.ts` — mutable module-level singleton for cards, team, settings
6. Create `lib/demo/msw-handlers.ts` — start with GET /api/cards, POST /api/cards
7. Create `lib/demo/msw-client.tsx` — `<MswBootstrap>` component that registers worker on mount
8. `npm run build` clean check

### Batch 2 — Route tree + DemoProvider + auth bypass verification
1. Create `components/demo/demo-provider.tsx` — context with tour step, profile, helpers
2. Create `app/try/layout.tsx` — wraps children in `<MswBootstrap>` + `<DemoProvider>` + `<AppShell>`
3. Create `app/try/page.tsx` as `"use client"` → `<Board />`
4. Create `app/try/generate/page.tsx`, `app/try/gantt/page.tsx`, `app/try/team/page.tsx`, `app/try/archive/page.tsx`
5. Create `app/try/settings/page.tsx`, `app/try/settings/users/page.tsx` as `<LockedPanel>`
6. Verify all routes render without auth error
7. `npm run build` clean

### Batch 3 — Full MSW handler set
1. Cards: GET/POST/PATCH/DELETE `/api/cards` + `/api/cards/[id]` + `/api/cards/bulk`
2. Team: GET/POST/PATCH/DELETE `/api/team` + `/api/team/[id]`
3. Settings: GET/PATCH `/api/settings` (returns canned config)
4. AI parse: POST `/api/ai/parse` — returns cards from currently-selected demo example
5. Archive: handled by PATCH /api/cards/[id] with `archived_at` (existing pattern)
6. Verify each route renders with data via browser

### Batch 4 — AppShell adaptation
1. `AppShell` accepts `demoMode?: boolean` + `profile?: Profile` props
2. When `demoMode`: sidebar links use `/try/*` prefixes
3. "Generate Task(s)" sidebar link gets `data-tour="generate-link"`
4. Users + Settings sidebar items show lock icon in demo mode
5. Header shows "Demo · Sarah Chen" (or similar) instead of real user
6. Logout button hidden in demo mode; "Exit demo" link to `/` shown instead

### Batch 5 — Generate page demo adaptation
1. `Generate` component or wrapper checks `demoMode` from context
2. When demo: replace textarea with 3-card picker (reuse `DEMO_EXAMPLES` data)
3. "Extract cards" button: no-op or dispatches to MSW `/api/ai/parse`
4. Preview dialog: existing component, pre-populated via MSW response
5. "Add to Queue" / "Add to board" button gets `data-tour="add-to-queue"`
6. After add → cards persist to `demoState.cards` → navigate back to `/try`

### Batch 6 — react-joyride tour
1. Install + configure joyride styles
2. Create `components/demo/tour.tsx` with 7-step config
3. Tour steps:
   1. Welcome → highlight sidebar "Generate Task(s)" (on /try board)
   2. Intro page → highlight picker cards (on /try/generate)
   3. After pick → highlight "Extract cards" button
   4. After extract → highlight "Add to Queue" button (in preview dialog)
   5. After add → highlight the board columns ("Drag cards between columns")
   6. Prompt click on a card → highlight drawer edit fields
   7. Completion message
4. Step advance is action-gated where appropriate (clicking the highlighted element advances)
5. Tour can be skipped; skipped state preserved for session

### Batch 7 — Drag-and-drop hint dialog
1. `components/demo/drag-hint-dialog.tsx` — standalone modal shown after tour step 5
2. Content: CSS-animated card moving Ready → In Progress (uses existing kanban visuals)
3. Dismissible via X or "Got it" button
4. Shown once per session; dismissal stored in DemoProvider state

### Batch 8 — Polish + verification
1. Banner update: "Demo mode · nothing saves · [Exit demo] · [Request access]"
2. Dark + light mode verified on all demo routes
3. Mobile: sidebar drawer works in demo mode; tour steps responsive
4. `npx tsc --noEmit` clean
5. `npm run build` clean
6. Dev server manual smoke: complete full tour flow end-to-end
7. Update homepage + docs + footer "Try it" links (already done in v1, just re-verify)
8. Archive this plan file → copy learnings into `docs/01_PLAN_KAMOTION.md` as F.4 entry
9. Delete `docs/_F4_INTERACTIVE_DEMO_PLAN.md`

## Known risks / gotchas

- **SSR + MSW**: MSW browser mode only intercepts fetches from the browser. Our `/try` pages must be client-rendered (no server data-fetching). All existing `Board`/`Gantt`/`Team` components already use TanStack Query client-side, so this is natural.
- **Service worker registration timing**: `MswBootstrap` must register the worker BEFORE any child component fires a fetch. Use a `ready` state that gates children.
- **Next 16 Turbopack + MSW**: some versions of MSW have issues with Turbopack's bundler. If we hit this, fallback is to pin MSW to a compatible version (check their Next.js 15/16 compat matrix before install).
- **react-joyride in React 19**: joyride v2 supports React 18+; verify compatibility. If issues, the fallback is `driver.js` (vanilla, simpler) or a custom spotlight component (~100 LOC).
- **AppShell coupling**: if AppShell tightly couples to Supabase session via a server component, we may need to split it into `<AppShellPresentational>` (pure UI, takes profile prop) + `<AppShellServer>` (fetches session, passes to presentational). Check at Batch 4 time.
- **Tour step 4 targeting**: the "Add to Queue" button is inside a dialog rendered to a portal. Joyride handles portals but targeting needs a stable `data-tour` attribute on the dialog content.
- **Turbopack + dev server**: every config change forces a rebuild. Batch 1 MSW worker file might need a dev-server restart to register.

## State model sketch (lib/demo/state.ts)

```ts
import { DEMO_TEAM, DEMO_EXAMPLES } from "@/config/demo-examples";
import type { Card, TeamMember, Settings } from "@/lib/validators";

type DemoState = {
  cards: Card[];
  team: TeamMember[];
  settings: Settings;
  selectedExampleId: "email" | "text" | "transcript" | null;
  tourCompleted: boolean;
};

export const demoState: DemoState = {
  cards: [],
  team: DEMO_TEAM.map((m, i) => ({
    id: `demo-tm-${i}`,
    name: m.name,
    email: m.email,
    role: "member",
    active: true,
    user_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })),
  settings: {
    aiProvider: "openrouter",
    aiModel: "anthropic/claude-sonnet-4-5",
    aiApiKeyRef: "AI_API_KEY_OPENROUTER",
    systemPrompt: "…",
    processingPath: "in-app",
    n8nWebhookUrl: "",
  },
  selectedExampleId: null,
  tourCompleted: false,
};

// Mutation helpers called by MSW handlers
export function addCards(newCards: Card[]): void { demoState.cards.push(...newCards); }
export function updateCard(id: string, patch: Partial<Card>): Card | null { /* … */ }
export function deleteCard(id: string): boolean { /* … */ }
// etc.
```

## Tour step content (Batch 6 draft copy)

1. **Welcome** — *"Welcome to kamotion. This is a live demo — you're looking at the real app. Let's create your first cards."* → CTA: "Let's go"
2. **Sidebar** — *"Click **Generate Task(s)** to paste unstructured text and let AI extract structured cards."* (highlight + pulse on sidebar link)
3. **Picker** — *"Pick an example source. Each one is curated to show how kamotion parses different kinds of input."* (highlight 3 picker cards)
4. **Extract** — *"Now click **Extract cards** to see what the AI found."* (highlight extract button)
5. **Preview** — *"Review the cards. Tweak titles, priorities, assignees. Then click **Add to board**."* (highlight Add to board button)
6. **Board** — *"Your board. Drag cards between columns to update their status. Click a card to edit every field."* (highlight board columns + animated drag hint)
7. **Done** — *"You've got it. Explore **Gantt** for the timeline view, **Team** to manage assignees, or just drag cards around. Nothing saves — refresh to reset."*

## Checklist (tick as we go)

- [x] Plan file reviewed and approved by user
- [x] Batch 1 — cleanup + deps + MSW scaffolding
- [x] Batch 2 — route tree + provider + auth bypass
- [x] Batch 3 — full MSW handlers
- [x] Batch 4 — AppShell demo-mode adaptation
- [x] Batch 5 — Generate demo adaptation
- [x] Batch 6 — react-joyride tour
- [x] Batch 7 — drag-hint dialog
- [ ] Batch 8 — polish + verify
- [ ] Update `01_PLAN_KAMOTION.md` with F.4 entry + lessons
- [ ] Delete this plan file

## Context recovery

If context is cleared mid-build, recovery steps:
1. `Read` this file to re-establish scope + architecture
2. Check the checklist above for progress
3. Run `git status` + `git log --oneline -10` to see what batches were committed
4. Resume from the first unchecked batch

## Notes for future me

- The core data in `config/demo-examples.ts` is the irreplaceable asset. Never break it.
- F.3 v1 (parallel UI) is preserved in git history if we need to consult the old DnD patterns.
- Tour copy is first-draft — tune during Batch 6 when we can see it in context.
