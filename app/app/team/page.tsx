import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { TeamTable } from "./team-table";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.role !== "admin") redirect("/app");
  return <TeamTable />;
}
