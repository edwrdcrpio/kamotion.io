import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole, toResponse, HttpError } from "@/lib/rbac";

export async function POST() {
  try {
    const session = await requireRole(["admin", "editor"]);
    const supabase = await createClient();

    const { data: running } = await supabase
      .from("time_entries")
      .select("id, started_at")
      .eq("created_by", session.user.id)
      .is("ended_at", null)
      .maybeSingle();
    if (!running) {
      throw new HttpError(404, "No timer is running");
    }

    const endedAt = new Date();
    const startedAt = new Date(running.started_at);
    const minutes = Math.max(
      1,
      Math.round((endedAt.getTime() - startedAt.getTime()) / 60_000),
    );

    const { data, error } = await supabase
      .from("time_entries")
      .update({
        ended_at: endedAt.toISOString(),
        duration_minutes: minutes,
      })
      .eq("id", running.id)
      .select("*, cards(task), time_categories(name, color)")
      .single();
    if (error) throw error;
    return NextResponse.json({ entry: data });
  } catch (e) {
    return toResponse(e);
  }
}
