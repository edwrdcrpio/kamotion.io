import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { TimeLogSheet } from "./sheet-view";

export const metadata = { title: "Time Log" };

export default async function TimeLogPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <TimeLogSheet />;
}
