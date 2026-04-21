import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { GenerateForm } from "./generate-form";

export const metadata = { title: "Generate Tasks" };

export default async function GeneratePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  // Viewers can't create cards, so they can't use the AI parser either.
  if (session.profile.role === "viewer") redirect("/app");

  return <GenerateForm />;
}
