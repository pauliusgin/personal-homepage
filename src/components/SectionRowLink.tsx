import type { ReactNode } from "react";
import {
  PLACEHOLDER_HREF,
  type SiteSectionDefinition,
} from "@/config/siteSections";
import { Link } from "@/i18n/navigation";
import { ExternalArrowIcon } from "@/components/icons/ExternalArrowIcon";

interface SectionRowLinkProps {
  section: SiteSectionDefinition;
  label: string;
  /** Absent for rows that are only a label — see `sections` in `locales/*.json`. */
  descriptor?: string;
}

/**
 * One full-bleed 60px row of the list: leading glyph, label, orange `|`
 * separator, descriptor, and — for anything that leaves the site — a trailing ↗
 * that reveals on hover. A row without a descriptor drops the separator with
 * it; a dangling `|` would read as a cursor rather than as punctuation.
 */
export function SectionRowLink({
  section,
  label,
  descriptor,
}: SectionRowLinkProps) {
  const { LeadingIcon } = section;
  const isExternal = section.linkKind === "external";
  const showsTrailingArrow = section.linkKind !== "internal";

  const rowContent: ReactNode = (
    <>
      <span className="section-row-content">
        <span className="section-row-icon">
          <LeadingIcon />
        </span>
        <span className="section-row-text">
          <span>{label}</span>
          {descriptor ? (
            <>
              <span className="section-row-separator" aria-hidden>
                |
              </span>
              <span className="section-row-descriptor">{descriptor}</span>
            </>
          ) : null}
        </span>
      </span>
      <span className="section-row-arrow-slot">
        {showsTrailingArrow ? (
          <span className="section-row-arrow">
            <ExternalArrowIcon />
          </span>
        ) : null}
      </span>
    </>
  );

  const rowClassName = "section-row";

  // Real internal routes go through the next-intl wrapper so they keep the
  // locale prefix. Placeholders are plain anchors — see src/config/siteSections.ts.
  const isRoutableInternalLink =
    section.linkKind === "internal" && section.href !== PLACEHOLDER_HREF;

  if (isRoutableInternalLink) {
    return (
      <Link href={section.href} className={rowClassName}>
        {rowContent}
      </Link>
    );
  }

  let linkTarget: string | undefined = undefined;
  let linkRelation: string | undefined = undefined;
  if (isExternal) {
    linkTarget = "_blank";
    linkRelation = "noopener noreferrer";
  }

  return (
    <a
      href={section.href}
      className={rowClassName}
      target={linkTarget}
      rel={linkRelation}
    >
      {rowContent}
    </a>
  );
}
