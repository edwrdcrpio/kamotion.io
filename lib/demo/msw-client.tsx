"use client";

// MSW bootstrap for the /try/* subtree. Registers the worker BEFORE any child
// renders so their fetch calls get intercepted. Without the ready gate, the
// first Board <-> /api/cards race would leak through to the real backend (and
// bounce to /login).
//
// On unmount (e.g. user exits /try → /login → /app) we stop the worker AND
// unregister the service worker so it can't keep intercepting fetches on the
// real app and serve demo cards in place of the user's real ones.
import { useEffect, useRef, useState } from "react";

type StoppableWorker = { stop: () => void };

async function unregisterMockServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => {
          const url = r.active?.scriptURL ?? r.installing?.scriptURL ?? "";
          return url.includes("mockServiceWorker");
        })
        .map((r) => r.unregister()),
    );
  } catch {
    // best-effort cleanup
  }
}

export function MswBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const workerRef = useRef<StoppableWorker | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ setupWorker }, { handlers }] = await Promise.all([
          import("msw/browser"),
          import("./msw-handlers"),
        ]);
        const worker = setupWorker(...handlers);
        workerRef.current = worker;
        await worker.start({
          onUnhandledRequest: "bypass",
          serviceWorker: { url: "/mockServiceWorker.js" },
          quiet: true,
        });
      } catch (err) {
        console.error("[demo] msw bootstrap failed", err);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
      try {
        workerRef.current?.stop();
      } catch {
        // ignore
      }
      void unregisterMockServiceWorker();
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Loading demo…
      </div>
    );
  }
  return <>{children}</>;
}
