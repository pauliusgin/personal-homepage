"use client";

import { BackArrowGlyphIcon } from "@/components/icons/BackArrowGlyphIcon";
import { Link, usePathname } from "@/i18n/navigation";

interface BackToHomeArrowLinkProps {
  backToHomeLabel: string;
}

/**
 * The ← that sits right of the wordmark's `|` on every page except the
 * homepage, and is the only way back to it — the wordmark itself is not a link.
 *
 * The current route decides whether it renders, rather than a prop each page
 * has to remember to pass: a new route added under `[locale]` gets the arrow
 * for free and cannot be shipped without one. `usePathname` here is next-intl's
 * — it returns the path with the locale prefix already stripped, so the
 * homepage is `/` in both locales.
 */
export function BackToHomeArrowLink({
  backToHomeLabel,
}: BackToHomeArrowLinkProps) {
  const pathnameWithoutLocale = usePathname();

  if (pathnameWithoutLocale === "/") {
    return null;
  }

  return (
    <Link className="wordmark-back-link" href="/" aria-label={backToHomeLabel}>
      <BackArrowGlyphIcon />
    </Link>
  );
}
