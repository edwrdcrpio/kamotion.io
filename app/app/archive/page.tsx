import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ArchiveTable } from "./archive-table";

export const metadata = { title: "Archive" };

export default async function ArchivePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.role !== "admin") redirect("/app");

  return <ArchiveTable />;
}
