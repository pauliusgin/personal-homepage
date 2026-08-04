import type { ComponentType } from "react";
import { BriefcaseGlyphIcon } from "@/components/icons/BriefcaseGlyphIcon";
import { CodeBracketsGlyphIcon } from "@/components/icons/CodeBracketsGlyphIcon";
import { EnvelopeGlyphIcon } from "@/components/icons/EnvelopeGlyphIcon";
import { FolderGlyphIcon } from "@/components/icons/FolderGlyphIcon";
import { FoldedNewspaperGlyphIcon } from "@/components/icons/FoldedNewspaperGlyphIcon";
import { LlamaGlyphIcon } from "@/components/icons/LlamaGlyphIcon";
import { PersonGlyphIcon } from "@/components/icons/PersonGlyphIcon";

/**
 * Every destination on the site lives in `siteSections` below — changing where
 * a row points is a one-line edit here and nothing else in the app needs to
 * know.
 */

/**
 * Stand-in destination for a row whose real address has not been supplied yet.
 * Rows pointing at this are rendered but deliberately go nowhere — the search
 * palette also refuses to navigate to it rather than opening an empty tab.
 *
 * No row uses it today; a new one that has no address yet should point here and
 * carry a `TODO(real-url)` comment rather than invent a URL.
 */
export const PLACEHOLDER_HREF = "#";

/**
 * How the row's anchor should behave. `internal` stays inside the app (and gets
 * the locale prefix), `external` opens a new tab, `mailto` hands off to the
 * operating system's default mail client.
 */
export type SectionLinkKind = "internal" | "external" | "mailto";

export interface SiteSectionDefinition {
  /**
   * Key under the `sections` namespace in `locales/*.json`. Doubles as the
   * React key and as the search palette's option id.
   */
  translationKey: string;
  href: string;
  linkKind: SectionLinkKind;
  LeadingIcon: ComponentType;
}

export const siteSections: SiteSectionDefinition[] = [
  {
    translationKey: "about",
    href: "/about",
    linkKind: "internal",
    LeadingIcon: PersonGlyphIcon,
  },
  {
    translationKey: "portfolio",
    // The route exists and is linkable; its body is still the "coming soon"
    // placeholder — see src/components/ComingSoonNotice.tsx.
    href: "/portfolio",
    linkKind: "internal",
    LeadingIcon: FolderGlyphIcon,
  },
  {
    translationKey: "news",
    // Same as /portfolio: real route, placeholder body.
    href: "/news",
    linkKind: "internal",
    LeadingIcon: FoldedNewspaperGlyphIcon,
  },
  {
    translationKey: "sisters",
    href: "https://www.sisters.lt/",
    linkKind: "external",
    LeadingIcon: LlamaGlyphIcon,
  },
  {
    translationKey: "linkedin",
    href: "https://www.linkedin.com/in/paulius-giniunas",
    linkKind: "external",
    LeadingIcon: BriefcaseGlyphIcon,
  },
  {
    translationKey: "github",
    href: "https://github.com/pauliusgin",
    linkKind: "external",
    LeadingIcon: CodeBracketsGlyphIcon,
  },
  {
    translationKey: "email",
    href: "mailto:paulius.giniunas@gmail.com",
    linkKind: "mailto",
    LeadingIcon: EnvelopeGlyphIcon,
  },
];
