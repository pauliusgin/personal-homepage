"use client";

import { useTranslations } from "next-intl";
import { newsThemeLabelMessageKeys } from "@/components/newsThemeLabelMessageKeys";
import { countSelectedSourcesInTheme } from "@/news/countSelectedSourcesInTheme";
import type { NewsTheme } from "@/news/newsApiTypes";
import { findNewsSourcesInTheme } from "@/news/newsSourceRegistry";
import {
  clearThemeSourceSelection,
  selectEveryThemeSource,
} from "@/news/newsThemeSourceSelection";

interface NewsSourceSelectionFloatContentProps {
  theme: NewsTheme;
  /** The whole selection, across every theme — this list edits only its own. */
  selectedSourceIds: readonly string[];
  onSelectedSourceIdsChange: (nextSourceIds: string[]) => void;
}

/**
 * "All" ticks every source of the theme rather than clearing the selection:
 * both request the same items, but ticking leaves boxes the reader can untick
 * one at a time.
 */
export function NewsSourceSelectionFloatContent({
  theme,
  selectedSourceIds,
  onSelectedSourceIdsChange,
}: NewsSourceSelectionFloatContentProps) {
  const translateNews = useTranslations("newsPage");

  const themeSources = findNewsSourcesInTheme({ theme });

  const { selectedCount, totalCount } = countSelectedSourcesInTheme({
    theme,
    selectedSourceIds,
  });
  const isEveryThemeSourceSelected =
    totalCount > 0 && selectedCount === totalCount;

  function toggleSourceId(sourceId: string) {
    if (selectedSourceIds.includes(sourceId)) {
      onSelectedSourceIdsChange(
        selectedSourceIds.filter((selectedId) => selectedId !== sourceId),
      );
      return;
    }
    onSelectedSourceIdsChange([...selectedSourceIds, sourceId]);
  }

  function toggleEveryThemeSource() {
    if (isEveryThemeSourceSelected) {
      onSelectedSourceIdsChange(
        clearThemeSourceSelection({ theme, selectedSourceIds }),
      );
      return;
    }
    onSelectedSourceIdsChange(
      selectEveryThemeSource({ theme, selectedSourceIds }),
    );
  }

  return (
    <div className="news-source-panel">
      <p className="news-source-panel-heading">
        {translateNews(newsThemeLabelMessageKeys[theme])}
      </p>

      <label className="news-source-option news-source-option-all">
        <input
          type="checkbox"
          className="news-source-checkbox"
          checked={isEveryThemeSourceSelected}
          onChange={toggleEveryThemeSource}
        />
        <span>{translateNews("sourceFilterAll")}</span>
      </label>

      {themeSources.map((source) => (
        <label className="news-source-option" key={source.sourceId}>
          <input
            type="checkbox"
            className="news-source-checkbox"
            checked={selectedSourceIds.includes(source.sourceId)}
            onChange={() => toggleSourceId(source.sourceId)}
          />
          <span>{source.displayName}</span>
        </label>
      ))}
    </div>
  );
}
