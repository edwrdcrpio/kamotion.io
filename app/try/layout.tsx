import type { Metadata } from "next";
import { AppProviders } from "@/app/app/providers";
import { MswBootstrap } from "@/lib/demo/msw-client";
import { DemoProvider } from "@/components/demo/demo-provider";
import { DemoShell } from "@/components/demo/demo-shell";
import { DemoBanner } from "@/components/demo/demo-banner";

export const metadata: Metadata = {
  title: { default: "Try kamotion · demo", template: "%s · try kamotion" },
  description:
    "Interactive demo of kamotion — the real app, seeded with sample data. Nothing saves; refresh to reset.",
};

export default function TryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <MswBootstrap>
        <DemoProvider>
          <AppProviders>
            <DemoShell>{children}</DemoShell>
          </AppProviders>
        </DemoProvider>
      </MswBootstrap>
    </div>
  );
}
