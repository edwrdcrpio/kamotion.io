import { generateObject } from "ai";
import type { LanguageModel } from "ai";
import { ParseOutput, type ParsedCard } from "@/lib/ai/schema";

function buildUserPrompt(opts: {
  text: string;
  mode: "solo" | "team";
  teamMembers?: string[];
  today: string;
}): string {
  const { mode, teamMembers, today, text } = opts;
  const teamLine =
    mode === "team" && teamMembers && teamMembers.length > 0
      ? `Assignment mode: TEAM. Available team members: ${teamMembers.join(", ")}. Distribute tasks among them based on context clues in the text (who's named, who's responsible for what). If unclear, pick a reasonable default.`
      : `Assignment mode: SOLO. Set every card's assignee to "me".`;

  return [
    teamLine,
    `Requester defaults to "me" unless the text clearly names someone else making the request.`,
    `Today's date: ${today}. Set request_date to today unless the text clearly states otherwise. For relative dates like "Friday" or "next week", resolve against today.`,
    `Priority: infer from tone — deadlines/urgency language → "High"; nice-to-haves/backlog → "Low"; default to "Normal".`,
    `Status: set to "Not Started" unless the text says otherwise.`,
    `For any field without a clear value in the text, use null (dates, duration, notes). Never invent due dates or durations.`,
    `Return 0 to 50 cards total. Empty array if the text contains no actionable tasks.`,
    ``,
    `--- TEXT ---`,
    text,
    `--- END TEXT ---`,
  ].join("\n");
}

export async function parseViaAi(params: {
  model: LanguageModel;
  systemPrompt: string;
  text: string;
  mode: "solo" | "team";
  teamMembers?: string[];
}): Promise<ParsedCard[]> {
  const today = new Date().toISOString().slice(0, 10);

  const { object } = await generateObject({
    model: params.model,
    schema: ParseOutput,
    system: params.systemPrompt,
    prompt: buildUserPrompt({
      text: params.text,
      mode: params.mode,
      teamMembers: params.teamMembers,
      today,
    }),
  });

  return object.cards;
}

export async function parseViaN8n(params: {
  webhookUrl: string;
  text: string;
  mode: "solo" | "team";
  teamMembers?: string[];
  auth?: { user: string; password: string };
}): Promise<ParsedCard[]> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (params.auth) {
    // Buffer exists in Node runtime; base64-encode in server-safe fashion.
    const token = Buffer.from(
      `${params.auth.user}:${params.auth.password}`,
    ).toString("base64");
    headers.Authorization = `Basic ${token}`;
  }

  const res = await fetch(params.webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      text: params.text,
      mode: params.mode,
      teamMembers: params.teamMembers,
    }),
  });
  if (!res.ok) {
    throw new Error(`n8n webhook failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  // n8n workflow is expected to return { cards: ParsedCard[] }.
  const validated = ParseOutput.parse(json);
  return validated.cards;
}
