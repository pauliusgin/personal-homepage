import { setRequestLocale } from "next-intl/server";
import { HomeSectionList } from "@/components/home/HomeSectionList";
import { SitePageShell } from "@/components/shell/SitePageShell";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <SitePageShell>
      <HomeSectionList />
    </SitePageShell>
  );
}
