import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole, toResponse, HttpError } from "@/lib/rbac";
import { TimeCategoryUpdateInput } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["admin"]);
    const { id } = await params;
    const body = await request.json();
    const input = TimeCategoryUpdateInput.parse(body);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("time_categories")
      .update(input)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    if (!data) throw new HttpError(404, "Category not found");
    return NextResponse.json({ category: data });
  } catch (e) {
    return toResponse(e);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["admin"]);
    const { id } = await params;

    const supabase = await createClient();
    const { error } = await supabase
      .from("time_categories")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return toResponse(e);
  }
}
