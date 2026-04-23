import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole, toResponse } from "@/lib/rbac";
import { SettingsUpdateInput, SETTINGS_KEYS } from "@/lib/validators";
import type { Json } from "@/lib/types/database.types";

export async function GET() {
  try {
    await requireRole(["admin", "editor", "viewer"]);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("settings")
      .select("key, value");
    if (error) throw error;

    const map = Object.fromEntries(
      (data ?? []).map((r) => [r.key, r.value]),
    ) as Record<string, unknown>;

    return NextResponse.json({ settings: map });
  } catch (e) {
    return toResponse(e);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole(["admin"]);
    const body = await request.json();
    const input = SettingsUpdateInput.parse(body);

    const rows: { key: string; value: Json }[] = SETTINGS_KEYS.filter(
      (k) => input[k] !== undefined,
    ).map((k) => ({ key: k, value: (input[k] ?? null) as Json }));

    if (rows.length === 0) {
      return NextResponse.json({ updated: 0 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("settings")
      .upsert(rows, { onConflict: "key" });
    if (error) throw error;

    return NextResponse.json({ updated: rows.length });
  } catch (e) {
    return toResponse(e);
  }
}
