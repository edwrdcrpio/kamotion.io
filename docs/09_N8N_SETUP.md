---
Created: 2026-04-21
Status: Reference
Purpose: How to wire Kamotion to n8n for AI task parsing
---

# Kamotion — n8n Processing Path

Kamotion can route AI parsing through an n8n workflow instead of the in-app Vercel AI SDK. This is useful if you want to:

- Keep all AI config (provider, model, credentials) in n8n
- Use models or providers Kamotion doesn't wire up natively
- Observe and debug parses with n8n's execution history

## How it works

When `processingPath = "n8n"` is saved in Kamotion's Settings, every parse request from `/app/generate` POSTs to your `n8nWebhookUrl` with:

```json
{
  "text": "…raw text the user pasted…",
  "mode": "solo" | "team",
  "teamMembers": ["alice", "bob"] | []
}
```

The workflow must respond with:

```json
{
  "cards": [
    {
      "task": "Write the onboarding doc",
      "assignee": "me",
      "requester": "me",
      "request_date": "2026-04-21",
      "due_date": null,
      "estimated_duration": null,
      "notes": null,
      "priority": "Normal",
      "status": "Not Started"
    }
  ]
}
```

Kamotion validates this response against its Zod schema and rejects malformed payloads.

## Installing the sample workflow

1. Open your n8n instance → **Workflows** → **Import from File**.
2. Import `docs/n8n-sample-workflow.json` from this repo.
3. Open the imported workflow — it has four nodes:
   - **Webhook** (trigger)
   - **AI Agent** (prompt already preloaded with Kamotion extraction rules)
   - **Structured Output Parser** (JSON Schema matching Kamotion's card shape)
   - **Respond to Webhook**
4. **Attach a chat model** to the AI Agent: click the empty **Chat Model** sub-node slot under the Agent and pick a credential (OpenAI, Anthropic, Google, Ollama, etc.). This is the only manual step — any model n8n supports will work.
5. **Save** and **Activate** the workflow.
6. Open the Webhook node and copy the **Production URL** (e.g. `https://your-n8n.example.com/webhook/kamotion-parse`).
7. In Kamotion, go to **Settings** → set **Path** to `n8n webhook`, paste the URL into **n8n webhook URL**, then **Save**.
8. Head to `/app/generate`, paste some text, hit **Generate** — requests now flow through n8n.

## What lives where

| Concern | Owner |
|---|---|
| System prompt | n8n (AI Agent → **Options → System Message**) |
| Model choice | n8n (Chat Model sub-node attached to the Agent) |
| API credentials | n8n (credential on the Chat Model sub-node) |
| Output schema | n8n (Structured Output Parser sub-node) — must match Kamotion's shape |
| Webhook URL | Kamotion (Settings) |

With the n8n path active, Kamotion's AI Provider / Model / API key / System Prompt fields are greyed out in Settings — they apply only to the in-app path.

## Editing the prompt

Open the **AI Agent** node in n8n → **Options → System Message**. The imported workflow has Kamotion's default extraction rules preloaded. Tune freely — n8n is the source of truth when the n8n path is active.

## Troubleshooting

- **`n8n webhook failed: 404`** — workflow not active, or URL mismatched. Re-copy the Production URL from the Webhook node.
- **`n8n webhook failed: 500`** — open the execution in n8n and inspect which node threw. Most common: no chat model attached to the AI Agent.
- **Kamotion shows `Validation failed` / `issues: [...]`** — the workflow responded but the JSON didn't match the card schema. Check the Structured Output Parser is wired to the Agent's `ai_outputParser` input and that its JSON Schema matches the one shipped in the sample. Weaker models occasionally drop required fields; try a stronger model or tighten the system prompt.
- **Dates look wrong** — the Agent receives `today` via `{{ $now.toFormat('yyyy-MM-dd') }}`. If your n8n instance runs in a timezone different from your users, dates may skew by a day. Pin n8n's timezone or adjust the expression.

## Schema reference

The card schema Kamotion expects is defined in `lib/ai/schema.ts` (`ParsedCard`). If you ever change that file, update the JSON Schema inside the **Structured Output Parser** node in your n8n workflow to match.
