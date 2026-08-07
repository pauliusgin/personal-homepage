import type { NewsTheme } from "./newsApiTypes";
import { findNewsSourcesInTheme } from "./newsSourceRegistry";

export interface CountSelectedSourcesInThemeParams {
  theme: NewsTheme;
  /** The whole selection, across every theme — filtered here. */
  selectedSourceIds: readonly string[];
}

export interface SelectedSourceCountInTheme {
  selectedCount: number;
  totalCount: number;
}

/**
 * Both ends mean the same thing: `0` and `totalCount` selected each request
 * every source of the theme. Only a count strictly between them is a narrowing.
 */
export function countSelectedSourcesInTheme({
  theme,
  selectedSourceIds,
}: CountSelectedSourcesInThemeParams): SelectedSourceCountInTheme {
  const themeSources = findNewsSourcesInTheme({ theme });
  const selectedCount = themeSources.filter((source) =>
    selectedSourceIds.includes(source.sourceId),
  ).length;

  return { selectedCount, totalCount: themeSources.length };
}
