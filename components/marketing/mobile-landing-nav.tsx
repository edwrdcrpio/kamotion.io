"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const SECTIONS = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#who", label: "Who it's for" },
  { href: "#origin", label: "Origin" },
];

export function MobileLandingNav({ accessEmail }: { accessEmail: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 w-[18rem] sm:max-w-[18rem]"
      >
        <SheetHeader className="flex h-16 flex-row items-center border-b border-border px-6 py-0">
          <SheetTitle asChild>
            <Link
              href="/"
              onClick={close}
              className="flex items-baseline gap-0.5 text-lg font-semibold tracking-tight cursor-pointer"
            >
              <span className="text-foreground">kamotion</span>
              <span className="text-muted-foreground">.io</span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  onClick={close}
                  className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-border p-4 flex flex-col gap-2">
          <Link
            href="/login"
            onClick={close}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors hover:bg-accent cursor-pointer"
          >
            Log in
          </Link>
          <a
            href={accessEmail}
            onClick={close}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-foreground px-3.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 cursor-pointer"
          >
            Request access
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
