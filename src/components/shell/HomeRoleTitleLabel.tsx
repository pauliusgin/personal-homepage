"use client";

import { usePathname } from "@/i18n/navigation";

interface HomeRoleTitleLabelProps {
  roleTitleText: string;
}

/**
 * The homepage's counterpart to `BackToHomeArrowLink`: the two occupy the same
 * slot after the cursor and are mutually exclusive, both deciding from the
 * locale-stripped pathname so they can never render together.
 */
export function HomeRoleTitleLabel({ roleTitleText }: HomeRoleTitleLabelProps) {
  const pathnameWithoutLocale = usePathname();

  if (pathnameWithoutLocale !== "/") {
    return null;
  }

  return <span className="wordmark-role">{roleTitleText}</span>;
}
