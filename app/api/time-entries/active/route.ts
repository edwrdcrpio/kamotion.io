import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole, toResponse } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await requireRole(["admin", "editor", "viewer"]);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("time_entries")
      .select("*, cards(task), time_categories(name, color)")
      .eq("created_by", session.user.id)
      .is("ended_at", null)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({ entry: data ?? null });
  } catch (e) {
    return toResponse(e);
  }
}
