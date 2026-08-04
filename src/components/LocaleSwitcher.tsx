"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Cycles to the next locale while staying on the current page. Reads exactly
 * like the theme toggle beside it: the visible text is the *current* value
 * ("EN"), the action lives in the accessible name. `usePathname` from the
 * next-intl navigation wrappers returns the pathname *without* the locale
 * prefix, so re-linking it with a different `locale` preserves the route —
 * which is what keeps a page like `/en/about` on `/lt/about`.
 */
export function LocaleSwitcher() {
  const activeLocale = useLocale();
  const pathname = usePathname();
  const translate = useTranslations("nav");

  // Cycles rather than hard-coding "the other one", so a third locale in
  // `routing` needs no change here. `nav.toggleLanguage` does name the target
  // language though, so that one string would have to grow into an ICU select.
  const activeLocaleIndex = routing.locales.findIndex(
    (locale) => locale === activeLocale,
  );
  const nextLocale =
    routing.locales[(activeLocaleIndex + 1) % routing.locales.length];

  return (
    <Link
      className="control-button"
      href={pathname}
      locale={nextLocale}
      aria-label={translate("toggleLanguage")}
    >
      {activeLocale.toUpperCase()}
    </Link>
  );
}
