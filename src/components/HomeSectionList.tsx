import { getTranslations } from "next-intl/server";
import { SectionRowLink } from "@/components/SectionRowLink";
import { resolveSiteSectionRows } from "@/config/resolveSiteSectionRows";

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
