import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AboutProseColumn } from "@/components/about/AboutProseColumn";
import { SitePageShell } from "@/components/shell/SitePageShell";
import { buildLocalizedPageTitle } from "@/i18n/buildLocalizedPageTitle";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: await buildLocalizedPageTitle({
      locale,
      sectionTranslationKey: "about",
    }),
  };
}

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <SitePageShell>
      <AboutProseColumn />
    </SitePageShell>
  );
}
