import { getTranslations } from "next-intl/server";
import {
  siteSections,
  type SiteSectionDefinition,
} from "@/config/siteSections";

/** One section row, with its copy already resolved for the active locale. */
export interface SiteSectionRowModel {
  section: SiteSectionDefinition;
  label: string;
  /** Absent for rows that are only a label — see `sections` in `locales/*.json`. */
  descriptor?: string;
}

/**
 * Joins `siteSections` (configuration) to the message catalogue (content).
 *
 * A descriptor is content, not configuration: a row has one when the catalogue
 * supplies one. Omitting `description` from `sections.<key>` in locales/*.json
 * is the whole opt-out — LinkedIn and GitHub use it today.
 *
 * Both the homepage list and the search palette are built from this, so a row
 * can never appear in one and be missing from the other.
 */
export async function resolveSiteSectionRows(): Promise<SiteSectionRowModel[]> {
  const translateSections = await getTranslations("sections");

  return siteSections.map((section) => {
    const descriptorKey = `${section.translationKey}.description`;

    let descriptor: string | undefined = undefined;
    if (translateSections.has(descriptorKey)) {
      descriptor = translateSections(descriptorKey);
    }

    return {
      section,
      label: translateSections(`${section.translationKey}.title`),
      descriptor,
    };
  });
}
