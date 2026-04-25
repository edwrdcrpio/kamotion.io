"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Hash,
  Mail,
  MessageSquare,
  MessagesSquare,
  Users,
  type LucideIcon,
} from "lucide-react";

type Conversation = {
  id: string;
  shortLabel: string;
  channelLabel: string;
  icon: LucideIcon;
  summary: string;
  Body: () => React.ReactNode;
};

const CONVERSATIONS: Conversation[] = [
  {
    id: "email-onboarding",
    shortLabel: "Email",
    channelLabel: "Onboarding email",
    icon: Mail,
    summary: "New hire setup",
    Body: () => (
      <div className="flex flex-col gap-2.5 text-[13px] leading-relaxed">
        <div className="flex flex-col gap-0.5 border-b border-border/60 pb-2 font-mono text-[11px] text-muted-foreground">
          <span>
            <span className="text-foreground/80">From:</span> Alicia · Team
            Manager
          </span>
          <span>
            <span className="text-foreground/80">To:</span> IT, Admin, HR
          </span>
          <span>
            <span className="text-foreground/80">Time:</span> 11:06 AM
          </span>
        </div>
        <p className="text-foreground">Hi team,</p>
        <p className="text-muted-foreground">
          Jordan Lee starts next Monday as our new Product Designer. Can we
          make sure everything is ready before their first day?
        </p>
        <p className="text-muted-foreground">
          They&rsquo;ll need a laptop with standard permissions, plus access
          to Slack, email, Jira, and Figma (Design Team workspace, editor).
        </p>
        <p className="text-muted-foreground">
          Please add Jordan to the Product Standup, Design Review, and Monday
          onboarding invites. HR — confirm payroll and tax forms before
          Friday&hellip;
        </p>
      </div>
    ),
  },
  {
    id: "slack-client",
    shortLabel: "Slack",
    channelLabel: "Slack thread",
    icon: Hash,
    summary: "Client revisions",
    Body: () => (
      <div className="flex flex-col gap-3 text-[13px] leading-relaxed">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <Hash className="h-3 w-3" />
          <span>client-rachel-landing-page</span>
        </div>
        <SlackMsg name="Sam" time="8:45 AM">
          Rachel sent feedback on the landing page draft. They like the
          direction but need changes before leadership sees it.
        </SlackMsg>
        <SlackMsg name="Nina" time="8:48 AM" muted>
          What needs to change?
        </SlackMsg>
        <SlackMsg name="Sam" time="8:50 AM">
          Headline is too broad. They want it aimed more at ops teams dealing
          with manual intake&hellip;
        </SlackMsg>
        <SlackMsg name="Sam" time="8:56 AM" muted>
          Also &ldquo;How it works&rdquo; sounds too technical&hellip;
        </SlackMsg>
      </div>
    ),
  },
  {
    id: "email-thread-bug",
    shortLabel: "Replies",
    channelLabel: "Email thread",
    icon: MessagesSquare,
    summary: "Bug triage",
    Body: () => (
      <div className="flex flex-col gap-2.5 text-[13px] leading-relaxed">
        <div className="font-mono text-[11px] text-muted-foreground">
          Subject: Checkout issue on mobile Safari
        </div>
        <ThreadMsg sender="Mia · PM" time="9:12 AM">
          A customer reported &ldquo;Place Order&rdquo; does nothing on mobile
          Safari. Could be frontend or payment API. Also no loading state
          after tap.
        </ThreadMsg>
        <ThreadMsg sender="Priya · UX" time="9:41 AM">
          Agree on loading state. Button should switch to
          &ldquo;Processing&hellip;&rdquo; with spinner. Order summary drawer
          covers the CTA on smaller screens too.
        </ThreadMsg>
        <ThreadMsg sender="Mia" time="10:03 AM">
          Let&rsquo;s split: bug for the Safari tap, separate UX task for
          loading/error state, plus verify the API for duplicate
          requests&hellip;
        </ThreadMsg>
      </div>
    ),
  },
  {
    id: "texts-event",
    shortLabel: "Texts",
    channelLabel: "Group chat",
    icon: MessageSquare,
    summary: "Event prep",
    Body: () => (
      <div className="flex flex-col gap-2 text-[13px] leading-relaxed">
        <div className="text-center font-mono text-[11px] text-muted-foreground">
          TechOps Expo &mdash; Group chat
        </div>
        <Bubble side="left" name="Dana" time="10:18">
          TechOps Expo is next Thursday. Need to make sure everything is ready
          before we ship materials.
        </Bubble>
        <Bubble side="left" name="Dana">
          Finalize booth banner + tabletop signage by EOD tomorrow &mdash; old
          tagline is still on them.
        </Bubble>
        <Bubble side="right" name="Jordan" time="10:29">
          Good catch. I&rsquo;ll update the QR code and export the final PDF.
        </Bubble>
        <Bubble side="left" name="Dana">
          Sales — confirm booth coverage 11 AM &ndash; 2 PM. Elise — confirm
          monitor, tablecloth, scanner&hellip;
        </Bubble>
      </div>
    ),
  },
  {
    id: "personal-trip",
    shortLabel: "Personal",
    channelLabel: "Group email",
    icon: Users,
    summary: "Trip planning",
    Body: () => (
      <div className="flex flex-col gap-2.5 text-[13px] leading-relaxed">
        <div className="flex flex-col gap-0.5 border-b border-border/60 pb-2 font-mono text-[11px] text-muted-foreground">
          <span>
            <span className="text-foreground/80">From:</span> Maya
          </span>
          <span>
            <span className="text-foreground/80">Subject:</span> Yosemite
            camping plan
          </span>
        </div>
        <p className="text-foreground">Hi everyone,</p>
        <p className="text-muted-foreground">
          For the Yosemite trip, let&rsquo;s leave Sept 28 at 6 AM and stay 5
          days. Someone confirm the campsite reservation + check-in time?
        </p>
        <p className="text-muted-foreground">
          Jordan — handle the shared food list (breakfasts, sandwich supplies,
          snacks, coffee, dinners). Alex — gear list (tents, sleeping bags,
          first aid, bear-safe storage).
        </p>
        <p className="text-muted-foreground">
          Chris — scout one moderate hike for day 1 and a longer one
          later&hellip;
        </p>
      </div>
    ),
  },
];

export function ConversationsAccordion() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="features" className="bg-muted/30 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-16">
          {/* LEFT: header */}
          <div className="text-center lg:text-left">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Use cases
            </span>
            <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Turn messy conversations into{" "}
              <span className="relative inline-block">
                <span className="relative z-10">organized action</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 z-0 h-3 bg-primary/25 sm:bottom-1.5 sm:h-3.5"
                />
              </span>
              .
            </h2>
            <p className="mt-5 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
              Convert long emails, Slack threads, texts, and support
              conversations into clear Kanban cards with issue summaries and
              suggested fixes.
            </p>
          </div>

          {/* RIGHT: accordion */}
          <ul
            className="flex flex-row items-stretch gap-2 sm:gap-3"
            role="tablist"
            aria-label="Conversation examples"
          >
            {CONVERSATIONS.map((conv, i) => {
              const isActive = i === activeIndex;
              return (
                <motion.li
                  key={conv.id}
                  layout
                  transition={{
                    layout: { duration: 0.55, ease: [0.32, 0.72, 0, 1] },
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  onFocus={() => setActiveIndex(i)}
                  className={`relative h-115 overflow-hidden rounded-2xl border border-border bg-card shadow-sm ${
                    isActive
                      ? "flex-1 cursor-default"
                      : "w-12 cursor-pointer sm:w-14"
                  }`}
                  style={{ flexShrink: 0 }}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`conv-panel-${conv.id}`}
                    onClick={() => setActiveIndex(i)}
                    className={`absolute inset-0 z-20 ${
                      isActive ? "pointer-events-none" : ""
                    }`}
                    tabIndex={isActive ? -1 : 0}
                  >
                    <span className="sr-only">{conv.channelLabel}</span>
                  </button>

                  {/* Collapsed state: vertical label rail */}
                  <AnimatePresence initial={false}>
                    {!isActive && (
                      <motion.div
                        key="collapsed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex flex-col items-center justify-between bg-linear-to-b from-muted/40 to-muted/10 py-5"
                      >
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <conv.icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground [writing-mode:vertical-rl] rotate-180">
                          {conv.shortLabel}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground/70">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Active state: full conversation panel */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        key="active"
                        id={`conv-panel-${conv.id}`}
                        role="tabpanel"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="absolute inset-0 flex flex-col"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <conv.icon className="h-3.5 w-3.5" />
                            </span>
                            <div className="flex flex-col leading-tight">
                              <span className="text-xs font-medium text-foreground">
                                {conv.channelLabel}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {conv.summary}
                              </span>
                            </div>
                          </div>
                          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
                            {String(i + 1).padStart(2, "0")} /{" "}
                            {String(CONVERSATIONS.length).padStart(2, "0")}
                          </span>
                        </div>

                        {/* Body */}
                        <div className="relative flex-1 overflow-hidden px-5 py-4">
                          <conv.Body />
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-card to-transparent" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- Inline conversation primitives ---------- */

function SlackMsg({
  name,
  time,
  muted = false,
  children,
}: {
  name: string;
  time: string;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-baseline gap-2">
        <span className="text-[13px] font-semibold text-foreground">
          {name}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {time}
        </span>
      </div>
      <p className={muted ? "text-muted-foreground" : "text-foreground"}>
        {children}
      </p>
    </div>
  );
}

function ThreadMsg({
  sender,
  time,
  children,
}: {
  sender: string;
  time: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-semibold text-foreground">
          {sender}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {time}
        </span>
      </div>
      <p className="mt-1 text-muted-foreground">{children}</p>
    </div>
  );
}

function Bubble({
  side,
  name,
  time,
  children,
}: {
  side: "left" | "right";
  name?: string;
  time?: string;
  children: React.ReactNode;
}) {
  const isRight = side === "right";
  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div className="flex max-w-[85%] flex-col gap-0.5">
        {name && (
          <span
            className={`font-mono text-[10px] text-muted-foreground ${
              isRight ? "text-right" : "text-left"
            }`}
          >
            {name}
            {time ? ` · ${time}` : ""}
          </span>
        )}
        <div
          className={`rounded-2xl px-3 py-2 text-[13px] leading-snug ${
            isRight
              ? "rounded-br-md bg-primary/15 text-foreground"
              : "rounded-bl-md bg-muted text-foreground"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
