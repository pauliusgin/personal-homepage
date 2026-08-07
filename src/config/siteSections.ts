import type { ComponentType } from "react";
import { BriefcaseGlyphIcon } from "@/components/icons/BriefcaseGlyphIcon";
import { CodeBracketsGlyphIcon } from "@/components/icons/CodeBracketsGlyphIcon";
import { EnvelopeGlyphIcon } from "@/components/icons/EnvelopeGlyphIcon";
import { FolderGlyphIcon } from "@/components/icons/FolderGlyphIcon";
import { FoldedNewspaperGlyphIcon } from "@/components/icons/FoldedNewspaperGlyphIcon";
import { LlamaGlyphIcon } from "@/components/icons/LlamaGlyphIcon";
import { PersonGlyphIcon } from "@/components/icons/PersonGlyphIcon";

/**
 * Stand-in for a row whose real address is not known yet: it renders but goes
 * nowhere, and the search palette refuses to navigate to it. Point a new row
 * here rather than invent a URL.
 */
export const PLACEHOLDER_HREF = "#";

/** `internal` gets the locale prefix; `external` opens a new tab. */
export type SectionLinkKind = "internal" | "external" | "mailto";

export interface SiteSectionDefinition {
  /** Key under the `sections` namespace in `locales/*.json`; also the React key. */
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
    // Real route, placeholder body — see src/components/ComingSoonNotice.tsx.
    href: "/portfolio",
    linkKind: "internal",
    LeadingIcon: FolderGlyphIcon,
  },
  {
    translationKey: "news",
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
