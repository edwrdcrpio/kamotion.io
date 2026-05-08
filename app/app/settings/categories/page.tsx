import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CategoriesTable } from "./categories-table";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.role !== "admin") redirect("/app");
  return <CategoriesTable />;
}
