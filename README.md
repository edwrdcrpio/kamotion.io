# kamotion

> Paste the noise. Get the work.

Personal kanban + AI task extractor. Paste unstructured text — meeting transcripts, Slack dumps, email threads, raw notes — and AI extracts the actionable items into cards on a kanban board, with a Gantt view alongside.

Live at **[kamotion.io](https://kamotion.io)** · Invite-only · Built by Edward Carpio (Lumaki, LLC)

## Documentation

- **[Brand & product reference](docs/05_INFO_KAMOTION_BRAND.md)** — what kamotion is, how to talk about it, copy library
- **[Build plan](docs/01_PLAN_KAMOTION.md)** — milestones + current progress
- **[Stack reference](docs/05_INFO_STACK.md)** — tech, schema, env vars
- **[Lessons learned](docs/07_LESSONS_LEARNED.md)** — gotchas, policy decisions
- **[n8n setup](docs/09_N8N_SETUP.md)** — optional self-hosted AI path

## Stack

Next.js 16 (App Router + Turbopack) · TypeScript strict · Tailwind v4 + shadcn/ui · dnd-kit · TanStack Query v5 · React Hook Form + Zod · Supabase (Postgres + Auth + RLS) · Vercel AI SDK v6 → OpenRouter / Anthropic / OpenAI / Gemini

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Required env vars are listed in `docs/05_INFO_STACK.md`.

## License

TBD — open-sourcing once the product is proven.
