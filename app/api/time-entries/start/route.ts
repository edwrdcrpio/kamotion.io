import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole, toResponse, HttpError } from "@/lib/rbac";
import { TimeEntryStartInput } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["admin", "editor"]);
    const body = await request.json().catch(() => ({}));
    const input = TimeEntryStartInput.parse(body);

    const supabase = await createClient();

    // Friendly pre-check — DB also enforces this via the partial unique
    // index `time_entries_one_running_per_user`.
    const { data: existing } = await supabase
      .from("time_entries")
      .select("id")
      .eq("created_by", session.user.id)
      .is("ended_at", null)
      .maybeSingle();
    if (existing) {
      throw new HttpError(409, "A timer is already running");
    }

    // If no category passed, inherit from the card's default_category_id.
    let categoryId = input.category_id ?? null;
    if (!categoryId && input.card_id) {
      const { data: card } = await supabase
        .from("cards")
        .select("default_category_id")
        .eq("id", input.card_id)
        .maybeSingle();
      categoryId = card?.default_category_id ?? null;
    }

    const { data, error } = await supabase
      .from("time_entries")
      .insert({
        card_id: input.card_id ?? null,
        category_id: categoryId,
        notes: input.notes ?? null,
        source: "timer",
        started_at: new Date().toISOString(),
        created_by: session.user.id,
      })
      .select("*, cards(task), time_categories(name, color)")
      .single();
    if (error) throw error;
    return NextResponse.json({ entry: data }, { status: 201 });
  } catch (e) {
    return toResponse(e);
  }
}
