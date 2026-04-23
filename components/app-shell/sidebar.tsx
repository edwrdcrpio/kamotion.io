import Link from "next/link";
import { brand } from "@/config/brand";
import { KamotionMark } from "@/components/brand/kamotion-mark";
import type { Role } from "@/lib/validators";
import { SidebarNav } from "./sidebar-nav";

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center px-5 border-b border-border">
        <Link
          href="/app"
          className="flex items-center gap-2.5 cursor-pointer text-foreground"
        >
          <KamotionMark className="h-6 w-6 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-semibold tracking-tight leading-none">
              {brand.name}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-none">
              {brand.domain}
            </span>
          </div>
        </Link>
      </div>

      <SidebarNav role={role} />

      <div className="px-5 py-3 border-t border-border">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          v0.1 · alpha
        </span>
      </div>
    </aside>
  );
}
