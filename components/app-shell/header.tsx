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
}: {
  name: string;
  email: string | null;
  role: Role;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-3 text-sm min-w-0">
        <span className="font-medium truncate">{name}</span>
        <span className="text-muted-foreground hidden sm:inline">·</span>
        <span className="font-mono text-xs text-muted-foreground hidden sm:inline truncate">
          {email}
        </span>
        <span className="inline-flex shrink-0 items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {ROLE_LABEL[role]}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <ThemeToggle />
        <MobileSidebar role={role} />
      </div>
    </header>
  );
}
