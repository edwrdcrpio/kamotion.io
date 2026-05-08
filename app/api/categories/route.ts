import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole, toResponse } from "@/lib/rbac";
import { TimeCategoryCreateInput } from "@/lib/validators";

export async function GET() {
  try {
    await requireRole(["admin", "editor", "viewer"]);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("time_categories")
      .select("*")
      .order("position", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ categories: data ?? [] });
  } catch (e) {
    return toResponse(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["admin"]);
    const body = await request.json();
    const input = TimeCategoryCreateInput.parse(body);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("time_categories")
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ category: data }, { status: 201 });
  } catch (e) {
    return toResponse(e);
  }
}
