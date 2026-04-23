import { LockedPanel } from "@/components/demo/locked-panel";

export const metadata = { title: "Settings" };

export default function TrySettingsPage() {
  return (
    <LockedPanel
      title="Settings live behind sign-in"
      description="Settings configure your AI provider and processing path. In the demo we seed a fixed configuration — log in to the real app to wire your own keys."
    />
  );
}
