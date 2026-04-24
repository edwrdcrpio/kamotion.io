import type { Priority, Status, Column } from "@/lib/validators";

// A pre-generated demo card. `dueDayOffset` is relative to today at render
// time so dates stay fresh regardless of when a visitor arrives.
export type DemoCard = {
  task: string;
  assignee: string;
  requester: string;
  estimated_duration: string | null;
  dueDayOffset: number | null;
  priority: Priority;
  status: Status;
  column_name: Column;
  notes: string | null;
};

export type DemoExample = {
  id: "email" | "text" | "transcript" | "wedding" | "moving";
  label: string;
  sourceLabel: string;
  description: string;
  source: string;
  cards: DemoCard[];
};

// Shared demo team roster. Used for assignee/requester pickers on /try.
export const DEMO_TEAM = [
  { name: "Sarah Chen", email: "sarah@acme.co", role: "Marketing Lead" },
  { name: "Jamie Liu", email: "jamie@acme.co", role: "Content" },
  { name: "Dana Park", email: "dana@acme.co", role: "Design" },
  { name: "Ari Shore", email: "ari@acme.co", role: "Legal" },
  { name: "Priya Mehta", email: "priya@acme.co", role: "IT Lead" },
  { name: "Sam Torres", email: "sam@acme.co", role: "IT Engineer" },
  { name: "Casey Brooks", email: "casey@acme.co", role: "Web Ops" },
  { name: "Morgan Reyes", email: "morgan@acme.co", role: "Web Ops" },
  { name: "Lucy Lu", email: "lucy@acme.co", role: "PM" },
] as const;

export const DEMO_EXAMPLES: DemoExample[] = [
  /* ─────────────────────── EXAMPLE 1 · EMAIL THREAD ─────────────────────── */
  {
    id: "email",
    label: "Email thread",
    sourceLabel: "Internal email — Q3 launch prep",
    description:
      "Your marketing lead pings the team about Q3 launch blockers",
    source: `From: Sarah Chen <sarah@acme.co>
To: Marketing team
Subject: Re: Q3 launch prep — where are we?

Hey team — quick sync on where we are for the product launch next month.

Marketing deliverables status:
- Landing page copy is done but we need fresh hero images. Can someone ping the design freelancer? I think we paid her through January so she owes us one revision round.
- Blog announcement draft is 80% there. I'll finish it this week but need legal to review the compliance section before we publish. Hard deadline: Oct 15.
- Social media assets for launch day — we have NOTHING. This is blocking everything else. High priority, need a plan today.
- Also we need to refresh the press kit on the website. The current one has Q1 screenshots which look ancient.
- Jamie — can you follow up on the customer email sequence? You said you'd own the first draft but I haven't seen anything yet.

Let me know what's blocking any of these and I'll help unstick.

— Sarah`,
    cards: [
      {
        task: "Request hero-image revisions from design freelancer",
        assignee: "Dana Park",
        requester: "Sarah Chen",
        estimated_duration: "1h",
        dueDayOffset: 3,
        priority: "Normal",
        status: "Ready",
        column_name: "Ready",
        notes:
          "Contract runs through January — one revision round already paid for. Confirm turnaround before launch.",
      },
      {
        task: "Finish Q3 launch blog announcement draft",
        assignee: "Sarah Chen",
        requester: "Sarah Chen",
        estimated_duration: "4h",
        dueDayOffset: 7,
        priority: "Normal",
        status: "Ready",
        column_name: "Ready",
        notes:
          "80% complete. Compliance section still needs pass from legal before publish.",
      },
      {
        task: "Legal review of blog compliance section",
        assignee: "Ari Shore",
        requester: "Sarah Chen",
        estimated_duration: "2h",
        dueDayOffset: 14,
        priority: "High",
        status: "Ready",
        column_name: "Ready",
        notes:
          "Hard deadline Oct 15. Blocks blog publish and downstream social posts.",
      },
      {
        task: "Produce social media assets for launch day",
        assignee: "Dana Park",
        requester: "Sarah Chen",
        estimated_duration: "8h",
        dueDayOffset: 10,
        priority: "High",
        status: "Ready",
        column_name: "Ready",
        notes:
          "Currently have nothing — blocking all launch-day promo. Need templates for X, LinkedIn, and Instagram.",
      },
      {
        task: "Follow up with Jamie on customer email sequence draft",
        assignee: "Jamie Liu",
        requester: "Sarah Chen",
        estimated_duration: "30m",
        dueDayOffset: 2,
        priority: "Normal",
        status: "Ready",
        column_name: "Ready",
        notes:
          "Jamie agreed to own the first draft but nothing delivered yet. Confirm scope + new ETA.",
      },
    ],
  },

  /* ────────────────────── EXAMPLE 2 · TEXT CONVERSATION ─────────────────── */
  {
    id: "text",
    label: "Text conversation",
    sourceLabel: "iMessage — Casey & Morgan",
    description:
      "A coworker texts you about bugs they spotted on the pricing page",
    source: `Casey · 2:14 PM
hey are you seeing this

Morgan · 2:14 PM
seeing what

Casey · 2:15 PM
the pricing page. all the plan cards are rendering in BLUE. they should be brand green

Morgan · 2:15 PM
oh weird let me check
yeah confirmed, same on mobile
also fyi the "Contact sales" button on that page is broken — goes to a 404

Casey · 2:17 PM
lol this launched yesterday how did nobody catch this

Morgan · 2:18 PM
we also need to add the new customer logos — stripe and notion approval came through this week

Casey · 2:18 PM
yeah and the FAQ on that page is still showing last year's pricing numbers 🤦

Morgan · 2:19 PM
ok i'll file these. the broken button has to go first`,
    cards: [
      {
        task: "Fix broken Contact Sales button on pricing page (404)",
        assignee: "Jamie Liu",
        requester: "Morgan Reyes",
        estimated_duration: "30m",
        dueDayOffset: 1,
        priority: "High",
        status: "Ready",
        column_name: "Ready",
        notes:
          "Button returns 404 instead of loading contact form. Launched yesterday — active conversion leak.",
      },
      {
        task: "Fix pricing page cards rendering in blue instead of brand green",
        assignee: "Jamie Liu",
        requester: "Casey Brooks",
        estimated_duration: "1h",
        dueDayOffset: 2,
        priority: "Normal",
        status: "Ready",
        column_name: "Ready",
        notes:
          "Reproduces on mobile. Regression from yesterday's launch — likely a CSS token mixup.",
      },
      {
        task: "Add Stripe and Notion logos to customer strip",
        assignee: "Dana Park",
        requester: "Morgan Reyes",
        estimated_duration: "1h",
        dueDayOffset: null,
        priority: "Low",
        status: "Ready",
        column_name: "Ready",
        notes: "Approval received this week — drop into the existing logo grid.",
      },
      {
        task: "Update pricing-page FAQ with current year's numbers",
        assignee: "Jamie Liu",
        requester: "Casey Brooks",
        estimated_duration: "30m",
        dueDayOffset: 4,
        priority: "Normal",
        status: "Ready",
        column_name: "Ready",
        notes: "Still showing last year's pricing — minor but embarrassing.",
      },
    ],
  },

  /* ────────────────────── EXAMPLE 3 · ZOOM TRANSCRIPT ───────────────────── */
  {
    id: "transcript",
    label: "Zoom transcript",
    sourceLabel: "Weekly IT sync — Priya & Sam",
    description:
      "Your weekly IT sync covers a VPN crisis and a SOC-2 deadline",
    source: `[Transcript · Weekly IT sync · 9:00 AM]

Priya: OK, let's run through open IT items. Sam, lead us off.

Sam: Yeah, first thing — VPN is unstable for the remote team, mostly folks on the east coast. They're getting dropped every ~20 minutes. Happened three times yesterday during client calls. Pretty urgent.

Priya: Agreed. Cause?

Sam: Best guess is the firewall firmware update we pushed last Thursday. I need to roll it back and test.

Priya: Do it today. What else?

Sam: Two user-account issues. Jordan in sales locked themselves out again. And the new hire Taylor hasn't gotten initial credentials yet — their start date was Monday.

Priya: Taylor is blocking. They can't do anything without creds.

Sam: Right. Also the shared drive is almost full — 94% on the team file server. Need to archive old project folders from 2024 or upgrade the storage.

Priya: Archive first, upgrade only if we can't recover enough.

Sam: Printer on the third floor has been offline for a week. No one's complained loudly but it's costing us printouts.

Priya: Low priority. Last?

Sam: SOC-2 auditor flagged that we haven't rotated the API keys on our internal metrics service for 18 months. 30-day remediation window to rotate and document.

Priya: File that with a hard date. Thanks Sam.`,
    cards: [
      {
        task: "Roll back firewall firmware to fix VPN instability",
        assignee: "Sam Torres",
        requester: "Priya Mehta",
        estimated_duration: "4h",
        dueDayOffset: 0,
        priority: "High",
        status: "Ready",
        column_name: "Ready",
        notes:
          "East coast team getting dropped every ~20 min. Caused 3 interruptions during client calls yesterday. Suspected cause: firmware update pushed last Thursday.",
      },
      {
        task: "Provision credentials for new hire Taylor",
        assignee: "Sam Torres",
        requester: "Priya Mehta",
        estimated_duration: "30m",
        dueDayOffset: 0,
        priority: "High",
        status: "Ready",
        column_name: "Ready",
        notes: "Start date was Monday. Blocked on everything without creds.",
      },
      {
        task: "Reset Jordan's locked sales account",
        assignee: "Sam Torres",
        requester: "Priya Mehta",
        estimated_duration: "30m",
        dueDayOffset: 1,
        priority: "Normal",
        status: "Ready",
        column_name: "Ready",
        notes: "Repeat lockout. Consider pushing SSO for sales team.",
      },
      {
        task: "Archive 2024 project folders from team file server",
        assignee: "Sam Torres",
        requester: "Priya Mehta",
        estimated_duration: "4h",
        dueDayOffset: 7,
        priority: "Normal",
        status: "Ready",
        column_name: "Ready",
        notes:
          "Shared drive at 94% capacity. Archive old folders first; only upgrade storage if that doesn't recover enough room.",
      },
      {
        task: "Reconnect third-floor office printer",
        assignee: "Sam Torres",
        requester: "Priya Mehta",
        estimated_duration: "30m",
        dueDayOffset: null,
        priority: "Low",
        status: "Ready",
        column_name: "Ready",
        notes: "Offline for ~1 week. No active complaints but productivity tax.",
      },
      {
        task: "Rotate internal metrics API keys and document for SOC-2",
        assignee: "Sam Torres",
        requester: "Priya Mehta",
        estimated_duration: "2h",
        dueDayOffset: 28,
        priority: "High",
        status: "Ready",
        column_name: "Ready",
        notes:
          "SOC-2 auditor flagged: API keys haven't rotated in 18 months. 30-day remediation window — include rotation runbook in the documentation.",
      },
    ],
  },

  /* ─────────────────────── EXAMPLE 4 · WEDDING CHAT ─────────────────────── */
  {
    id: "wedding",
    label: "Wedding group chat",
    sourceLabel: "Group chat — Maya & Dev's wedding",
    description:
      "A friend's wedding is three weeks out and the group chat is exploding",
    source: `Maya · 9:12 AM
ok friends, 3 weeks out. dropping my brain before i lose it again 😭

Maya · 9:13 AM
florist still hasn't confirmed the centerpieces. i emailed last thurs and nothing back. someone please nudge them

Dev · 9:14 AM
i can call them this afternoon

Maya · 9:14 AM
🙏 also rsvps — still missing my cousin's side. last count was 11 unconfirmed. we need that for the caterer's final headcount by friday

Priya · 9:16 AM
i'll text them all today, promise

Maya · 9:17 AM
omg thank you. and SHOES. dress alterations are done but i still need to break the shoes in, rn they feel like a torture device

Maya · 9:19 AM
ALSO the playlist. we said 3 hours and i've got like 45 min of songs, everyone please drop faves in the doc

Priya · 9:20 AM
done earlier, check the "reception" tab

Maya · 9:22 AM
ur amazing. last thing — the hotel block. two guests texted asking and i genuinely don't remember if the deadline passed or not. can someone check the contract?

Dev · 9:23 AM
on it`,
    cards: [
      {
        task: "Nudge florist for centerpiece confirmation",
        assignee: "Dev",
        requester: "Maya",
        estimated_duration: "15m",
        dueDayOffset: 0,
        priority: "High",
        status: "Ready",
        column_name: "Ready",
        notes:
          "Maya emailed Thursday, no reply yet. Wedding is 3 weeks out — blocking the final head count.\n\nKamotion Tip: Phone before another email; florists often miss the first note. Ask for an ETA in writing regardless.",
      },
      {
        task: "Collect the 11 outstanding RSVPs for caterer headcount",
        assignee: "Priya",
        requester: "Maya",
        estimated_duration: "1h",
        dueDayOffset: 1,
        priority: "High",
        status: "Ready",
        column_name: "Ready",
        notes:
          "Cousin's side — 11 unconfirmed. Caterer needs final count by Friday.\n\nKamotion Tip: Text with a yes/no reply option (no 'let me check'). If no reply by tomorrow evening, mark as 'not coming' and move on.",
      },
      {
        task: "Break in the wedding shoes before the day",
        assignee: "Maya",
        requester: "Maya",
        estimated_duration: null,
        dueDayOffset: 19,
        priority: "Normal",
        status: "Ready",
        column_name: "Ready",
        notes:
          "Dress alterations done; shoes still need wearing in. Three weeks to go.\n\nKamotion Tip: 20 minutes a day on a hard floor (not carpet). Leather stretches with heat + wear, not just time.",
      },
      {
        task: "Add favorite songs to the reception playlist",
        assignee: "Me",
        requester: "Maya",
        estimated_duration: "30m",
        dueDayOffset: 2,
        priority: "Low",
        status: "Ready",
        column_name: "Ready",
        notes:
          "45 minutes covered so far, 3 hours needed. Songs go in the 'reception' tab of the shared doc.",
      },
      {
        task: "Check hotel contract for room-block deadline",
        assignee: "Dev",
        requester: "Maya",
        estimated_duration: "20m",
        dueDayOffset: 0,
        priority: "Normal",
        status: "Ready",
        column_name: "Ready",
        notes:
          "Two guests are asking; Maya isn't sure if the deadline already passed.\n\nKamotion Tip: Before answering guests, call the hotel — passed deadlines can often be extended by 48hrs with one phone call.",
      },
    ],
  },

  /* ──────────────────── EXAMPLE 5 · MOVING CHECKLIST ────────────────────── */
  {
    id: "moving",
    label: "Moving checklist",
    sourceLabel: "Note to self — moving in 2 weeks",
    description: "A late-night brain-dump note before a cross-town move",
    source: `Two weeks til move day. Things i keep forgetting:

- schedule uhaul for sat morning — 15ft, maybe 20ft if the couch doesn't break down
- transfer utilities. electric and internet should start at the new place same day. old place shuts off tuesday the 12th
- KIDS SCHOOL RECORDS. registrar said they need 48hrs notice to pull files, so call them MONDAY
- find someone for the piano. too heavy and too delicate, movers won't touch it. ask carlos — he knows guys
- cancel gym membership. 30 day notice so do it today
- measure the new kitchen before we buy anything new. the fridge might not fit
- get renter's insurance for the new place, the landlord needs proof of coverage by move day

lmao this list`,
    cards: [
      {
        task: "Book 15ft U-Haul for Saturday move day",
        assignee: "Me",
        requester: "Me",
        estimated_duration: "20m",
        dueDayOffset: 3,
        priority: "High",
        status: "Ready",
        column_name: "Ready",
        notes:
          "Two weeks out. 15ft default; go to 20ft only if the couch doesn't break down.\n\nKamotion Tip: Book this week — weekend slots on U-Haul sell out ~10 days ahead, especially end-of-month.",
      },
      {
        task: "Transfer electric + internet to new address (start move-day)",
        assignee: "Me",
        requester: "Me",
        estimated_duration: "1h",
        dueDayOffset: 5,
        priority: "High",
        status: "Ready",
        column_name: "Ready",
        notes:
          "Both utilities need to activate at new place on move day; old place shuts off the 12th.\n\nKamotion Tip: Schedule new electric first — some providers need 3-5 business days to activate. Internet is usually faster.",
      },
      {
        task: "Call school registrar Monday to request kids' records (48hr notice)",
        assignee: "Me",
        requester: "Me",
        estimated_duration: "20m",
        dueDayOffset: 4,
        priority: "High",
        status: "Ready",
        column_name: "Ready",
        notes:
          "Registrar needs 48 hours to pull files.\n\nKamotion Tip: Ask whether records go by mail or can be picked up sealed — pickup avoids lost-mail risk and is usually faster.",
      },
      {
        task: "Find a specialty piano mover (ask Carlos first)",
        assignee: "Me",
        requester: "Me",
        estimated_duration: "30m",
        dueDayOffset: 7,
        priority: "Normal",
        status: "Ready",
        column_name: "Ready",
        notes:
          "U-Haul movers won't touch it. Carlos may have referrals.\n\nKamotion Tip: Start with Carlos for a trusted referral; otherwise search 'piano movers + [city]' — flat $300-500 is cheaper than damage.",
      },
      {
        task: "Cancel gym membership today (30-day notice)",
        assignee: "Me",
        requester: "Me",
        estimated_duration: "15m",
        dueDayOffset: 0,
        priority: "High",
        status: "Ready",
        column_name: "Ready",
        notes:
          "30-day notice required; time-sensitive.\n\nKamotion Tip: Send cancellation in writing (email or member portal) and screenshot the confirmation — many gyms dispute verbal cancellations.",
      },
    ],
  },
];
