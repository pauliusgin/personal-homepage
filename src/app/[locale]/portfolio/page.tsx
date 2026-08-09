import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PortfolioProjectList } from "@/components/portfolio/PortfolioProjectList";
import { SitePageShell } from "@/components/shell/SitePageShell";
import { buildLocalizedPageTitle } from "@/i18n/buildLocalizedPageTitle";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/portfolio">): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: await buildLocalizedPageTitle({
      locale,
      sectionTranslationKey: "portfolio",
    }),
  };
}

export default async function PortfolioPage({
  params,
}: PageProps<"/[locale]/portfolio">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <SitePageShell>
      <PortfolioProjectList />
    </SitePageShell>
  );
}
