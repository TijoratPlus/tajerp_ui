import type { Meta, StoryObj } from "@storybook/react";
import { OfflineIndicator, SyncStatus, TajUIProvider } from "../../src";

const meta: Meta<typeof SyncStatus> = {
  title: "Components/POS/OfflineIndicator",
  component: SyncStatus,
  parameters: {
    docs: {
      description: {
        component:
          "Connection and sync state for the offline-first POS. `SyncStatus` shows online / offline / syncing / error with an icon and text (never colour alone), how many sales are queued, when the last sync happened, and a retry button after a failure. `OfflineIndicator` wires it to the browser's connection via `useOnlineStatus()` — toggle the network in devtools to see it change. Use the compact variant in the POS header and the full one in a status bar.",
      },
    },
  },
  args: { status: "offline", pending: 3, variant: "full" },
  argTypes: {
    status: { control: "inline-radio", options: ["online", "offline", "syncing", "error"] },
    variant: { control: "inline-radio", options: ["full", "compact"] },
    onRetry: { action: "retry" },
  },
};
export default meta;

type Story = StoryObj<typeof SyncStatus>;

export const Playground: Story = {};

export const AllStates: Story = {
  render: () => {
    const synced = Date.now() - 4 * 60_000;
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <SyncStatus status="online" lastSyncedAt={synced} />
        <SyncStatus status="offline" pending={3} lastSyncedAt={synced} />
        <SyncStatus status="syncing" pending={3} />
        <SyncStatus status="error" pending={5} lastSyncedAt={synced} onRetry={() => {}} />
        <div style={{ display: "flex", gap: 20 }}>
          <SyncStatus variant="compact" status="online" />
          <SyncStatus variant="compact" status="offline" pending={3} />
          <SyncStatus variant="compact" status="syncing" pending={1} />
          <SyncStatus variant="compact" status="error" pending={5} onRetry={() => {}} />
        </div>
      </div>
    );
  },
};

export const LiveConnection: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      <OfflineIndicator pending={2} lastSyncedAt={Date.now() - 90_000} />
      <OfflineIndicator variant="compact" pending={2} />
    </div>
  ),
};

export const Tajik: Story = {
  render: () => (
    <TajUIProvider locale="tg">
      <div style={{ display: "grid", gap: 12 }}>
        <SyncStatus status="offline" pending={4} />
        <SyncStatus status="error" onRetry={() => {}} lastSyncedAt={Date.now() - 3_600_000} />
      </div>
    </TajUIProvider>
  ),
};
