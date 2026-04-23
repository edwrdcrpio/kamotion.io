import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole, toResponse } from "@/lib/rbac";
import { TeamMemberCreateInput } from "@/lib/validators";

export async function GET() {
  try {
    await requireRole(["admin", "editor", "viewer"]);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("active", { ascending: false })
      .order("name", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ members: data ?? [] });
  } catch (e) {
    return toResponse(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["admin"]);
    const body = await request.json();
    const input = TeamMemberCreateInput.parse(body);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("team_members")
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ member: data }, { status: 201 });
  } catch (e) {
    return toResponse(e);
  }
}
