import { ThemeToggle } from "@/components/theme-toggle";
import { MobileSidebar } from "@/components/app-shell/mobile-sidebar";
import type { Role } from "@/lib/validators";

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export function Header({
  name,
  email,
  role,
  demoMode = false,
}: {
  name: string;
  email: string | null;
  role: Role;
  demoMode?: boolean;
}) {
  const displayName = demoMode ? `Demo · ${name}` : name;
  const badgeLabel = demoMode ? "Demo" : ROLE_LABEL[role];
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-3 text-sm min-w-0">
        <span className="font-medium truncate">{displayName}</span>
        <span className="text-muted-foreground hidden sm:inline">·</span>
        <span className="font-mono text-xs text-muted-foreground hidden sm:inline truncate">
          {email}
        </span>
        <span className="inline-flex shrink-0 items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {badgeLabel}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {demoMode ? null : <ThemeToggle />}
        <MobileSidebar role={role} demoMode={demoMode} />
      </div>
    </header>
  );
}
