"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/** Wraps next-themes so the App Router layout can stay a server component. */
export function ThemeProvider({
  children,
  ...forwardedProps
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      {...forwardedProps}
    >
      {children}
    </NextThemesProvider>
  );
}
