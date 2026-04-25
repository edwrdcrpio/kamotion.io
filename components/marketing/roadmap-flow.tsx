type PhaseStatus = "active" | "next" | "later";

type Phase = {
  key: string;
  label: string;
  sub: string;
  status: PhaseStatus;
  items: string[];
};

const PHASES: Phase[] = [
  {
    key: "now",
    label: "Now",
    sub: "Building",
    status: "active",
    items: ["Inbox sync"],
  },
  {
    key: "next",
    label: "Next",
    sub: "Up next",
    status: "next",
    items: [
      "Slack & Telegram bots",
      "Active comms",
      "Recurring cards",
    ],
  },
  {
    key: "later",
    label: "Later",
    sub: "On the docket",
    status: "later",
    items: [
      "Delegate to AI",
      "iOS share-sheet import",
      "Native mobile apps",
      "Public API + webhooks",
    ],
  },
];

export function RoadmapFlow() {
  return (
    <div className="relative">
      {/* Desktop: horizontal track */}
      <span
        aria-hidden
        className="absolute top-3 left-[8%] right-[8%] hidden h-px bg-linear-to-r from-primary via-primary/40 to-border md:block"
      />
      {/* Mobile: vertical track */}
      <span
        aria-hidden
        className="absolute top-3 bottom-3 left-3 w-px bg-linear-to-b from-primary via-primary/40 to-border md:hidden"
      />

      <div className="relative grid gap-10 md:grid-cols-3 md:gap-8">
        {PHASES.map((phase) => (
          <PhaseBlock key={phase.key} phase={phase} />
        ))}
      </div>
    </div>
  );
}

function PhaseBlock({ phase }: { phase: Phase }) {
  return (
    <div className="relative pl-10 md:pl-0">
      {/* Dot — anchored to track */}
      <div className="absolute left-0 top-0 md:relative md:left-auto md:top-auto">
        <PhaseDot status={phase.status} />
      </div>

      {/* Label */}
      <div className="md:mt-4">
        <div className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
          {phase.label}
        </div>
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {phase.sub}
        </div>
      </div>

      {/* Items — just titles */}
      <ul className="mt-4 space-y-2.5">
        {phase.items.map((item) => (
          <li
            key={item}
            className="text-sm font-medium leading-snug text-foreground"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PhaseDot({ status }: { status: PhaseStatus }) {
  if (status === "active") {
    return (
      <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-primary opacity-30 motion-safe:animate-ping" />
        <span className="relative h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
      </span>
    );
  }
  if (status === "next") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center">
        <span className="h-3 w-3 rounded-full border-2 border-primary bg-background" />
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center">
      <span className="h-3 w-3 rounded-full border-2 border-muted-foreground/30 bg-background" />
    </span>
  );
}
