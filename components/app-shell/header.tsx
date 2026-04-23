import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/app/app/actions";
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
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-3 text-sm">
        <span className="font-medium">{name}</span>
        <span className="text-muted-foreground">·</span>
        <span className="font-mono text-xs text-muted-foreground hidden sm:inline">
          {email}
        </span>
        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {ROLE_LABEL[role]}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="cursor-pointer"
          >
            Log out
          </Button>
        </form>
      </div>
    </header>
  );
}
