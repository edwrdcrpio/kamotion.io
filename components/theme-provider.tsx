"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

// The demo subtree (/try/*) forces light — the dark default is too dim for a
// first-impression tour, and a single consistent theme keeps the curated
// screenshots matching. next-themes' forcedTheme doesn't touch localStorage,
// so the user's real preference is preserved for when they leave the demo.
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname();
  const forced = pathname?.startsWith("/try") ? "light" : undefined;
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      forcedTheme={forced}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
