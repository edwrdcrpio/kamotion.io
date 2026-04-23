import type { Metadata } from "next";
import { AppProviders } from "@/app/app/providers";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Header } from "@/components/app-shell/header";
import { MswBootstrap } from "@/lib/demo/msw-client";
import { DemoProvider } from "@/components/demo/demo-provider";
import { DemoBanner } from "@/components/demo/demo-banner";
import { DemoTour } from "@/components/demo/tour";

export const metadata: Metadata = {
  title: { default: "Try kamotion · demo", template: "%s · try kamotion" },
  description:
    "Interactive demo of kamotion — the real app, seeded with sample data. Nothing saves; refresh to reset.",
};

// Synthesized identity for the demo. Role is 'admin' so every role-gated
// nav item renders; Users + Settings are flagged demoLocked in nav-config
// so they render a lock icon and route to the <LockedPanel> stubs.
const DEMO_PROFILE = {
  full_name: "Sarah Chen",
  email: "sarah@acme.co",
  role: "admin" as const,
};

export default function TryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <MswBootstrap>
        <DemoProvider>
          <AppProviders>
            <div className="flex flex-1 min-h-0">
              <Sidebar role={DEMO_PROFILE.role} demoMode />
              <div className="flex flex-col flex-1 min-w-0">
                <Header
                  name={DEMO_PROFILE.full_name}
                  email={DEMO_PROFILE.email}
                  role={DEMO_PROFILE.role}
                  demoMode
                />
                <div className="flex flex-col flex-1 overflow-auto">
                  {children}
                </div>
              </div>
            </div>
            <DemoTour />
          </AppProviders>
        </DemoProvider>
      </MswBootstrap>
    </div>
  );
}
