"use client";

// Interactive tour for /try/*. Runs unless the visitor has completed or
// dismissed it this session (both flags live in DemoProvider → refresh wipes
// them). Steps span multiple routes; joyride waits for a target to mount
// when the user navigates (targetWaitTimeout 30s).
import { usePathname } from "next/navigation";
import {
  Joyride,
  type EventData,
  type Step,
  STATUS,
  ACTIONS,
} from "react-joyride";
import { useDemo } from "./demo-provider";

const STEPS: Step[] = [
  {
    target: "body",
    placement: "center",
    title: "Welcome to kamotion",
    content:
      "This is the real app running against a sandbox — drag cards, edit fields, generate new ones. Nothing is saved; refresh to reset.",
  },
  {
    target: '[data-tour="generate-link"]',
    title: "Start by generating cards",
    content:
      "Click Generate Task(s). In the real app you paste an email, a transcript, anything — the AI extracts structured cards.",
    placement: "right",
  },
  {
    target: '[data-tour="picker-cards"]',
    title: "Pick a source",
    content:
      "In the demo you can't paste freely, so pick one of three curated sources. Each shows how kamotion parses a different kind of input.",
    placement: "bottom",
  },
  {
    target: '[data-tour="extract-button"]',
    title: "Extract cards",
    content:
      "Now click Extract. The AI returns structured cards — you'll review and edit them before they land on the board.",
    placement: "top",
  },
  {
    target: '[data-tour="add-to-queue"]',
    title: "Add to the board",
    content:
      "Tweak titles, assignees, dates, priorities — drop any cards you don't want. Then click Add to Queue.",
    placement: "top",
  },
  {
    target: '[data-tour="board-columns"]',
    title: "Your board",
    content:
      "Drag cards between columns to update their status. Click any card to edit every field in the drawer.",
    placement: "top",
  },
  {
    target: "body",
    placement: "center",
    title: "You've got it",
    content:
      "Explore Gantt for the timeline, Team to manage assignees, or just drag cards around. Nothing saves — refresh to reset the sandbox.",
  },
];

export function DemoTour() {
  const {
    tourStep,
    setTourStep,
    tourSkipped,
    tourCompleted,
    skipTour,
    completeTour,
  } = useDemo();
  const pathname = usePathname();

  const handleEvent = (data: EventData) => {
    const { status, action, index, type } = data;

    if (status === STATUS.SKIPPED || action === ACTIONS.CLOSE) {
      skipTour();
      return;
    }
    if (status === STATUS.FINISHED) {
      completeTour();
      return;
    }
    // Advance our controlled stepIndex after joyride finishes a step and the
    // user hit Next/Back.
    if (type === "step:after") {
      if (action === ACTIONS.NEXT) setTourStep(index + 1);
      else if (action === ACTIONS.PREV) setTourStep(Math.max(0, index - 1));
    }
  };

  const running = !tourSkipped && !tourCompleted && pathname.startsWith("/try");

  return (
    <Joyride
      steps={STEPS}
      stepIndex={tourStep}
      run={running}
      continuous
      onEvent={handleEvent}
      options={{
        primaryColor: "#14b8a6",
        overlayColor: "rgba(15, 23, 42, 0.55)",
        textColor: "#0f172a",
        backgroundColor: "#ffffff",
        arrowColor: "#ffffff",
        skipBeacon: true,
        overlayClickAction: false,
        closeButtonAction: "skip",
        showProgress: true,
        buttons: ["back", "close", "primary", "skip"],
        zIndex: 60,
        targetWaitTimeout: 30_000,
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip tour",
      }}
    />
  );
}
