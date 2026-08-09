"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

// Hydration probe: the server snapshot is always `false` and the client
// snapshot always `true`, so the first client render matches the server and the
// second reflects reality.
const subscribeWithoutUpdates = () => () => {};
const getHydratedSnapshot = () => true;
const getServerSnapshot = () => false;

/** The action lives in the accessible name; the visible text is the current value. */
export function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const translateNav = useTranslations("nav");
  const translateTheme = useTranslations("theme");
  const hasHydrated = useSyncExternalStore(
    subscribeWithoutUpdates,
    getHydratedSnapshot,
    getServerSnapshot,
  );

  const themeLabels: Record<string, string> = {
    light: translateTheme("light"),
    dark: translateTheme("dark"),
  };

  // `resolvedTheme` is undefined until next-themes reads the DOM on the client.
  let currentThemeLabel = "…";
  if (hasHydrated && resolvedTheme) {
    currentThemeLabel = themeLabels[resolvedTheme] ?? resolvedTheme;
  }

  // Keyed off `resolvedTheme`, not `theme`: when the stored theme is "system"
  // only the resolved value says what the user is actually looking at.
  function toggleTheme() {
    if (resolvedTheme === "dark") {
      setTheme("light");
      return;
    }
    setTheme("dark");
  }

  return (
    <button
      type="button"
      className="control-button"
      aria-label={translateNav("toggleTheme")}
      onClick={toggleTheme}
      disabled={!hasHydrated}
    >
      <span className="control-value">{currentThemeLabel}</span>
    </button>
  );
}
