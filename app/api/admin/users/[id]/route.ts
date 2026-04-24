import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole, toResponse, HttpError } from "@/lib/rbac";
import { AdminUserUpdateInput } from "@/lib/validators";

const ParamSchema = z.object({ id: z.string().uuid() });

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole(["admin"]);
    const { id } = ParamSchema.parse(await ctx.params);
    const body = await request.json();
    const input = AdminUserUpdateInput.parse(body);
    const admin = createAdminClient();

    // Self-protection: prevent the current admin from demoting or disabling
    // themselves. They can change their own name + password.
    if (id === session.user.id) {
      if (input.role && input.role !== "admin") {
        throw new HttpError(400, "You can't change your own role.");
      }
      if (input.status && input.status === "disabled") {
        throw new HttpError(400, "You can't disable your own account.");
      }
    }

    const profilePatch: {
      full_name?: string;
      role?: string;
      status?: string;
    } = {};
    if (input.full_name !== undefined) profilePatch.full_name = input.full_name;
    if (input.role !== undefined) profilePatch.role = input.role;
    if (input.status !== undefined) profilePatch.status = input.status;

    if (Object.keys(profilePatch).length > 0) {
      const { error: profErr } = await admin
        .from("profiles")
        .update(profilePatch)
        .eq("id", id);
      if (profErr) throw profErr;
    }

    // Mirror name + status into the linked team_members row (one-way sync).
    const tmPatch: { name?: string; active?: boolean } = {};
    if (input.full_name !== undefined) tmPatch.name = input.full_name;
    if (input.status !== undefined) tmPatch.active = input.status === "active";
    if (Object.keys(tmPatch).length > 0) {
      const { error: tmErr } = await admin
        .from("team_members")
        .update(tmPatch)
        .eq("user_id", id);
      if (tmErr) console.error("[admin/users] team_members mirror failed:", tmErr);
    }

    const authUpdate: { password?: string; email?: string } = {};
    if (input.password) authUpdate.password = input.password;
    if (input.email !== undefined) authUpdate.email = input.email;
    if (Object.keys(authUpdate).length > 0) {
      const { error: authErr } = await admin.auth.admin.updateUserById(id, {
        ...authUpdate,
        email_confirm: true,
      });
      if (authErr) throw new HttpError(400, authErr.message);
    }

    if (input.email !== undefined) {
      const { error: tmEmailErr } = await admin
        .from("team_members")
        .update({ email: input.email })
        .eq("user_id", id);
      if (tmEmailErr) console.error("[admin/users] team_members email mirror failed:", tmEmailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return toResponse(e);
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole(["admin"]);
    const { id } = ParamSchema.parse(await ctx.params);

    if (id === session.user.id) {
      throw new HttpError(400, "You can't delete your own account.");
    }

    const admin = createAdminClient();

    // Unlink the team_members row (keep history but break the FK to profiles).
    const { error: tmErr } = await admin
      .from("team_members")
      .update({ user_id: null })
      .eq("user_id", id);
    if (tmErr) console.error("[admin/users] team_members unlink failed:", tmErr);

    // Delete profile first to avoid FK violations regardless of cascade rules.
    const { error: profErr } = await admin
      .from("profiles")
      .delete()
      .eq("id", id);
    if (profErr) throw profErr;

    const { error: authErr } = await admin.auth.admin.deleteUser(id);
    if (authErr) throw new HttpError(400, authErr.message);

    return new Response(null, { status: 204 });
  } catch (e) {
    return toResponse(e);
  }
}
