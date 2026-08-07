import type { NewsTheme } from "./newsApiTypes";
import { findNewsSourcesInTheme } from "./newsSourceRegistry";

/**
 * Editing one theme's slice of the source selection. Both functions preserve
 * the order of the sources they do not touch, so a shared link stays
 * byte-identical after a round trip through the picker.
 */

export interface ThemeSourceSelectionParams {
  theme: NewsTheme;
  /** The whole selection, across every theme. */
  selectedSourceIds: readonly string[];
}

export function selectEveryThemeSource({
  theme,
  selectedSourceIds,
}: ThemeSourceSelectionParams): string[] {
  const themeSourceIds = findNewsSourcesInTheme({ theme }).map(
    (source) => source.sourceId,
  );

  return [
    ...clearThemeSourceSelection({ theme, selectedSourceIds }),
    ...themeSourceIds,
  ];
}

export function clearThemeSourceSelection({
  theme,
  selectedSourceIds,
}: ThemeSourceSelectionParams): string[] {
  const themeSourceIds = findNewsSourcesInTheme({ theme }).map(
    (source) => source.sourceId,
  );

  return selectedSourceIds.filter(
    (selectedId) => !themeSourceIds.includes(selectedId),
  );
}
