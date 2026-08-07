import { getTranslations } from "next-intl/server";
import {
  siteSections,
  type SiteSectionDefinition,
} from "@/config/siteSections";

export interface SiteSectionRowModel {
  section: SiteSectionDefinition;
  label: string;
  descriptor?: string;
}

/**
 * Joins `siteSections` (configuration) to the message catalogue (content).
 * Omitting `description` from `sections.<key>` is the whole opt-out from a
 * descriptor — LinkedIn and GitHub use it today.
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
