import { getTranslations } from "next-intl/server";
import { SectionRowLink } from "@/components/SectionRowLink";
import { resolveSiteSectionRows } from "@/config/resolveSiteSectionRows";

/**
 * The homepage's body: the full-bleed row list, one row per site section. The
 * void above and below it comes from the shell, not from here.
 */
export async function HomeSectionList() {
  const translateNav = await getTranslations("nav");
  const sectionRows = await resolveSiteSectionRows();

  return (
    <nav className="section-list" aria-label={translateNav("sections")}>
      {sectionRows.map(({ section, label, descriptor }) => (
        <SectionRowLink
          key={section.translationKey}
          section={section}
          label={label}
          descriptor={descriptor}
        />
      ))}
    </nav>
  );
}
