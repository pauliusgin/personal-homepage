import { LocaleSwitcher } from "@/components/header/LocaleSwitcher";
import {
  SearchPalette,
  type SearchPaletteItem,
} from "@/components/header/SearchPalette";
import { ThemeToggleButton } from "@/components/header/ThemeToggleButton";

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
