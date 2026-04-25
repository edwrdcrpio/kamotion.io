"use client";

// Interactive tour for /try/*. Runs unless the visitor has completed or
// dismissed it this session (both flags live in DemoProvider → refresh wipes
// them). Most transitions are action-gated: the user advances by clicking
// the highlighted element, not a generic "Next" button.
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Joyride,
  type EventData,
  type Step,
  STATUS,
  ACTIONS,
} from "react-joyride";
import { useDemo } from "./demo-provider";

// Each step's target lives on one of these routes; used to auto-advance when
// the user navigates by clicking the spotlit element. The "Your board" slot
// after Add to Queue is handled by <DragHintDialog> rather than a joyride
// step — avoids competing modals on /try.
const STEP_ROUTES: Record<number, string> = {
  0: "/try",
  1: "/try",
  2: "/try/generate",
  3: "/try/generate",
  4: "/try/generate",
  5: "/try",
};

const STEPS: Step[] = [
  {
    target: "body",
    placement: "center",
    title: "Welcome to kamotion",
    content:
      "This is the real app running against a sandbox — drag cards, edit fields, generate new ones. Nothing is saved; refresh to reset.",
    buttons: ["primary"],
    locale: { next: "Begin" },
  },
  {
    target: '[data-tour="generate-link"]',
    title: "Start by generating cards",
    content:
      "Click Generate Task(s) in the sidebar. In the real app you'd paste an email, a transcript, anything — the AI extracts structured cards.",
    placement: "right",
    buttons: ["skip"],
    spotlightPadding: 6,
  },
  {
    target: '[data-tour="picker-cards"]',
    title: "Pick a source",
    content:
      "Each card is a curated example showing how kamotion parses a different kind of input. Pick one, then click Select.",
    placement: "bottom",
    buttons: ["primary", "skip"],
    locale: { next: "Select" },
  },
  {
    target: '[data-tour="extract-button"]',
    title: "Extract cards",
    content:
      "Click Extract. The AI returns structured cards — you'll review and edit them before they land on the board.",
    placement: "top",
    buttons: ["skip"],
  },
  {
    target: '[data-tour="add-to-queue"]',
    title: "Add to the board",
    content:
      "Tweak titles, assignees, dates, priorities — drop any cards you don't want. Then click Add to Queue.",
    placement: "top",
    buttons: ["skip"],
  },
  {
    target: "body",
    placement: "center",
    title: "You've got it",
    content:
      "Explore Gantt for the timeline, Team to manage assignees, or just drag cards around. Nothing saves — refresh to reset the sandbox.",
    buttons: ["primary"],
    locale: { last: "Finish" },
  },
];

// Index of the step whose target only exists while a dialog is open. We
// watch the DOM for its target to mount and advance the tour as soon as the
// user opens the Preview dialog.
const DIALOG_WATCH_STEP = 3;
const DIALOG_TARGET_SELECTOR = '[data-tour="add-to-queue"]';

export function DemoTour() {
  const {
    tourStep,
    setTourStep,
    tourSkipped,
    tourCompleted,
    dragHintDismissed,
    skipTour,
    completeTour,
  } = useDemo();
  const pathname = usePathname();

  // The joyride spotlight + tooltips don't lay out well on phones (the sidebar
  // is in a Sheet drawer, picker cards stack, etc.) and the action-gated
  // transitions assume a desktop interaction model. On <md viewports we just
  // skip the tour entirely and let visitors roam freely. The drag-hint dialog
  // is independent and still fires once the board has cards.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Route-gated advancement: when the user clicks a highlighted link that
  // changes route, jump to the next step on the new route. Only fires when
  // the current step's expected route doesn't match — otherwise multiple
  // steps on the same route would cascade through on mount.
  useEffect(() => {
    if (!isDesktop) return;
    if (tourSkipped || tourCompleted) return;
    const currentRoute = STEP_ROUTES[tourStep];
    if (currentRoute === pathname) return;

    const totalSteps = Object.keys(STEP_ROUTES).length;
    for (let i = tourStep + 1; i < totalSteps; i++) {
      if (STEP_ROUTES[i] === pathname) {
        setTourStep(i);
        return;
      }
    }
    for (let i = tourStep - 1; i >= 0; i--) {
      if (STEP_ROUTES[i] === pathname) {
        setTourStep(i);
        return;
      }
    }
  }, [pathname, tourStep, tourSkipped, tourCompleted, setTourStep, isDesktop]);

  // Dialog-gated advancement: the Preview dialog's Add to Queue button only
  // exists when the user has clicked Extract. Observe the DOM while we're on
  // the Extract step and bump forward as soon as it appears.
  useEffect(() => {
    if (!isDesktop) return;
    if (tourStep !== DIALOG_WATCH_STEP) return;
    if (tourSkipped || tourCompleted) return;
    if (document.querySelector(DIALOG_TARGET_SELECTOR)) {
      setTourStep(DIALOG_WATCH_STEP + 1);
      return;
    }
    const observer = new MutationObserver(() => {
      if (document.querySelector(DIALOG_TARGET_SELECTOR)) {
        setTourStep(DIALOG_WATCH_STEP + 1);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [tourStep, tourSkipped, tourCompleted, setTourStep, isDesktop]);

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
    // Manual Next click (only exists on non-action-gated steps): advance.
    if (type === "step:after" && action === ACTIONS.NEXT) {
      setTourStep(index + 1);
    }
  };

  // The Finish step (index 5) lives on /try alongside <DragHintDialog>. When
  // the drag-hint is still open, pause the tour so the two modals don't
  // compete for focus. As soon as the user clicks Got it, joyride resumes.
  const pausedForDragHint = tourStep === 5 && !dragHintDismissed;
  const running =
    isDesktop &&
    !tourSkipped &&
    !tourCompleted &&
    !pausedForDragHint &&
    pathname.startsWith("/try");

  return (
    <Joyride
      steps={STEPS}
      stepIndex={tourStep}
      run={running}
      continuous
      onEvent={handleEvent}
      options={{
        primaryColor: "#14b8a6",
        overlayColor: "rgba(15, 23, 42, 0.4)",
        textColor: "#0f172a",
        backgroundColor: "#ffffff",
        arrowColor: "#ffffff",
        skipBeacon: true,
        overlayClickAction: false,
        closeButtonAction: "skip",
        showProgress: true,
        buttons: ["primary", "skip"],
        spotlightPadding: 8,
        spotlightRadius: 8,
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
