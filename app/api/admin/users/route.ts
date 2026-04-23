import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole, toResponse, HttpError } from "@/lib/rbac";
import {
  AdminUserCreateInput,
  ProfileStatus,
  Role,
  type AppUser,
} from "@/lib/validators";

export async function GET() {
  try {
    await requireRole(["admin"]);
    const admin = createAdminClient();

    // Page through auth users (default page size 50). For Kamotion's "personal
    // tool with optional team viewers" use case, a single page is enough; if
    // we ever cross 1k users, paginate properly.
    const { data: authData, error: authErr } = await admin.auth.admin.listUsers(
      { page: 1, perPage: 1000 },
    );
    if (authErr) throw authErr;

    const ids = authData.users.map((u) => u.id);
    const { data: profileRows, error: profErr } = await admin
      .from("profiles")
      .select("id, full_name, role, status, last_logged_in_at")
      .in("id", ids);
    if (profErr) throw profErr;

    const profileById = new Map(
      (profileRows ?? []).map((p) => [p.id, p]),
    );

    const users: AppUser[] = authData.users.map((u) => {
      const p = profileById.get(u.id);
      return {
        id: u.id,
        email: u.email ?? null,
        full_name: p?.full_name ?? "",
        role: (Role.safeParse(p?.role).data ?? "viewer") as AppUser["role"],
        status: (ProfileStatus.safeParse(p?.status).data ?? "active") as AppUser["status"],
        last_logged_in_at: p?.last_logged_in_at ?? null,
        created_at: u.created_at,
      };
    });

    users.sort((a, b) => a.full_name.localeCompare(b.full_name));
    return NextResponse.json({ users });
  } catch (e) {
    return toResponse(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["admin"]);
    const body = await request.json();
    const input = AdminUserCreateInput.parse(body);
    const admin = createAdminClient();

    const { data: created, error: createErr } =
      await admin.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
      });
    if (createErr) throw new HttpError(400, createErr.message);
    if (!created.user) throw new HttpError(500, "User creation returned no user");

    const userId = created.user.id;
    const { error: profErr } = await admin.from("profiles").upsert(
      {
        id: userId,
        full_name: input.full_name,
        role: input.role,
        status: "active",
      },
      { onConflict: "id" },
    );
    if (profErr) {
      // Roll back the auth user so we don't leave an orphan.
      await admin.auth.admin.deleteUser(userId);
      throw profErr;
    }

    // Mirror into team_members so the new user is immediately pickable on
    // cards. Linked rows have user_id set; unlinked teammates have user_id null.
    const { error: tmErr } = await admin.from("team_members").insert({
      user_id: userId,
      name: input.full_name,
      email: input.email,
      active: true,
    });
    if (tmErr) {
      // Don't block user creation if the team_members mirror fails — log and
      // continue so the auth user remains usable.
      console.error("[admin/users] team_members mirror insert failed:", tmErr);
    }

    const user: AppUser = {
      id: userId,
      email: created.user.email ?? null,
      full_name: input.full_name,
      role: input.role,
      status: "active",
      last_logged_in_at: null,
      created_at: created.user.created_at,
    };
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    return toResponse(e);
  }
}
