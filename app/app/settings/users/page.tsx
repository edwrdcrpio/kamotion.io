import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { UsersTable } from "./users-table";

export const metadata = { title: "Users" };

export default async function UsersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.role !== "admin") redirect("/app");
  return (
    <UsersTable
      currentUserId={session.user.id}
      serviceRoleConfigured={isAdminClientConfigured()}
    />
  );
}
