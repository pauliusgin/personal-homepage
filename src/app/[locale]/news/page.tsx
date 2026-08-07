import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { NewsFeedPanel } from "@/components/NewsFeedPanel";
import { NewsFeedStatusLine } from "@/components/NewsFeedStatusLine";
import { SitePageShell } from "@/components/SitePageShell";
import { buildLocalizedPageTitle } from "@/i18n/buildLocalizedPageTitle";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/news">): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: await buildLocalizedPageTitle({
      locale,
      sectionTranslationKey: "news",
    }),
  };
}

/**
 * Reads nothing request-scoped, so both locales stay prerendered. The
 * `<Suspense>` boundary keeps `NewsFeedPanel`'s query-string read from dragging
 * the shell above it out of static rendering.
 */
export default async function NewsPage({
  params,
}: PageProps<"/[locale]/news">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const translateNews = await getTranslations("newsPage");

  return (
    <SitePageShell>
      <Suspense
        fallback={
          <section className="news-feed-column">
            <NewsFeedStatusLine message={translateNews("loading")} />
          </section>
        }
      >
        <NewsFeedPanel />
      </Suspense>
    </SitePageShell>
  );
}
