"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/validators";
import { MAIN_NAV, FOOTER_NAV, type NavItem } from "./nav-config";

function NavLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const { label, href, icon: Icon } = item;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors cursor-pointer",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/app" && pathname.startsWith(href));
}

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const mainItems = MAIN_NAV.filter(
    (it) => !it.roles || it.roles.includes(role),
  );
  const footerItems = FOOTER_NAV.filter(
    (it) => !it.roles || it.roles.includes(role),
  );

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center px-5 border-b border-border">
        <Link href="/app" className="flex flex-col gap-0.5 cursor-pointer">
          <span className="text-base font-semibold tracking-tight leading-none">
            {brand.name}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-none">
            {brand.domain}
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {mainItems.map((item) => (
            <li key={item.href}>
              <NavLink item={item} active={isActive(pathname, item.href)} />
            </li>
          ))}
        </ul>
      </nav>

      {footerItems.length > 0 && (
        <div className="border-t border-border p-3">
          <ul className="space-y-1">
            {footerItems.map((item) => (
              <li key={item.href}>
                <NavLink item={item} active={isActive(pathname, item.href)} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-5 py-3 border-t border-border">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          v0.1 · alpha
        </span>
      </div>
    </aside>
  );
}
