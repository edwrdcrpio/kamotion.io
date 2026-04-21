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
  href: string;
  icon: LucideIcon;
  roles?: Role[]; // omit = all roles
};

// Primary nav — top-to-bottom order as it renders.
export const MAIN_NAV: NavItem[] = [
  { label: "Board", href: "/app", icon: LayoutDashboard },
  {
    label: "Generate Task(s)",
    href: "/app/generate",
    icon: Sparkles,
    roles: ["admin", "editor"],
  },
  { label: "Gantt", href: "/app/gantt", icon: GanttChartSquare },
  { label: "Team", href: "/app/team", icon: Users, roles: ["admin"] },
  { label: "Users", href: "/app/settings/users", icon: UserCog, roles: ["admin"] },
  { label: "Archive", href: "/app/archive", icon: Archive, roles: ["admin"] },
];

// Pinned to the bottom of the sidebar (above the version caption).
export const FOOTER_NAV: NavItem[] = [
  { label: "Settings", href: "/app/settings", icon: Settings, roles: ["admin"] },
];
