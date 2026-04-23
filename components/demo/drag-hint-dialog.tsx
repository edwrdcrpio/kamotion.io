"use client";

// Secondary modal that fires once per session the first time a visitor has
// cards on the /try board. The tour already mentions drag-and-drop in the
// "Board columns" step; this reinforces it with a motion hint and a concrete
// micro-animation of a card sliding Ready → In Progress.
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDemo } from "./demo-provider";
import type { Card } from "@/lib/validators";

async function fetchCards(): Promise<{ cards: Card[] }> {
  const res = await fetch("/api/cards", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load cards");
  return res.json();
}

export function DragHintDialog() {
  const { dragHintDismissed, dismissDragHint, tourStep, tourSkipped } =
    useDemo();
  const pathname = usePathname();

  // Only poll once — the dialog is strictly a "first cards land on the board"
  // nudge, and after dismissal we never need to refetch for this purpose.
  const { data } = useQuery({
    queryKey: ["cards"],
    queryFn: fetchCards,
    enabled: pathname === "/try" && !dragHintDismissed,
    staleTime: 10_000,
  });

  const hasCards = (data?.cards ?? []).length > 0;
  // Keep this independent of the tour — if the visitor skipped the tour we
  // still want to teach them drag-and-drop once cards exist.
  const shouldOpen =
    pathname === "/try" &&
    !dragHintDismissed &&
    hasCards &&
    (tourSkipped || tourStep >= 5);

  // Small delay so the dialog doesn't slam in at the same instant as the
  // router.push("/try") from PreviewDialog — gives the board a moment to
  // hydrate first.
  useEffect(() => {
    // no-op; retained so this component can grow a timer later.
  }, []);

  return (
    <Dialog
      open={shouldOpen}
      onOpenChange={(next) => {
        if (!next) dismissDragHint();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>One more thing — drag to update status</DialogTitle>
          <DialogDescription>
            Cards move by dragging. Dropping a card into a different column
            updates its status automatically.
          </DialogDescription>
        </DialogHeader>

        <DragAnimation />

        <DialogFooter>
          <Button
            type="button"
            onClick={dismissDragHint}
            className="cursor-pointer"
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DragAnimation() {
  return (
    <div className="relative mt-2 h-36 overflow-hidden rounded-lg border border-border bg-muted/40 p-3">
      <div className="grid h-full grid-cols-2 gap-3">
        <Column label="Ready" tone="ready">
          <GhostCard animate="leave" />
        </Column>
        <Column label="In Progress" tone="progress">
          <GhostCard animate="arrive" />
        </Column>
      </div>
      <FloatingCard />
    </div>
  );
}

function Column({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "ready" | "progress";
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border bg-background/80 p-2 text-left">
      <span
        className={
          tone === "ready"
            ? "font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
            : "font-mono text-[10px] uppercase tracking-[0.15em] text-primary"
        }
      >
        {label}
      </span>
      <div className="flex flex-1 flex-col gap-1.5">{children}</div>
    </div>
  );
}

function GhostCard({ animate }: { animate: "leave" | "arrive" }) {
  const className =
    animate === "leave"
      ? "h-9 rounded border border-dashed border-border/50 bg-background/40 opacity-40 motion-safe:animate-[demoFade_2.4s_ease-in-out_infinite]"
      : "h-9 rounded border border-dashed border-primary/40 bg-primary/5 opacity-0 motion-safe:animate-[demoAppear_2.4s_ease-in-out_infinite]";
  return <div className={className} />;
}

// A real-looking card that slides left→right across the two columns on a
// continuous loop, matching the kanban cue.
function FloatingCard() {
  return (
    <>
      <style>{`
        @keyframes demoSlide {
          0%, 15% { transform: translate(4%, 28px); opacity: 0.0; }
          25% { transform: translate(4%, 28px); opacity: 1; }
          55% { transform: translate(54%, 28px); opacity: 1; }
          75% { transform: translate(54%, 28px); opacity: 0; }
          100% { transform: translate(4%, 28px); opacity: 0; }
        }
        @keyframes demoFade {
          0%, 25% { opacity: 0.4; }
          50% { opacity: 0.0; }
          100% { opacity: 0.4; }
        }
        @keyframes demoAppear {
          0%, 55% { opacity: 0.0; }
          75% { opacity: 1; }
          100% { opacity: 0.0; }
        }
      `}</style>
      <div
        className="pointer-events-none absolute left-0 top-3 w-[42%] rounded-md border border-primary/50 bg-primary/10 px-2 py-1.5 text-xs font-medium text-primary shadow-sm motion-safe:animate-[demoSlide_2.4s_ease-in-out_infinite]"
        aria-hidden="true"
      >
        Rotate API keys
      </div>
    </>
  );
}
