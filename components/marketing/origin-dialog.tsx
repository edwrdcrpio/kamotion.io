"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function OriginDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="cursor-pointer text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Origin
        </button>
      </DialogTrigger>
      <DialogContent className="p-6 sm:max-w-2xl sm:p-10">
        <DialogHeader>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Origin
          </span>
          <DialogTitle className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Built because I needed it.
          </DialogTitle>
          <DialogDescription className="sr-only">
            Why kamotion exists, in Edward&rsquo;s own words.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <p>
            I&rsquo;m a full-stack dev, marketer, and solo builder. My tasks
            don&rsquo;t live in one place &mdash; they&rsquo;re scattered
            across Slack, email, Teams, texts, Zoom, Docs.
          </p>
          <p>
            I was constantly digging through conversations just to figure out
            what to do next. So I built kamotion for myself &mdash; something
            that could turn all that noise into clear, actionable work.
          </p>
          <p className="text-balance text-base font-medium text-foreground sm:text-lg">
            Paste the noise. Get the work.
          </p>
          <p>
            Now I&rsquo;m opening it up for others who deal with the same kind
            of commotion.
          </p>
          <p className="font-mono text-sm text-foreground">&mdash; Edward</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
