"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { brand } from "@/config/brand";
import { KamotionMark } from "@/components/brand/kamotion-mark";
import type { Role } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./sidebar-nav";

const STORAGE_KEY = "kamotion:sidebar-collapsed";

export function Sidebar({
  role,
  demoMode = false,
}: {
  role: Role;
  demoMode?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY) === "1") setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  const homeHref = demoMode ? "/try" : "/app";
  const subtitle = demoMode ? "demo" : brand.domain;
  const caption = demoMode ? "v0.1 · demo" : "v0.1 · alpha";

  return (
    <aside
      className={cn(
        "hidden md:flex md:sticky md:top-0 md:h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200",
        collapsed ? "w-16" : "w-56",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-border",
          collapsed ? "justify-center px-2" : "justify-between pl-5 pr-3",
        )}
      >
        <Link
          href={homeHref}
          className="flex items-center gap-2.5 cursor-pointer text-foreground"
          aria-label={brand.name}
        >
          <KamotionMark className="h-6 w-6 shrink-0" />
          {!collapsed && (
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-semibold tracking-tight leading-none">
                {brand.name}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-none">
                {subtitle}
              </span>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Collapse sidebar"
            className="rounded-md p-1 text-muted-foreground transition-colors cursor-pointer hover:bg-accent hover:text-foreground"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      <SidebarNav role={role} demoMode={demoMode} collapsed={collapsed} />

      <div
        className={cn(
          "border-t border-border",
          collapsed ? "flex justify-center py-3" : "flex items-center justify-between px-5 py-3",
        )}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={toggle}
            aria-label="Expand sidebar"
            className="rounded-md p-1 text-muted-foreground transition-colors cursor-pointer hover:bg-accent hover:text-foreground"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {caption}
          </span>
        )}
      </div>
    </aside>
  );
}
