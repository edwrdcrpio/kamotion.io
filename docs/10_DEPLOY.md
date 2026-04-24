---
Created: 2026-04-23
Status: Reference — first prod deploy completed 2026-04-23, guide is battle-tested against Dokploy 1.x + Nixpacks 1.41 + Node 22.14 + Next.js 16.2.4
Purpose: How to deploy Kamotion to Hostinger VPS via Dokploy (GitHub source + Nixpacks build)
---

# Kamotion — Deployment (Dokploy + Nixpacks)

> **Live**: https://kamotion.io (Let's Encrypt R12 cert, auto-renewing via Traefik; HTTP/2; HTTP→HTTPS 308 redirect; Next.js response cache active). First production deploy shipped 2026-04-23.


Kamotion deploys as a single Next.js application managed by [Dokploy](https://docs.dokploy.com/docs/core) on a Hostinger VPS. Dokploy handles GitHub auto-deploy, Traefik reverse proxying, Let's Encrypt SSL, and one-click rollback. Supabase remains the managed Postgres + Auth layer — nothing database-side is hosted on the VPS.

## Stack summary

| Layer | Where it lives |
|---|---|
| Next.js app (this repo) | Dokploy container on VPS, built by Nixpacks |
| Postgres + Auth + Storage | Supabase (managed, project `<your-project-ref>`) |
| AI calls (in-app path) | Provider API from inside the container (OpenRouter / OpenAI / Anthropic / Google) |
| AI calls (n8n path) | Wherever your n8n instance runs (Kamotion just POSTs to a webhook URL) |
| Reverse proxy + SSL | Traefik (bundled with Dokploy) |

## Prerequisites

- A Hostinger VPS with Dokploy installed (see [Dokploy Quick Start](https://docs.dokploy.com/docs/core/installation))
- DNS A record pointing your domain (e.g. `kamotion.io`) at the VPS IP
- GitHub repo connected to Dokploy (Dokploy → Settings → Git Providers)
- Supabase project already provisioned (migrations applied, admin user seeded)
- Provider API keys in hand (OpenRouter recommended — one key, many models)

## Build-time vs runtime environment variables

Nixpacks **bakes ENV values into the generated Dockerfile at build time**, which means:

- `NEXT_PUBLIC_*` vars MUST be available at build time — they're inlined into the client JS bundles. If you change them you must trigger a rebuild.
- Server-only vars (API keys, service role) are loaded at runtime — safe to change without a rebuild, container just needs a restart.

Dokploy's env-vars panel exposes both. Mark build-time vars accordingly if the panel supports the split; otherwise all vars are available to both phases.

### Required env vars

| Var | Phase | Value |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **build** | `https://<your-project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **build** | Supabase Dashboard → API Settings → `anon public` |
| `SUPABASE_SERVICE_ROLE_KEY` | runtime | Supabase Dashboard → API Settings → `service_role` (**secret**) |
| `AI_API_KEY_OPENROUTER` | runtime | OpenRouter account → Keys (**secret**). Name must match the "API key env var" set in `/app/settings`. |

### Optional env vars

| Var | Phase | Purpose |
|---|---|---|
| `AI_API_KEY_OPENAI` / `AI_API_KEY_ANTHROPIC` / `AI_API_KEY_GOOGLE` | runtime | If you switch provider in `/app/settings`, the env var name in that form must match one you've set here |
| `N8N_WEBHOOK_AUTH_USER` | runtime | Basic-auth username for n8n webhook (only applied when both user + password set) |
| `N8N_WEBHOOK_AUTH_PASSWORD` | runtime | Basic-auth password. **Avoid `$` characters** — Next's env loader expands `$VAR` references silently (see `07_LESSONS_LEARNED.md`) |
| `LOG_LEVEL` | runtime | `debug` / `info` / `warn` / `error` — defaults to `info` |

## Step 1 — Create the Dokploy Application

1. Dokploy Dashboard → **Projects** → new project (e.g. "kamotion").
2. Inside the project → **New Service** → **Application**.
3. **Source**: Git → connect the GitHub repo, branch `main`.
4. **Build Type**: **Nixpacks**. Dokploy will auto-detect Next.js and run `npm ci` → `npm run build` → `npm run start`.
5. Node version is already pinned via `engines.node: "22"` in `package.json` — Nixpacks respects this. (Override with `NIXPACKS_NODE_VERSION=22` env var if needed.)
6. Save. Don't deploy yet.

## Step 2 — Environment Variables

In the Application's **Environment** tab, paste the vars from the table above. Keep the `NEXT_PUBLIC_*` pair + the service role key at minimum.

For multiline values (e.g. if you ever paste a private key), wrap in double quotes per [Dokploy's env var docs](https://docs.dokploy.com/docs/core/applications).

## Step 3 — Domain + SSL

1. **Domains** tab → **Add Domain** → enter `kamotion.io` (and optionally `www.kamotion.io`).
2. Check **HTTPS** + select **Let's Encrypt** for the certificate provider.
3. Dokploy/Traefik will issue the cert on first request after DNS points at the VPS.
4. Free fallback: Dokploy offers `*.traefik.me` subdomains for quick testing before custom DNS.

## Step 4 — First Deploy

1. **General** tab → **Deploy**. Dokploy clones the repo and kicks off the Nixpacks build.
2. Watch the **Deployments** tab → **View Logs** stream. Build + deploy typically runs 2–5 minutes cold.
3. If the build fails, the error shows inline — the most common first-deploy failures are missing `NEXT_PUBLIC_*` vars (build-time) or a typo in the Supabase URL.

Once the deploy goes green, hit your domain. You should see the homepage (lowercase "kamotion" branding, teal primary, dark by default).

## Step 5 — Post-deploy smoke tests

Run through these in order — they're ordered so a failure points you at the layer that broke:

1. **Homepage loads**: `/` renders the Mixpanel-style landing page.
2. **Theme toggle**: click the sun/moon icon in the sticky nav — site switches light/dark.
3. **Login**: `/login` → sign in as the admin (`admin@example.com`) → redirects to `/app`.
4. **Board loads**: `/app` shows the kanban columns with seeded demo cards. (If the fetch fails → check `NEXT_PUBLIC_SUPABASE_*`.)
5. **Create card**: click **New Card** → fill → save. Card appears in Queue. (If PATCH fails → check Supabase RLS; admin user should pass.)
6. **Generate page**: `/app/generate` → paste a short task dump → parse runs, cards preview. (If 500 → check `AI_API_KEY_OPENROUTER` env var + the "API key env var" name in `/app/settings` matches.)
7. **Admin guards** (sign in as a non-admin user or visit with a cleared session): `/app/settings`, `/app/settings/users`, `/app/team` should 302 / 403.
8. **Archive + Gantt**: both pages load without errors.

## Rollback

Dokploy keeps the last 10 deployments. To roll back:

1. **Deployments** tab → find the previous green deploy.
2. **Redeploy** → Dokploy re-runs with the previous commit SHA baked in.

Rollback does not revert Supabase data. If a migration was applied, roll it back via Supabase SQL editor or a compensating migration before redeploying.

## Updating after the first deploy

- **Code push**: Dokploy auto-deploys on push to `main` (if webhook is set up, which is the default). Otherwise trigger a manual deploy.
- **Runtime env vars** (API keys, service role): edit → restart the container from the **General** tab. No rebuild needed.
- **Build-time env vars** (`NEXT_PUBLIC_*`): edit → **trigger a full rebuild**. The old bundle has the old values baked in.

## Production recommendation (future)

Dokploy's own docs recommend building via CI/CD and pushing to a registry rather than building on the VPS, to avoid resource exhaustion during builds. See [Going to Production](https://docs.dokploy.com/docs/core/applications/going-production).

For a solo workload Kamotion's build fits comfortably on a small VPS. When you start feeling pressure (build times creeping up, memory spikes), migrate to the GitHub Actions → GHCR → Dokploy auto-deploy-from-registry flow.

## Gotchas

- **Node version drift local vs prod**: the repo pins Node 22 via `engines.node` for Nixpacks compatibility (Nixpacks supports 16/18/20/22/23 — no 24 yet). Your local dev machine may run Node 24, which triggers an `EBADENGINE` warning on `npm install`. Harmless, but for strict dev/prod parity run `nvm use 22` locally.
- **`$` in the n8n basic auth password**: Next's env loader expands `$VAR` references even inside single-quoted `.env.local` values. Pick passwords without `$`. Caught in C.3.
- **Dockerfile secrets warnings**: when Nixpacks bakes env vars into its generated Dockerfile it emits `SecretsUsedInArgOrEnv` warnings. These are cosmetic — the final container image does not leak the values on disk — but you'll see them in build logs.
- **Next.js 16 standalone output**: not enabled in `next.config.ts`. We rely on `next start` which Nixpacks invokes directly. Only switch to `output: 'standalone'` if you move off Nixpacks.
- **Keep `SUPABASE_SERVICE_ROLE_KEY` locked to the admin API only**: grepping the codebase, it's only read by `lib/supabase/admin.ts` which is imported by `app/api/admin/users/**`. If you ever import it elsewhere, review carefully — the service-role key bypasses RLS.

## Key files

- `package.json` — `engines.node: "22"` for Nixpacks pinning
- `.env.local` (local only; gitignored) — local dev env
- `lib/supabase/server.ts` + `lib/supabase/admin.ts` — where Supabase envs are consumed
- `app/api/ai/parse/route.ts` — where the dynamic `process.env[apiKeyRef]` + n8n auth envs are read
