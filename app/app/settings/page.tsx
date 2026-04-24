import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm, type SettingsValues } from "./settings-form";
import { AiProvider, ProcessingPath } from "@/lib/validators";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/ai/default-prompt";

export const metadata = { title: "Settings" };

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.role !== "admin") redirect("/app");

  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key, value");
  const map = Object.fromEntries(
    (data ?? []).map((r) => [r.key, r.value]),
  ) as Record<string, unknown>;

  const providerParsed = AiProvider.safeParse(map.aiProvider);
  const pathParsed = ProcessingPath.safeParse(map.processingPath);

  const initial: SettingsValues = {
    aiProvider: providerParsed.success ? providerParsed.data : "openrouter",
    aiModel: str(map.aiModel, "anthropic/claude-sonnet-4-6"),
    aiApiKeyRef: str(map.aiApiKeyRef, "AI_API_KEY_OPENROUTER"),
    systemPrompt: str(map.systemPrompt, DEFAULT_SYSTEM_PROMPT),
    processingPath: pathParsed.success ? pathParsed.data : "in-app",
    n8nWebhookUrl: str(map.n8nWebhookUrl, ""),
  };

  return <SettingsForm initial={initial} />;
}
