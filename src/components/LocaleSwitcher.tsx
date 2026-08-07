"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * next-intl's `usePathname` returns the path without the locale prefix, so
 * re-linking it with a different `locale` keeps `/en/about` on `/lt/about`.
 */
export function LocaleSwitcher() {
  const activeLocale = useLocale();
  const pathname = usePathname();
  const translate = useTranslations("nav");

  // Cycles rather than hard-coding "the other one" — though a third locale
  // would still need `nav.toggleLanguage` to grow into an ICU select.
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
