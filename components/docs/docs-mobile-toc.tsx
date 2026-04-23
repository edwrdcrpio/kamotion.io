"use client";

import { useState } from "react";
import { List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DocsToc } from "@/components/docs/docs-toc";
import type { DocsSection } from "@/config/docs-sections";

export function DocsMobileToc({ sections }: { sections: DocsSection[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-16 z-30 border-b border-border/60 bg-background/90 px-6 py-2 backdrop-blur lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground cursor-pointer"
          >
            <List className="h-3.5 w-3.5" />
            On this page
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex w-[18rem] flex-col gap-0 p-0 sm:max-w-[18rem]"
        >
          <SheetHeader className="flex h-16 flex-row items-center border-b border-border px-6 py-0">
            <SheetTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
              Documentation
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <DocsToc sections={sections} onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
