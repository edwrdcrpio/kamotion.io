"use client";

// MSW bootstrap for the /try/* subtree. Registers the worker BEFORE any child
// renders so their fetch calls get intercepted. Without the ready gate, the
// first Board <-> /api/cards race would leak through to the real backend (and
// bounce to /login).
import { useEffect, useState } from "react";

export function MswBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ setupWorker }, { handlers }] = await Promise.all([
          import("msw/browser"),
          import("./msw-handlers"),
        ]);
        const worker = setupWorker(...handlers);
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
