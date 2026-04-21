import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole, toResponse } from "@/lib/rbac";
import { CardCreateInput, CardListQuery } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin", "editor", "viewer"]);
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const filters = CardListQuery.parse(params);

    const includeArchived =
      request.nextUrl.searchParams.get("archived") === "true";

    const supabase = await createClient();
    let query = supabase
      .from("cards")
      .select("*")
      .order("column_name", { ascending: true })
      .order("position", { ascending: true });

    // Archive isolation: default view hides archived; ?archived=true returns
    // only archived cards (for the /app/archive page).
    if (includeArchived) {
      query = query.not("archived_at", "is", null);
    } else {
      query = query.is("archived_at", null);
    }

    if (filters.assignee) query = query.eq("assignee", filters.assignee);
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.priority) query = query.eq("priority", filters.priority);
    if (filters.column_name) query = query.eq("column_name", filters.column_name);
    if (filters.due_before) query = query.lte("due_date", filters.due_before);
    if (filters.due_after) query = query.gte("due_date", filters.due_after);
    if (filters.q) {
      // Escape % and , to avoid breaking the .or() filter syntax.
      const safe = filters.q.replace(/[%,]/g, "");
      query = query.or(`task.ilike.%${safe}%,notes.ilike.%${safe}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ cards: data ?? [] });
  } catch (e) {
    return toResponse(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["admin", "editor"]);
    const body = await request.json();
    const input = CardCreateInput.parse(body);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cards")
      .insert({ ...input, created_by: session.user.id })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ card: data }, { status: 201 });
  } catch (e) {
    return toResponse(e);
  }
}
