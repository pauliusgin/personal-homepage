import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import {
  SearchPalette,
  type SearchPaletteItem,
} from "@/components/SearchPalette";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

interface HeaderControlsClusterProps {
  searchItems: SearchPaletteItem[];
}

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
