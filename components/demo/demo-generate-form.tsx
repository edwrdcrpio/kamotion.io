"use client";

// Demo-mode Generate page. Replaces the free-form textarea with a 3-card
// picker so visitors can't throw arbitrary input at the (mocked) parser.
// Hitting Extract calls /api/ai/parse which the MSW handler serves from the
// selected DEMO_EXAMPLE.
import { useState } from "react";
import { Sparkles, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEMO_EXAMPLES, type DemoExample } from "@/config/demo-examples";
import { setSelectedExample } from "@/lib/demo/state";
import { PreviewDialog } from "@/app/app/generate/preview-dialog";
import type { ParsedCard } from "@/lib/ai/schema";

type ExampleId = DemoExample["id"];

export function DemoGenerateForm() {
  const [selectedId, setSelectedId] = useState<ExampleId>(DEMO_EXAMPLES[0].id);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedCards, setParsedCards] = useState<ParsedCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected =
    DEMO_EXAMPLES.find((e) => e.id === selectedId) ?? DEMO_EXAMPLES[0];

  const handleExtract = async () => {
    setIsParsing(true);
    setError(null);
    setSelectedExample(selectedId);
    try {
      const res = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selected.source, mode: "team" }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Parse failed");
      setParsedCards(body.cards as ParsedCard[]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Sparkles className="h-5 w-5 text-brand-accent" />
          Generate Tasks
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          In the real app this is a textarea — paste an email, transcript, or
          Slack dump. For the demo, pick one of the curated sources below to
          see what kamotion extracts.
        </p>
      </div>

      <div className="flex max-w-5xl flex-col gap-6">
        <div
          className="grid grid-cols-1 gap-3 md:grid-cols-3"
          data-tour="picker-cards"
        >
          {DEMO_EXAMPLES.map((example) => (
            <ExampleCard
              key={example.id}
              example={example}
              selected={example.id === selectedId}
              onSelect={() => setSelectedId(example.id)}
            />
          ))}
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {selected.sourceLabel}
          </div>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-xs leading-relaxed text-muted-foreground">
            {selected.source}
          </pre>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleExtract}
            disabled={isParsing}
            data-tour="extract-button"
            className="cursor-pointer"
          >
            {isParsing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Parsing…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Extract cards
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Nothing is sent to a real model — the demo returns the curated
            cards for the selected source.
          </p>
        </div>

        {error && (
          <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <PreviewDialog
        cards={parsedCards}
        onOpenChange={(open) => {
          if (!open) setParsedCards(null);
        }}
        redirectTo="/try"
        confirmTourAttr="add-to-queue"
        disableOutsideClose
      />
    </main>
  );
}

function ExampleCard({
  example,
  selected,
  onSelect,
}: {
  example: DemoExample;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/40 hover:bg-accent/40",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          {example.label}
        </span>
        {selected ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
            <Check className="h-3 w-3" />
            Picked
          </span>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">{example.description}</p>
      <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground/70">
        {example.sourceLabel}
      </p>
    </button>
  );
}
