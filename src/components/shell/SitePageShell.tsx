import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { HeaderControlsCluster } from "@/components/header/HeaderControlsCluster";
import { SiteFooterBand } from "@/components/shell/SiteFooterBand";
import { SiteWordmark } from "@/components/shell/SiteWordmark";
import { resolveSearchPaletteItems } from "@/config/resolveSearchPaletteItems";

interface SitePageShellProps {
  children: ReactNode;
}

export async function SitePageShell({ children }: SitePageShellProps) {
  const [translateRoot, searchItems] = await Promise.all([
    getTranslations(),
    resolveSearchPaletteItems(),
  ]);

  return (
    <div className="page-shell">
      <header className="header-band">
        <SiteWordmark
          wordmarkText={translateRoot("wordmark")}
          shortWordmarkText={translateRoot("wordmarkShort")}
          backToHomeLabel={translateRoot("nav.backToHome")}
        />
        <HeaderControlsCluster searchItems={searchItems} />
      </header>

      <main className="page-main">{children}</main>

      <SiteFooterBand />
    </div>
  );
}
