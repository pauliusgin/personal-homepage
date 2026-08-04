import { getTranslations } from "next-intl/server";

interface BuildLocalizedPageTitleParams {
  locale: string;
  /** A key under `sections` in locales/*.json — the row that links to the page. */
  sectionTranslationKey: string;
}

/**
 * `<document title> = <section label> — <site name>`, both halves localized.
 *
 * Page titles reuse the section labels on purpose: the row a visitor clicked
 * and the tab they land on say the same word, and there is one place to change
 * it.
 */
export async function buildLocalizedPageTitle({
  locale,
  sectionTranslationKey,
}: BuildLocalizedPageTitleParams): Promise<string> {
  const translate = await getTranslations({ locale });

  const sectionLabel = translate(`sections.${sectionTranslationKey}.title`);
  const siteName = translate("metadata.title");

  return `${sectionLabel} — ${siteName}`;
}
