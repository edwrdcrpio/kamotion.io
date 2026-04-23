import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole, toResponse, HttpError } from "@/lib/rbac";
import { TeamMemberUpdateInput } from "@/lib/validators";

const ParamSchema = z.object({ id: z.string().uuid() });

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["admin"]);
    const { id } = ParamSchema.parse(await ctx.params);
    const body = await request.json();
    const input = TeamMemberUpdateInput.parse(body);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("team_members")
      .update(input)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(404, "Team member not found");
    return NextResponse.json({ member: data });
  } catch (e) {
    return toResponse(e);
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["admin"]);
    const { id } = ParamSchema.parse(await ctx.params);
    const supabase = await createClient();
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) throw error;
    return new Response(null, { status: 204 });
  } catch (e) {
    return toResponse(e);
  }
}
