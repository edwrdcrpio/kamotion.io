"use client";

// Defensive cleanup for users who already have a stale demo Service Worker
// registered from a prior /try visit. SWs persist across navigation for the
// whole origin, so without this the first /api/cards GET on /app would be
// answered with demo data — making real cards appear to vanish.
//
// Mounted in the root layout. No-op on /try/* (where the SW is supposed to be
// active). On any other route, if a mockServiceWorker registration is found,
// we unregister it and reload the page — SWs continue controlling existing
// clients until reload, so unregister alone wouldn't unblock the current page.
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const RELOAD_FLAG = "kamotion:msw-swept";

export function MswSweeper() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname?.startsWith("/try")) return;
    if (!("serviceWorker" in navigator)) return;
    // Avoid reload loops if unregister somehow leaves a registration behind.
    if (window.sessionStorage.getItem(RELOAD_FLAG) === "1") return;

    let cancelled = false;
    (async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        const mocks = regs.filter((r) => {
          const url = r.active?.scriptURL ?? r.installing?.scriptURL ?? "";
          return url.includes("mockServiceWorker");
        });
        if (mocks.length === 0) return;
        await Promise.all(mocks.map((r) => r.unregister()));
        if (cancelled) return;
        window.sessionStorage.setItem(RELOAD_FLAG, "1");
        window.location.reload();
      } catch {
        // best-effort
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
