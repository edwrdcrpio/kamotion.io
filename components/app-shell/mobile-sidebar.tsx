"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { brand } from "@/config/brand";
import { KamotionMark } from "@/components/brand/kamotion-mark";
import type { Role } from "@/lib/validators";
import { SidebarNav } from "./sidebar-nav";

export function MobileSidebar({ role }: { role: Role }) {
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
              href="/app"
              onClick={() => setOpen(false)}
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
          </SheetTitle>
        </SheetHeader>

        <SidebarNav role={role} onNavigate={() => setOpen(false)} />

        <div className="px-5 py-3 border-t border-border">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            v0.1 · alpha
          </span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
