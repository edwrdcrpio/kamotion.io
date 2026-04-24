"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/validators";
import { logoutAction } from "@/app/app/actions";
import { MAIN_NAV, FOOTER_NAV, type NavItem } from "./nav-config";

function NavLink({
  item,
  active,
  onNavigate,
  demoMode,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
  demoMode: boolean;
}) {
  const { label, icon: Icon, demoLocked } = item;
  const href = demoMode ? item.demoHref : item.href;
  const showLock = demoMode && demoLocked;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors cursor-pointer",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{label}</span>
      {showLock ? <Lock className="h-3 w-3 opacity-60" /> : null}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/app" || href === "/try") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function SidebarNav({
  role,
  onNavigate,
  demoMode = false,
}: {
  role: Role;
  onNavigate?: () => void;
  demoMode?: boolean;
}) {
  const pathname = usePathname();
  const mainItems = MAIN_NAV.filter(
    (it) => !it.roles || it.roles.includes(role),
  );
  const footerItems = FOOTER_NAV.filter(
    (it) => !it.roles || it.roles.includes(role),
  );

  return (
    <>
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {mainItems.map((item) => {
            const href = demoMode ? item.demoHref : item.href;
            return (
              <li
                key={href}
                data-tour={demoMode ? item.tourAttr : undefined}
              >
                <NavLink
                  item={item}
                  active={isActive(pathname, href)}
                  onNavigate={onNavigate}
                  demoMode={demoMode}
                />
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <ul className="space-y-1">
          {footerItems.map((item) => {
            const href = demoMode ? item.demoHref : item.href;
            return (
              <li
                key={href}
                data-tour={demoMode ? item.tourAttr : undefined}
              >
                <NavLink
                  item={item}
                  active={isActive(pathname, href)}
                  onNavigate={onNavigate}
                  demoMode={demoMode}
                />
              </li>
            );
          })}
          <li>
            {demoMode ? (
              <Link
                href="/"
                onClick={onNavigate}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors cursor-pointer hover:bg-accent hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Exit demo
              </Link>
            ) : (
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors cursor-pointer hover:bg-accent hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </form>
            )}
          </li>
        </ul>
      </div>
    </>
  );
}
