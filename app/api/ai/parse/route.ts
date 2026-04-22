import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole, toResponse, HttpError } from "@/lib/rbac";
import { getModel, type AiProvider } from "@/lib/ai/providers";
import { parseViaAi, parseViaN8n } from "@/lib/ai/parse";
import { ParseInput } from "@/lib/ai/schema";

// Reasonable server-side timeout for the external AI call; keeps the request
// from hanging if the model provider stalls.
export const maxDuration = 60;

type SettingsMap = Record<string, unknown>;

async function loadSettings(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<SettingsMap> {
  const { data, error } = await supabase.from("settings").select("key, value");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["admin", "editor"]);
    const body = await request.json();
    const input = ParseInput.parse(body);

    const supabase = await createClient();
    const settings = await loadSettings(supabase);

    const processingPath = str(settings.processingPath, "in-app");

    if (processingPath === "n8n") {
      const webhookUrl = str(settings.n8nWebhookUrl).trim();
      if (!webhookUrl) {
        throw new HttpError(
          400,
          "n8n processing path is selected but n8nWebhookUrl is blank. Set it in Settings.",
        );
      }
      // Optional Basic Auth — configured via env so credentials never touch the DB.
      // Both vars must be present for auth to be applied; otherwise request is unauthenticated.
      const authUser = process.env.N8N_WEBHOOK_AUTH_USER;
      const authPass = process.env.N8N_WEBHOOK_AUTH_PASSWORD;
      const auth =
        authUser && authPass ? { user: authUser, password: authPass } : undefined;

      try {
        const cards = await parseViaN8n({
          webhookUrl,
          text: input.text,
          mode: input.mode,
          teamMembers: input.teamMembers,
          auth,
        });
        return NextResponse.json({ cards });
      } catch (e) {
        // Surface upstream webhook failures as 502 with the original message so
        // the UI can display "n8n webhook failed: 404 Not Found" instead of a
        // generic "Internal server error".
        const message =
          e instanceof Error ? e.message : "n8n webhook call failed";
        if (message.startsWith("n8n webhook failed:")) {
          throw new HttpError(502, message);
        }
        throw e;
      }
    }

    // in-app path (default)
    const provider = str(settings.aiProvider, "openrouter") as AiProvider;
    const modelId = str(settings.aiModel, "anthropic/claude-sonnet-4-6");
    const apiKeyRef = str(settings.aiApiKeyRef, "AI_API_KEY_OPENROUTER");
    const systemPrompt = str(
      settings.systemPrompt,
      "You are a project management assistant. Extract actionable tasks from the provided text and return them as structured cards. Return only valid JSON matching the schema.",
    );

    const apiKey = process.env[apiKeyRef];
    if (!apiKey) {
      throw new HttpError(
        500,
        `Environment variable ${apiKeyRef} is not set on the server.`,
      );
    }

    const model = getModel(provider, modelId, apiKey);
    const cards = await parseViaAi({
      model,
      systemPrompt,
      text: input.text,
      mode: input.mode,
      teamMembers: input.teamMembers,
    });

    return NextResponse.json({ cards });
  } catch (e) {
    return toResponse(e);
  }
}
