import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { HeaderControlsCluster } from "@/components/HeaderControlsCluster";
import { SiteFooterBand } from "@/components/SiteFooterBand";
import { SiteWordmark } from "@/components/SiteWordmark";
import { resolveSearchPaletteItems } from "@/config/resolveSearchPaletteItems";

interface SitePageShellProps {
  children: ReactNode;
}

/**
 * The frame every page shares: the header void with wordmark and controls, the
 * page's own body, and the footer void. Only the body changes
 * between the homepage, /about and the placeholder routes — the search palette
 * is fed the same index everywhere, so ⌘K works off the homepage too.
 */
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
