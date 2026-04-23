"use client";

// DemoProvider — carries demo-mode state down through /try/*.
// Intentionally separate from Supabase session: /try has no real auth,
// only a synthesized "Demo · Sarah Chen" identity so the AppShell header
// and any role-gated UI can render believably.
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Role } from "@/lib/validators";

export type DemoProfile = {
  full_name: string;
  email: string;
  role: Role;
};

export type DemoContextValue = {
  profile: DemoProfile;
  // Tour state — consumed by <DemoTour> (Batch 6).
  tourStep: number;
  setTourStep: (n: number) => void;
  tourCompleted: boolean;
  completeTour: () => void;
  tourSkipped: boolean;
  skipTour: () => void;
  // Drag-hint modal (Batch 7).
  dragHintDismissed: boolean;
  dismissDragHint: () => void;
};

const DEMO_PROFILE: DemoProfile = {
  full_name: "Sarah Chen",
  email: "sarah@acme.co",
  role: "admin",
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [tourStep, setTourStep] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [tourSkipped, setTourSkipped] = useState(false);
  const [dragHintDismissed, setDragHintDismissed] = useState(false);

  const completeTour = useCallback(() => setTourCompleted(true), []);
  const skipTour = useCallback(() => setTourSkipped(true), []);
  const dismissDragHint = useCallback(() => setDragHintDismissed(true), []);

  const value = useMemo<DemoContextValue>(
    () => ({
      profile: DEMO_PROFILE,
      tourStep,
      setTourStep,
      tourCompleted,
      completeTour,
      tourSkipped,
      skipTour,
      dragHintDismissed,
      dismissDragHint,
    }),
    [
      tourStep,
      tourCompleted,
      completeTour,
      tourSkipped,
      skipTour,
      dragHintDismissed,
      dismissDragHint,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error("useDemo must be used inside <DemoProvider>");
  }
  return ctx;
}

// Safe variant for shared components that may render outside /try.
// Returns null instead of throwing so real-app renders aren't affected.
export function useDemoSafe(): DemoContextValue | null {
  return useContext(DemoContext);
}
