"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PreviewDialog } from "./preview-dialog";
import type { ParsedCard } from "@/lib/ai/schema";

type Mode = "solo" | "team";

export function GenerateForm() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("solo");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedCards, setParsedCards] = useState<ParsedCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    setIsParsing(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Parse failed");
      const cards = body.cards as ParsedCard[];
      if (cards.length === 0) {
        setError(
          "The AI didn't find any tasks in that text. Try adding more detail or context.",
        );
        return;
      }
      setParsedCards(cards);
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
          Paste an email thread, meeting transcript, Slack dump, whatever.
          Kamotion extracts actionable cards — you review and edit before they
          land on the board.
        </p>
      </div>

      <div className="flex max-w-4xl flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="generate-text">Your text</Label>
          <Textarea
            id="generate-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            placeholder="Drop in bullets, paragraphs, transcripts — no format required.&#10;&#10;Example:&#10;&#10;Meeting with Acme. Deliverables: brand moodboard by Fri, homepage wireframe next Tuesday, decide on nav pattern (client leaning mega-menu)."
            className="min-h-[384px] font-mono text-sm leading-relaxed"
          />
          <p className="text-xs text-muted-foreground">
            {text.trim() === ""
              ? "Waiting for input…"
              : `${text.length.toLocaleString()} characters`}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-2">
            <Label>Assign to</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Just me</SelectItem>
                <SelectItem value="team">Distribute to team</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleParse}
            disabled={isParsing || text.trim() === ""}
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
      />
    </main>
  );
}
