import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ComingSoonNotice } from "@/components/ComingSoonNotice";
import { SitePageShell } from "@/components/SitePageShell";
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

/** /portfolio: the project list, not built yet — placeholder body for now. */
export default async function PortfolioPage({
  params,
}: PageProps<"/[locale]/portfolio">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <SitePageShell>
      <ComingSoonNotice />
    </SitePageShell>
  );
}
