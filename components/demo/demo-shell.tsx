"use client";

// Parallel AppShell for /try/*. Copies the real shell structure but:
// - Links point at /try/* instead of /app/*
// - Replaces logout with "Exit demo" → /
// - Admin items (Users, Settings) render a lock icon; click goes to the
//   stub LockedPanel route
// - Header shows the synthesized demo identity from DemoProvider
//
// Batch 4 will unify with <AppShell> via a shared presentational component;
// for now this exists as a copy so Batch 2 can verify routing + auth bypass.
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GanttChartSquare,
  Settings,
  Users,
  UserCog,
  Archive,
  Sparkles,
  Lock,
  LogOut,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { brand } from "@/config/brand";
import { KamotionMark } from "@/components/brand/kamotion-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useDemo } from "./demo-provider";

type DemoNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  locked?: boolean;
  tourAttr?: string;
};

const MAIN_NAV: DemoNavItem[] = [
  {
    label: "Generate Task(s)",
    href: "/try/generate",
    icon: Sparkles,
    tourAttr: "generate-link",
  },
  { label: "Board", href: "/try", icon: LayoutDashboard },
  { label: "Gantt", href: "/try/gantt", icon: GanttChartSquare },
  { label: "Team", href: "/try/team", icon: Users },
  { label: "Users", href: "/try/settings/users", icon: UserCog, locked: true },
  { label: "Archive", href: "/try/archive", icon: Archive },
];

const FOOTER_NAV: DemoNavItem[] = [
  { label: "Settings", href: "/try/settings", icon: Settings, locked: true },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/try") return pathname === "/try";
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: DemoNavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const { label, href, icon: Icon, locked, tourAttr } = item;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      data-tour={tourAttr}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors cursor-pointer",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{label}</span>
      {locked ? <Lock className="h-3 w-3 opacity-60" /> : null}
    </Link>
  );
}

function NavBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {MAIN_NAV.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                active={isActive(pathname, item.href)}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <ul className="space-y-1">
          {FOOTER_NAV.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                active={isActive(pathname, item.href)}
                onNavigate={onNavigate}
              />
            </li>
          ))}
          <li>
            <Link
              href="/"
              onClick={onNavigate}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors cursor-pointer hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Exit demo
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}

function DemoSidebar() {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center px-5 border-b border-border">
        <Link
          href="/try"
          className="flex items-center gap-2.5 cursor-pointer text-foreground"
        >
          <KamotionMark className="h-6 w-6 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-semibold tracking-tight leading-none">
              {brand.name}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-none">
              demo
            </span>
          </div>
        </Link>
      </div>

      <NavBody />

      <div className="px-5 py-3 border-t border-border">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          v0.1 · demo
        </span>
      </div>
    </aside>
  );
}

function DemoMobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden cursor-pointer"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 w-[18rem] sm:max-w-[18rem]"
      >
        <SheetHeader className="flex h-14 flex-row items-center border-b border-border px-5 py-0">
          <SheetTitle asChild>
            <Link
              href="/try"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 cursor-pointer text-foreground"
            >
              <KamotionMark className="h-6 w-6 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-semibold tracking-tight leading-none">
                  {brand.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-none">
                  demo
                </span>
              </div>
            </Link>
          </SheetTitle>
        </SheetHeader>

        <NavBody onNavigate={() => setOpen(false)} />

        <div className="px-5 py-3 border-t border-border">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            v0.1 · demo
          </span>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DemoHeader() {
  const { profile } = useDemo();
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-3 text-sm min-w-0">
        <span className="font-medium truncate">Demo · {profile.full_name}</span>
        <span className="text-muted-foreground hidden sm:inline">·</span>
        <span className="font-mono text-xs text-muted-foreground hidden sm:inline truncate">
          {profile.email}
        </span>
        <span className="inline-flex shrink-0 items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          Demo
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <ThemeToggle />
        <DemoMobileSidebar />
      </div>
    </header>
  );
}

export function DemoShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 min-h-0">
      <DemoSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <DemoHeader />
        <div className="flex flex-col flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
