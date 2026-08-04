import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import {
  SearchPalette,
  type SearchPaletteItem,
} from "@/components/SearchPalette";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

interface HeaderControlsClusterProps {
  searchItems: SearchPaletteItem[];
}

/**
 * The top-right cluster: search trigger, theme toggle, locale switcher. Sits on
 * the same 20px gutter as the wordmark so the two mirror each other across the
 * void.
 */
export function HeaderControlsCluster({
  searchItems,
}: HeaderControlsClusterProps) {
  return (
    <div className="header-controls">
      <SearchPalette items={searchItems} />
      <ThemeToggleButton />
      <LocaleSwitcher />
    </div>
  );
}
