"use client";

import { BackArrowGlyphIcon } from "@/components/icons/BackArrowGlyphIcon";
import { Link, usePathname } from "@/i18n/navigation";

interface BackToHomeArrowLinkProps {
  backToHomeLabel: string;
}

/**
 * The route decides whether this renders, rather than a prop each page must
 * remember. next-intl's `usePathname` strips the locale prefix, so the homepage
 * is `/` in both locales.
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
