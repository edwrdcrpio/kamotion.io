import {
  LayoutDashboard,
  GanttChartSquare,
  Settings,
  Users,
  UserCog,
  Archive,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/validators";

export type NavItem = {
  label: string;
  href: string; // real-app href
  demoHref: string; // /try/* href used when AppShell renders demoMode
  icon: LucideIcon;
  roles?: Role[]; // omit = all roles
  demoLocked?: boolean; // show a lock icon in demo mode (stub route)
  tourAttr?: string; // data-tour attribute for react-joyride targeting
};

// Primary nav — top-to-bottom order as it renders.
export const MAIN_NAV: NavItem[] = [
  {
    label: "Generate Task(s)",
    href: "/app/generate",
    demoHref: "/try/generate",
    icon: Sparkles,
    roles: ["admin", "editor"],
    tourAttr: "generate-link",
  },
  {
    label: "Board",
    href: "/app",
    demoHref: "/try",
    icon: LayoutDashboard,
  },
  {
    label: "Gantt",
    href: "/app/gantt",
    demoHref: "/try/gantt",
    icon: GanttChartSquare,
  },
  {
    label: "Team",
    href: "/app/team",
    demoHref: "/try/team",
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "Users",
    href: "/app/settings/users",
    demoHref: "/try/settings/users",
    icon: UserCog,
    roles: ["admin"],
    demoLocked: true,
  },
  {
    label: "Archive",
    href: "/app/archive",
    demoHref: "/try/archive",
    icon: Archive,
    roles: ["admin"],
  },
];

// Pinned to the bottom of the sidebar (above the version caption).
export const FOOTER_NAV: NavItem[] = [
  {
    label: "Settings",
    href: "/app/settings",
    demoHref: "/try/settings",
    icon: Settings,
    roles: ["admin"],
    demoLocked: true,
  },
];
