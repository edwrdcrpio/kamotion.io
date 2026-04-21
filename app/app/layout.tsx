import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Header } from "@/components/app-shell/header";
import { AppProviders } from "./providers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.status !== "active") redirect("/login?error=disabled");

  return (
    <AppProviders>
      <div className="flex flex-1 min-h-0">
        <Sidebar role={session.profile.role} />
        <div className="flex flex-col flex-1 min-w-0">
          <Header
            name={session.profile.full_name}
            email={session.user.email}
            role={session.profile.role}
          />
          <div className="flex flex-col flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </AppProviders>
  );
}
