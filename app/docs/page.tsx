import type { Metadata } from "next";
import {
  DocSection,
  DocH3,
  DocP,
  DocStrong,
  DocLink,
  DocList,
  DocCode,
  DocInlineCode,
  DocCallout,
  DocFigure,
  DocTable,
  DocCardLink,
} from "@/components/docs/primitives";
import {
  GenerateMock,
  BoardMock,
  GanttMock,
  TeamMock,
  FlowMock,
} from "@/components/docs/mocks";

export const metadata: Metadata = {
  title: "Docs · kamotion",
  description:
    "How kamotion works, how to self-host it for free, and how to contribute. Open-source kanban that turns unstructured text into cards.",
};

export default function DocsPage() {
  return (
    <>
      <header className="border-b border-border/60 pb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
          Documentation
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Everything you need to run kamotion
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Paste the noise. Get the work. This guide covers the product, the
          self-hosting paths (including a <DocStrong>$0 setup</DocStrong>), and
          how to make it your own.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <DocCardLink
            href="#getting-started"
            title="Getting started"
            description="Clone, configure Supabase, and run it locally in under 10 minutes."
          />
          <DocCardLink
            href="#free-self-host"
            title="Run it for $0"
            description="Free-tier recipe with Supabase, Vercel, and local AI via Ollama."
          />
        </div>
      </header>

      {/* INTRODUCTION */}
      <DocSection id="introduction" eyebrow="01" title="Introduction">
        <DocP>
          <DocStrong>kamotion</DocStrong> is a personal kanban-style project
          manager that turns unstructured input — Slack threads, email chains,
          Zoom transcripts, meeting notes — into structured cards on a board.
          It&rsquo;s built for people drowning in channels who need one place
          for the work to live.
        </DocP>
        <FlowMock />
        <DocP>
          The app is open source and designed to be self-hosted. You bring your
          own AI key (OpenRouter, OpenAI, Anthropic, Google, or a local model
          via Ollama), wire up a Supabase project for data + auth, and it runs
          anywhere Node.js runs.
        </DocP>
        <DocH3>Who it&rsquo;s for</DocH3>
        <DocList
          items={[
            <><DocStrong>Solo operators</DocStrong> — freelancers, founders, and makers who need a single pane for a noisy inbox.</>,
            <><DocStrong>Small teams</DocStrong> — up to a handful of members with admin/member/viewer roles.</>,
            <><DocStrong>Developers</DocStrong> — anyone who wants a hackable PM tool they control end-to-end.</>,
          ]}
        />
        <DocCallout tone="info" title="Invite-only by design">
          kamotion has no public signup. Admins provision users. You&rsquo;re
          not building a SaaS with strangers signing up — you&rsquo;re running a
          tool for a known group. That&rsquo;s intentional and it simplifies a
          lot of things (billing, abuse, moderation) out of existence.
        </DocCallout>
      </DocSection>

      {/* CORE CONCEPTS */}
      <DocSection id="concepts" eyebrow="02" title="Core concepts">
        <DocP>
          Six primitives make up the whole app. Learn these and the rest is
          configuration.
        </DocP>
        <DocTable
          headers={["Concept", "What it is"]}
          rows={[
            [
              <DocStrong>Card</DocStrong>,
              "A single unit of work. Has title, description, status, priority, estimated duration, due date, assignee, and requester.",
            ],
            [
              <DocStrong>Column / status</DocStrong>,
              <>Five statuses: <DocInlineCode>Ready</DocInlineCode>, <DocInlineCode>In Progress</DocInlineCode>, <DocInlineCode>Review</DocInlineCode>, <DocInlineCode>Done</DocInlineCode>, <DocInlineCode>Blocked</DocInlineCode>. Blocked is hidden from the main board and surfaced via the filter.</>,
            ],
            [
              <DocStrong>Priority</DocStrong>,
              <>High (red triangle), Normal (green circle), Low (yellow inverted triangle). A card can also carry a <DocInlineCode>blocked</DocInlineCode> flag independent of its column.</>,
            ],
            [
              <DocStrong>Duration</DocStrong>,
              <>Estimated time-to-complete. Slider goes from 30m → 72h → 14d. Used by Gantt to size bars.</>,
            ],
            [
              <DocStrong>Team member vs user</DocStrong>,
              <>Separate concepts. <DocInlineCode>team_members</DocInlineCode> are people you assign work to (can be anyone). <DocInlineCode>users</DocInlineCode> are people who can log in. Admin can create a user and kamotion auto-links the matching team member.</>,
            ],
            [
              <DocStrong>Archive</DocStrong>,
              "Soft delete. Archived cards land in /app/archive, restorable for 30 days, then auto-purged by a daily pg_cron job.",
            ],
          ]}
        />
        <DocH3>Roles</DocH3>
        <DocList
          items={[
            <><DocStrong>admin</DocStrong> — everything, including user and team management, AI settings, and archive admin.</>,
            <><DocStrong>member</DocStrong> — read/write cards, drive the board and Gantt.</>,
            <><DocStrong>viewer</DocStrong> — read-only. Useful for stakeholders.</>,
          ]}
        />
      </DocSection>

      {/* GETTING STARTED */}
      <DocSection id="getting-started" eyebrow="03" title="Getting started">
        <DocP>
          You&rsquo;ll have a working local instance in about 10 minutes. The
          only external dependency is a free Supabase project.
        </DocP>

        <DocH3>Prerequisites</DocH3>
        <DocList
          items={[
            <><DocStrong>Node.js 22</DocStrong> (active LTS). Use <DocInlineCode>nvm use 22</DocInlineCode> if you have nvm.</>,
            <><DocStrong>npm</DocStrong> (ships with Node).</>,
            <><DocStrong>A Supabase account</DocStrong> — free tier works. <DocLink href="https://supabase.com">Sign up here</DocLink>.</>,
            <><DocStrong>An AI key</DocStrong> — OpenRouter is the default and gives you access to dozens of models with one key. See <DocLink href="#ai-config">AI configuration</DocLink>.</>,
          ]}
        />

        <DocH3>1. Clone and install</DocH3>
        <DocCode lang="bash">{`git clone <kamotion-repo-url>
cd kamotion.io
npm install`}</DocCode>

        <DocH3>2. Create a Supabase project</DocH3>
        <DocList
          ordered
          items={[
            <>Go to <DocLink href="https://supabase.com/dashboard">supabase.com/dashboard</DocLink> and create a new project. Pick a region close to you.</>,
            <>In <DocInlineCode>Project Settings → API</DocInlineCode>, copy your <DocInlineCode>URL</DocInlineCode>, <DocInlineCode>anon / public key</DocInlineCode>, and <DocInlineCode>service_role secret</DocInlineCode>.</>,
            <>In <DocInlineCode>SQL Editor</DocInlineCode>, run each file in <DocInlineCode>supabase/migrations/</DocInlineCode> in order (01 through 09).</>,
          ]}
        />
        <DocCallout tone="tip" title="Why the service role key?">
          You only need <DocInlineCode>SUPABASE_SERVICE_ROLE_KEY</DocInlineCode> if
          you want to use the admin Users page to create/edit/delete accounts
          via the UI. Without it, you can still provision users directly in the
          Supabase dashboard.
        </DocCallout>

        <DocH3>3. Configure environment variables</DocH3>
        <DocP>
          Create <DocInlineCode>.env.local</DocInlineCode> in the repo root:
        </DocP>
        <DocCode lang=".env.local">{`NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>  # optional

NEXT_PUBLIC_APP_URL=http://localhost:3000
LOG_LEVEL=debug

AI_API_KEY_OPENROUTER=sk-or-v1-...
# Or any of:
# AI_API_KEY_OPENAI=sk-...
# AI_API_KEY_ANTHROPIC=sk-ant-...
# AI_API_KEY_GOOGLE=...

# Optional — only needed if you use the n8n processing path
N8N_WEBHOOK_AUTH_USER=
N8N_WEBHOOK_AUTH_PASSWORD=`}</DocCode>
        <DocCallout tone="warn" title="Avoid $ in passwords">
          Next.js&rsquo;s <DocInlineCode>.env.local</DocInlineCode> loader expands
          <DocInlineCode>$VAR</DocInlineCode> references <DocStrong>even inside
          single quotes</DocStrong>. A password like <DocInlineCode>p$word</DocInlineCode>
          silently loses characters. Pick passwords without <DocInlineCode>$</DocInlineCode>.
        </DocCallout>

        <DocH3>4. Seed your admin user</DocH3>
        <DocList
          ordered
          items={[
            <>In Supabase <DocInlineCode>Authentication → Users → Add user</DocInlineCode>, create a user with your email + password. Check <DocStrong>auto-confirm user</DocStrong>.</>,
            <>In <DocInlineCode>SQL Editor</DocInlineCode>, insert a profile row with <DocInlineCode>role=&apos;admin&apos;</DocInlineCode> for that user:</>,
          ]}
        />
        <DocCode lang="sql">{`insert into public.profiles (id, email, full_name, role, status)
values (
  '<auth-user-id>',
  'you@example.com',
  'Your Name',
  'admin',
  'active'
);`}</DocCode>

        <DocH3>5. Run it</DocH3>
        <DocCode lang="bash">{`npm run dev`}</DocCode>
        <DocP>
          Open <DocInlineCode>http://localhost:3000</DocInlineCode>, click
          <DocStrong> Log in</DocStrong>, use the credentials from step 4. You
          land on <DocInlineCode>/app</DocInlineCode> with a kanban board and a
          few seeded demo cards.
        </DocP>
        <DocFigure
          label="First-run board with demo cards"
          route="/app"
          theme="both"
          capture="Freshly-seeded board after first login — 4 demo cards distributed across Ready, In Progress, Review, Done columns. Sidebar visible with admin nav items."
          notes="Capture at 1440px width. Both themes — swap the toggle before each capture. Crop to include the header bar."
        />
      </DocSection>

      {/* GENERATE */}
      <DocSection id="generate" eyebrow="04" title="Generate tasks from text">
        <DocP>
          The feature that gives kamotion its name. Paste any text — a Slack
          thread, an email, a meeting transcript — and the AI extracts cards.
        </DocP>
        <DocCallout tone="tip" title="Try it without installing anything">
          We made an interactive demo with 3 hand-crafted examples (email,
          text, and Zoom transcript). No account, no AI call — just the full
          flow in your browser. <DocLink href="/try">Open the demo →</DocLink>
        </DocCallout>
        <DocFigure
          label="Generate page — inline mock"
          theme="both"
          capture="(optional) real screenshot of /app/generate with text pasted in and parsed-card preview modal open"
        >
          <GenerateMock />
        </DocFigure>
        <DocH3>How to use it</DocH3>
        <DocList
          ordered
          items={[
            <>Go to <DocInlineCode>/app/generate</DocInlineCode> via <DocStrong>Generate Task(s)</DocStrong> in the sidebar.</>,
            <>Paste raw text in the textarea.</>,
            <>Click <DocStrong>Generate</DocStrong>. The AI returns a list of suggested cards in a preview modal.</>,
            <>Review each suggestion. Uncheck any you don&rsquo;t want. You can edit titles, priorities, due dates, and assignees inline.</>,
            <>Click <DocStrong>Add to board</DocStrong>. Cards land in the <DocInlineCode>Ready</DocInlineCode> column.</>,
          ]}
        />
        <DocFigure
          label="Preview modal — parsed cards with checkboxes"
          route="/app/generate"
          theme="both"
          capture="Preview dialog after clicking Generate. Show 3–4 parsed cards with different priorities (at least one high, one normal, one low), one with a due date. A couple checked, one unchecked."
          notes="Paste a Slack-style multi-task blurb to produce realistic output. Keep the modal centered in frame."
        />
        <DocCallout tone="tip" title="What makes a good input">
          Dense, action-heavy text parses best. Meeting notes with &ldquo;next
          steps&rdquo;, Slack threads with explicit asks, emails with bulleted
          to-dos. Vague ramble works less well — garbage in, garbage out.
        </DocCallout>
      </DocSection>

      {/* BOARD */}
      <DocSection id="board" eyebrow="05" title="Board">
        <DocP>
          The kanban is where the work lives. Five statuses, drag and drop,
          per-card detail drawer, filter bar.
        </DocP>
        <DocFigure
          label="Board overview — inline mock"
          theme="both"
          capture="(optional) real screenshot of /app with 2–3 cards per column"
        >
          <BoardMock />
        </DocFigure>

        <DocH3>Creating cards</DocH3>
        <DocList
          items={[
            <>Click <DocStrong>+ New card</DocStrong> in any column header → fill the dialog → save. The card lands in that column.</>,
            <>Or go to <DocLink href="#generate">Generate tasks</DocLink> for bulk AI extraction.</>,
          ]}
        />

        <DocH3>Moving cards</DocH3>
        <DocList
          items={[
            <>Drag across columns to change status. <DocInlineCode>Blocked</DocInlineCode> is excluded from drag targets — use the drawer to set it.</>,
            <>Drag within a column to reorder. Positions use midpoint math so you can insert anywhere without rewriting every row.</>,
            <>At desktop width (<DocInlineCode>lg+</DocInlineCode>), click the collapse chevron on a column header to collapse it into a 56px ribbon. Drop targets still work on collapsed columns.</>,
          ]}
        />

        <DocH3>Editing</DocH3>
        <DocList
          items={[
            <>Click any card → side drawer opens with every field editable.</>,
            <><DocInlineCode>Cmd/Ctrl+S</DocInlineCode> saves. Closing with unsaved changes prompts a confirm.</>,
            <>Changing <DocInlineCode>status</DocInlineCode> in the drawer auto-moves the card to the matching column on save.</>,
          ]}
        />
        <DocFigure
          label="Card detail drawer with all fields"
          route="/app (drawer open)"
          theme="both"
          capture="Click a card to open the side drawer. Show a card that has every field populated — title, description (2–3 lines), status, priority, duration, due date, assignee, requester. The Archive and Delete buttons visible at the bottom."
          notes="On desktop the drawer is ~608px wide and slides from the right. Keep the board visible behind it for context."
        />

        <DocH3>Filtering</DocH3>
        <DocP>
          The filter bar above the board lets you scope by search term,
          assignee, and a combined priority + blocked-flag dropdown. Filters
          are session-only and clear on reload.
        </DocP>
      </DocSection>

      {/* GANTT */}
      <DocSection id="gantt" eyebrow="06" title="Gantt">
        <DocP>
          Same data, different lens. Gantt shows scheduled cards as bars
          positioned by <DocInlineCode>due_date</DocInlineCode> and sized by
          <DocInlineCode>estimated_duration</DocInlineCode>.
        </DocP>
        <DocFigure
          label="Gantt chart — inline mock"
          theme="both"
          capture="(optional) real screenshot of /app/gantt with 4–6 scheduled cards spanning ~2 weeks"
        >
          <GanttMock />
        </DocFigure>

        <DocH3>Interactions</DocH3>
        <DocList
          items={[
            <><DocStrong>Drag a bar</DocStrong> left or right to shift the card&rsquo;s due date. Duration is preserved.</>,
            <><DocStrong>Click a bar</DocStrong> (or the label on the left) to open the card drawer.</>,
            <><DocStrong>Today line</DocStrong> is a vertical marker so you can see what&rsquo;s late.</>,
            <><DocStrong>Weekend tint</DocStrong> on Sat/Sun columns — a visual cue, not a constraint.</>,
            <><DocStrong>Unscheduled cards</DocStrong> (no due date) are listed below the chart as clickable chips. Open one and set a date to pull it into the Gantt.</>,
          ]}
        />
        <DocFigure
          label="Gantt — full view with today line"
          route="/app/gantt"
          theme="both"
          capture="Scheduled cards spanning roughly 2 weeks. Today line visible somewhere in the middle. At least one late card (bar ends before today line). Weekend tint visible. Unscheduled chips row at the bottom with 2–3 entries."
          notes="Capture after setting demo card due_dates so the chart is populated. 1440px width."
        />
      </DocSection>

      {/* TEAM */}
      <DocSection id="team" eyebrow="07" title="Team">
        <DocP>
          <DocInlineCode>/app/team</DocInlineCode> is admin-only CRUD for the{" "}
          <DocInlineCode>team_members</DocInlineCode> table. Think of team
          members as the roster of people you can assign work to — they don&rsquo;t
          need to have login access to kamotion.
        </DocP>
        <DocFigure
          label="Team table — inline mock"
          theme="both"
          capture="(optional) real screenshot of /app/team with 3–5 rows"
        >
          <TeamMock />
        </DocFigure>
        <DocList
          items={[
            <>Click <DocStrong>+ Add member</DocStrong> → fill name/email/role → save.</>,
            <>Toggle the <DocStrong>active</DocStrong> switch to hide a member from assignee pickers without deleting them.</>,
            <>The <DocStrong>Link2</DocStrong> icon next to a row means that member is tied to a kamotion user account (created via the Users page). Name and email lock when editing a linked row — edit those on the Users page instead.</>,
          ]}
        />
      </DocSection>

      {/* USERS */}
      <DocSection id="users" eyebrow="08" title="Users (admin)">
        <DocP>
          <DocInlineCode>/app/settings/users</DocInlineCode> is admin-only CRUD
          for login accounts. It uses the Supabase Admin API, which requires{" "}
          <DocInlineCode>SUPABASE_SERVICE_ROLE_KEY</DocInlineCode> in your env.
        </DocP>
        <DocCallout tone="info" title="No service role key = no Users page">
          If <DocInlineCode>SUPABASE_SERVICE_ROLE_KEY</DocInlineCode> is missing,
          the page renders an amber banner explaining it&rsquo;s disabled. You
          can still manage users directly in the Supabase dashboard.
        </DocCallout>
        <DocH3>What you can do</DocH3>
        <DocList
          items={[
            <><DocStrong>Create</DocStrong> — email, password, role, status. kamotion auto-creates a linked team_member row so the new user is immediately assignable.</>,
            <><DocStrong>Edit</DocStrong> — name, role, status. Name changes mirror to the linked team_member.</>,
            <><DocStrong>Password reset</DocStrong> — set a new password for the user directly.</>,
            <><DocStrong>Delete</DocStrong> — removes the auth user; the linked team_member stays (with <DocInlineCode>user_id</DocInlineCode> nulled out) so historical assignments remain intact.</>,
          ]}
        />
        <DocCallout tone="warn" title="You can&rsquo;t demote yourself">
          Self-protection is enforced: you can&rsquo;t demote your own role,
          disable your own account, or delete yourself. The role and status
          fields are locked when editing your own row. If you&rsquo;re the only
          admin and you lock yourself out, you&rsquo;ll need to fix it in the
          Supabase dashboard.
        </DocCallout>
        <DocFigure
          label="Users page with service role key present"
          route="/app/settings/users"
          theme="both"
          capture="The users table showing 2–3 rows including your own (with a 'you' badge). One row should be a non-admin member for variety. Show the + Add user button."
          notes="If the banner is showing, SUPABASE_SERVICE_ROLE_KEY is missing — fix the env var before capturing the happy path."
        />
      </DocSection>

      {/* ARCHIVE */}
      <DocSection id="archive" eyebrow="09" title="Archive">
        <DocP>
          Deleting a card doesn&rsquo;t erase it immediately. Cards go to{" "}
          <DocInlineCode>/app/archive</DocInlineCode> (admin-only) as a soft
          delete. You have 30 days to restore, then a daily{" "}
          <DocInlineCode>pg_cron</DocInlineCode> job purges them.
        </DocP>
        <DocList
          items={[
            <><DocStrong>Restore</DocStrong> — puts the card back in the column its status points to.</>,
            <><DocStrong>Delete permanently</DocStrong> — bypasses the 30-day window for cards you know you&rsquo;ll never need.</>,
          ]}
        />
        <DocFigure
          label="Archive table with restore actions"
          route="/app/archive"
          theme="both"
          capture="Archive table with 2–3 archived cards. Show the Restore and Delete permanently buttons on each row."
          notes="Archive a couple of cards from the board before capturing."
        />
      </DocSection>

      {/* AI CONFIG */}
      <DocSection id="ai-config" eyebrow="10" title="AI configuration">
        <DocP>
          All AI behavior is configured at{" "}
          <DocInlineCode>/app/settings</DocInlineCode> (admin-only). Two paths
          are supported:
        </DocP>
        <DocTable
          headers={["Path", "When to use it"]}
          rows={[
            [
              <DocStrong>In-app</DocStrong>,
              "kamotion calls the AI provider directly. Fastest to set up. Supports OpenRouter, OpenAI, Anthropic, and Google.",
            ],
            [
              <DocStrong>n8n webhook</DocStrong>,
              <>kamotion POSTs to your n8n workflow. n8n handles the AI call. Use this when you want to swap models without redeploying, add pre/post-processing (enrichment, routing), or centralize AI logic. See <DocLink href="#n8n-path">n8n path</DocLink>.</>,
            ],
          ]}
        />

        <DocH3>In-app path setup</DocH3>
        <DocList
          ordered
          items={[
            <>Add your provider key to <DocInlineCode>.env.local</DocInlineCode> (<DocInlineCode>AI_API_KEY_OPENROUTER</DocInlineCode>, etc).</>,
            <>Go to <DocInlineCode>/app/settings</DocInlineCode>.</>,
            <>Pick a <DocStrong>provider</DocStrong>. Each provider has a curated model dropdown plus a <DocInlineCode>Custom...</DocInlineCode> option for any model slug.</>,
            <>Optionally tune the system prompt and JSON schema. Defaults are production-ready.</>,
            <>Hit <DocStrong>Test parse</DocStrong> at the bottom of the page to validate end-to-end with a sample input.</>,
          ]}
        />
        <DocCallout tone="tip" title="Recommended default">
          OpenRouter with <DocInlineCode>anthropic/claude-sonnet-4-5</DocInlineCode> or{" "}
          <DocInlineCode>openai/gpt-4.1-mini</DocInlineCode>. OpenRouter gets
          you every major model with one key and one account.
        </DocCallout>
        <DocFigure
          label="Settings page — AI config + test parse"
          route="/app/settings"
          theme="both"
          capture="Full Settings page showing: processing path = in-app (radio), provider = OpenRouter, model dropdown with a model selected, system prompt visible, and the Test parse section at the bottom with a sample input."
          notes="Scroll to fit provider/model + test section in one shot if possible; otherwise split into 2 captures."
        />
      </DocSection>

      {/* N8N */}
      <DocSection id="n8n-path" eyebrow="11" title="n8n path">
        <DocP>
          The n8n processing path offloads AI work to a self-hosted{" "}
          <DocLink href="https://n8n.io">n8n</DocLink> workflow. It&rsquo;s
          optional, but unlocks a few things:
        </DocP>
        <DocList
          items={[
            "Swap models without redeploying kamotion.",
            "Chain the AI call with other steps — enrichment, routing, conditional branching, downstream webhooks.",
            "Use local models via Ollama (keep all AI on-device, zero cloud AI cost).",
            "Centralize AI prompts if you run multiple internal tools that need the same parser.",
          ]}
        />
        <DocH3>Setup summary</DocH3>
        <DocList
          ordered
          items={[
            <>Install and run n8n (Docker one-liner works, see their docs).</>,
            <>Import <DocInlineCode>docs/n8n-sample-workflow.json</DocInlineCode> from this repo. It&rsquo;s a 4-node starter: Webhook → AI Agent (with Structured Output Parser) → Respond to Webhook.</>,
            <>Attach any <DocStrong>Chat Model</DocStrong> sub-node to the AI Agent — OpenAI, Anthropic, Gemini, Ollama, anything n8n supports.</>,
            <>Enable the webhook and copy its URL.</>,
            <>In kamotion <DocInlineCode>/app/settings</DocInlineCode>, switch the processing path to <DocStrong>n8n</DocStrong> and paste the URL.</>,
            <>Optional: set <DocInlineCode>N8N_WEBHOOK_AUTH_USER</DocInlineCode> and <DocInlineCode>N8N_WEBHOOK_AUTH_PASSWORD</DocInlineCode> in kamotion&rsquo;s env to send Basic Auth to the webhook.</>,
          ]}
        />
        <DocP>
          Full setup guide with troubleshooting is at{" "}
          <DocLink href="https://github.com">
            <DocInlineCode>docs/09_N8N_SETUP.md</DocInlineCode>
          </DocLink>{" "}
          in the repo.
        </DocP>
        <DocCallout tone="warn" title="hasOutputParser flag">
          The AI Agent&rsquo;s <DocStrong>Output Parser</DocStrong> slot is
          hidden by default. Either flip <DocInlineCode>hasOutputParser: true</DocInlineCode>
          in the node&rsquo;s parameters, or toggle <DocStrong>Require Specific
          Output Format</DocStrong> in the UI. Without it, structured JSON
          won&rsquo;t come back.
        </DocCallout>
        <DocFigure
          label="n8n workflow after import"
          theme="both"
          capture="Your n8n canvas after importing kamotion's sample workflow. Show the 4 nodes wired up, with the Chat Model sub-node attached under the AI Agent."
          notes="Take this in the n8n UI, not kamotion. Either light or dark is fine — n8n has its own theme."
        />
      </DocSection>

      {/* DEPLOYMENT */}
      <DocSection id="deployment" eyebrow="12" title="Deployment recipes">
        <DocP>
          Pick whichever matches your preference for control vs. convenience.
          All four recipes use the same codebase and environment variables —
          only the hosting layer changes.
        </DocP>
        <DocTable
          headers={["Recipe", "Cost", "Effort", "Best for"]}
          rows={[
            [<DocStrong>Vercel + Supabase</DocStrong>, "$0", "~10 min", "Easiest cloud path, zero infra"],
            [<DocStrong>Dokploy + VPS</DocStrong>, "~$5/mo", "~30 min", "Self-host, one-click deploys"],
            [<DocStrong>Docker Compose</DocStrong>, "$0 if you own a box", "~1 hr", "Full control, air-gapped options"],
            [<DocStrong>Local only</DocStrong>, "$0", "<10 min", "Evaluation, personal-only use"],
          ]}
        />

        <DocH3>Recipe A — Vercel + Supabase (free)</DocH3>
        <DocList
          ordered
          items={[
            <>Push your fork to GitHub.</>,
            <>Go to <DocLink href="https://vercel.com/new">vercel.com/new</DocLink>, import the repo, accept the Next.js defaults.</>,
            <>Add the same env vars from your <DocInlineCode>.env.local</DocInlineCode> in the Vercel project&rsquo;s <DocInlineCode>Settings → Environment Variables</DocInlineCode>. The <DocInlineCode>NEXT_PUBLIC_*</DocInlineCode> ones must be set before the first build.</>,
            <>Click <DocStrong>Deploy</DocStrong>. Vercel builds and deploys to a <DocInlineCode>*.vercel.app</DocInlineCode> URL. Push to main auto-deploys.</>,
            <>Add your custom domain in <DocInlineCode>Settings → Domains</DocInlineCode>.</>,
          ]}
        />

        <DocH3>Recipe B — Dokploy on your VPS</DocH3>
        <DocP>
          The current production deployment. <DocLink href="https://dokploy.com">Dokploy</DocLink>{" "}
          is an open-source self-hosted PaaS (Heroku-alike) that runs on any
          Linux box. Nixpacks auto-generates the Dockerfile — you don&rsquo;t
          write one.
        </DocP>
        <DocList
          ordered
          items={[
            <>Install Dokploy on your VPS (one-liner from their docs).</>,
            <>Connect your GitHub account in Dokploy.</>,
            <>Create an app → point it at your kamotion fork → branch <DocInlineCode>main</DocInlineCode>.</>,
            <>Paste your env vars in the Dokploy env panel.</>,
            <>Add a domain, turn on HTTPS (Traefik + Let&rsquo;s Encrypt auto-issues).</>,
            <>Enable the GitHub webhook → every push to main triggers a rebuild and container swap.</>,
          ]}
        />
        <DocP>
          Full walkthrough at{" "}
          <DocInlineCode>docs/10_DEPLOY.md</DocInlineCode> in the repo —
          including the <DocInlineCode>engines.node: &quot;22&quot;</DocInlineCode>{" "}
          pin (Nixpacks tops out at Node 23 currently), the{" "}
          <DocInlineCode>$</DocInlineCode>-in-password gotcha, and rollback via
          Dokploy&rsquo;s last-10-deployments list.
        </DocP>

        <DocH3>Recipe C — Docker Compose self-host</DocH3>
        <DocP>
          If you want to run on your own hardware without a PaaS layer, use
          Docker Compose. The repo ships a <DocInlineCode>Dockerfile</DocInlineCode>{" "}
          suitable for a standalone Next.js build. Pair with a reverse proxy
          (Caddy or nginx) for HTTPS. You can also run your own Supabase
          locally via <DocLink href="https://supabase.com/docs/guides/self-hosting/docker">Supabase&rsquo;s self-host Docker setup</DocLink>{" "}
          for a fully offline stack.
        </DocP>

        <DocH3>Recipe D — Local only</DocH3>
        <DocP>
          For evaluation or personal single-machine use,{" "}
          <DocInlineCode>npm run dev</DocInlineCode> against a free Supabase
          project is enough. No deployment layer at all.
        </DocP>
      </DocSection>

      {/* FREE SELF-HOST */}
      <DocSection id="free-self-host" eyebrow="13" title="Run it for $0">
        <DocP>
          kamotion can run end-to-end with zero recurring cost. Here&rsquo;s a
          full free-tier recipe:
        </DocP>
        <DocTable
          headers={["Layer", "Free option", "Limits to know"]}
          rows={[
            [
              <DocStrong>Database + Auth</DocStrong>,
              <>Supabase free tier</>,
              <>500 MB Postgres, 1 GB storage, 50 K monthly active users, 2 projects. <DocLink href="https://supabase.com/pricing">Details</DocLink>.</>,
            ],
            [
              <DocStrong>Hosting</DocStrong>,
              <>Vercel Hobby or any Linux box you own</>,
              <>Vercel free: 100 GB bandwidth, serverless functions. No ads, no card required.</>,
            ],
            [
              <DocStrong>AI (cloud, free)</DocStrong>,
              <>OpenRouter free-tier routes</>,
              <>Several models have free routes (e.g. Llama 3.3, Gemini Flash). Rate-limited but usable for personal volume.</>,
            ],
            [
              <DocStrong>AI (local, truly free)</DocStrong>,
              <><DocLink href="https://ollama.com">Ollama</DocLink> on your machine</>,
              <>100% free, fully offline. Use the n8n path to point kamotion at Ollama via n8n&rsquo;s Ollama node.</>,
            ],
            [
              <DocStrong>AI orchestration (optional)</DocStrong>,
              <>n8n self-hosted (Docker)</>,
              <>100% free, no account needed. Runs locally or on the same box as kamotion.</>,
            ],
          ]}
        />
        <DocCallout tone="tip" title="The fully-free stack">
          kamotion on Vercel free tier + Supabase free tier + n8n on your
          laptop + Ollama running a local model. End result: a kanban PM tool
          with AI task extraction that costs $0/month and keeps all your
          pasted text on your own machine for AI processing.
        </DocCallout>
        <DocCallout tone="info" title="Trade-offs, honestly">
          Free tiers have real limits — Supabase pauses inactive projects after
          7 days, Vercel free has cold starts, Ollama needs a machine with
          enough RAM for the model you pick. For solo use they&rsquo;re fine;
          for a team of 5+, budget ~$25/mo across Supabase Pro + a small VPS.
        </DocCallout>
      </DocSection>

      {/* TECH STACK */}
      <DocSection id="tech-stack" eyebrow="14" title="Tech stack">
        <DocTable
          headers={["Layer", "Choice", "Why"]}
          rows={[
            [<DocStrong>Framework</DocStrong>, "Next.js 16 (App Router) + Turbopack", "Server components, file-based routing, fast dev loop"],
            [<DocStrong>Language</DocStrong>, "TypeScript (strict)", "Catch bugs at the seam, better editor experience"],
            [<DocStrong>Styling</DocStrong>, "Tailwind v4 + shadcn/ui + Radix", "Utility-first, accessible primitives, zero runtime"],
            [<DocStrong>DnD</DocStrong>, "dnd-kit (core + sortable)", "Keyboard-friendly, composable, no HTML5 drag quirks"],
            [<DocStrong>Data fetch</DocStrong>, "TanStack Query v5", "Optimistic updates, cache invalidation, server-state sanity"],
            [<DocStrong>Forms</DocStrong>, "React Hook Form + Zod resolvers", "Uncontrolled performance + schema-validated parsing"],
            [<DocStrong>Data layer</DocStrong>, "Supabase (Postgres + Auth + RLS)", "One service for DB, auth, and row-level security"],
            [<DocStrong>AI</DocStrong>, "Vercel AI SDK v6 → OpenRouter (default)", "Provider-agnostic, swap models without rewriting calls"],
            [<DocStrong>Logging</DocStrong>, "pino + pino-pretty (dev)", "JSON logs in prod, readable logs locally"],
          ]}
        />
      </DocSection>

      {/* CONTRIBUTING */}
      <DocSection id="contributing" eyebrow="15" title="Contributing">
        <DocP>
          The repo isn&rsquo;t public yet — once it is, this section will link
          to issues and the contribution workflow. In the meantime, the
          conventions that will apply:
        </DocP>
        <DocH3>Commit style</DocH3>
        <DocP>
          <DocStrong>Conventional commits.</DocStrong> Every message starts
          with a type:
        </DocP>
        <DocCode>{`feat(E.3): mobile responsive — sidebar drawer, collapsible kanban
fix: resolve C.2 typecheck errors in settings route
docs: add n8n setup walkthrough
refactor: extract site nav and footer into shared components`}</DocCode>
        <DocP>
          And ends with <DocInlineCode>Authored By: Lumaki, LLC &amp; Claude
          &lt;hello@digestibleapps.com&gt;</DocInlineCode> for AI-pair-programmed
          work.
        </DocP>

        <DocH3>Dev loop</DocH3>
        <DocCode lang="bash">{`npm run dev          # start dev server
npx tsc --noEmit     # typecheck
npm run build        # production build
npm run lint         # eslint`}</DocCode>

        <DocH3>PR expectations</DocH3>
        <DocList
          items={[
            "Typecheck clean, build clean.",
            "One feature per PR — no drive-by refactors on unrelated code.",
            "Update the relevant doc (this page, or docs/*.md) in the same PR.",
            "If you change a DB schema, add a migration under supabase/migrations/ with a zero-padded prefix.",
          ]}
        />
      </DocSection>

      {/* FAQ */}
      <DocSection id="faq" eyebrow="16" title="FAQ">
        <DocH3>Can I switch AI models without redeploying?</DocH3>
        <DocP>
          Yes — everything is configured at{" "}
          <DocInlineCode>/app/settings</DocInlineCode>. Change provider or
          model, save, and the next parse uses the new config. No code change,
          no restart.
        </DocP>

        <DocH3>Does it work offline?</DocH3>
        <DocP>
          The app itself needs the Supabase connection to run. But if you
          self-host Supabase locally (via Docker) and use Ollama for AI via
          the n8n path, the entire stack runs on your LAN with no internet.
        </DocP>

        <DocH3>How do I back up my data?</DocH3>
        <DocP>
          Supabase provides daily backups on paid tiers and manual point-in-time
          exports on free tier via <DocInlineCode>pg_dump</DocInlineCode>.
          Since kamotion is pure Postgres + auth, any standard Postgres backup
          tool works.
        </DocP>

        <DocH3>Can I use it for a team?</DocH3>
        <DocP>
          Yes. It&rsquo;s optimized for solo-first but supports up to a handful
          of members with role-based access (admin / member / viewer). There&rsquo;s
          no built-in billing or org separation — it&rsquo;s one board per
          instance.
        </DocP>

        <DocH3>Will there be public signup?</DocH3>
        <DocP>
          Not planned. kamotion is invite-only by design — admins provision
          users. If you want a SaaS with public signup, fork the repo and wire
          it up.
        </DocP>

        <DocH3>Why &ldquo;kamotion&rdquo;?</DocH3>
        <DocP>
          Slang for <DocStrong>commotion</DocStrong> — the organized chaos of
          messages, threads, and calls that become clarity once they&rsquo;re
          on a board.
        </DocP>
      </DocSection>

      <footer className="pt-14 pb-4 text-center">
        <p className="text-sm text-muted-foreground">
          Missing something? Open an issue on GitHub (coming soon) or email{" "}
          <DocLink href="mailto:hello@kamotion.io">hello@kamotion.io</DocLink>.
        </p>
      </footer>
    </>
  );
}
