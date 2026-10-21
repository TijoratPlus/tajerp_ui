import * as React from "react";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

const getSnapshot = () =>
  typeof navigator === "undefined" || typeof navigator.onLine !== "boolean"
    ? true
    : navigator.onLine;

// The server cannot know; assume online so markup does not flash "offline".
const getServerSnapshot = () => true;

/**
 * Whether the browser reports a network connection (`navigator.onLine`),
 * updated on the window `online` / `offline` events. SSR-safe: renders as
 * online on the server. Note that `true` only means a network interface is
 * up — the API itself may still be unreachable.
 */
export function useOnlineStatus(): boolean {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
