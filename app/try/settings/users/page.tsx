import { LockedPanel } from "@/components/demo/locked-panel";

export const metadata = { title: "Users" };

export default function TryUsersPage() {
  return (
    <LockedPanel
      title="User admin is maintainer-only"
      description="The Users panel provisions seats and assigns roles. It's locked in the demo because it would let visitors see or change each other's accounts."
    />
  );
}
