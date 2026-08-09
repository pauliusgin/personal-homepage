"use client";

import { Fragment } from "react";
import { useTranslations } from "next-intl";
import { newsThemeLabelMessageKeys } from "@/components/news/newsThemeLabelMessageKeys";
import { DisclosureChevronIcon } from "@/components/icons/DisclosureChevronIcon";
import { countSelectedSourcesInTheme } from "@/news/countSelectedSourcesInTheme";
import { NEWS_THEMES, type NewsTheme } from "@/news/newsApiTypes";

interface NewsThemeFilterChipRowProps {
  selectedSourceIds: readonly string[];
  openSourceFloatTheme: NewsTheme | null;
  onThemeChipClick: (theme: NewsTheme) => void;
}

/**
 * Pressed is derived, never stored, so a chip cannot disagree with the float it
 * opens. The count appears only for a partial selection — all ticked and none
 * ticked request the same items.
 *
 * Chips use `--accent-news-topic` rather than `--accent-primary`, which swaps
 * orange and blue between modes and would paint the topic axis blue in light
 * mode beside an orange topic tag on every item below.
 */
export function NewsThemeFilterChipRow({
  selectedSourceIds,
  openSourceFloatTheme,
  onThemeChipClick,
}: NewsThemeFilterChipRowProps) {
  const translateNews = useTranslations("newsPage");

  return (
    <div
      className="news-theme-chip-row"
      role="group"
      aria-label={translateNews("themeFilterLabel")}
    >
      {NEWS_THEMES.map((theme, themeIndex) => {
        const { selectedCount, totalCount } = countSelectedSourcesInTheme({
          theme,
          selectedSourceIds,
        });
        const isPartiallyNarrowed =
          selectedCount > 0 && selectedCount < totalCount;

        return (
          <Fragment key={theme}>
            {/* Between the chips only — a leading `|` would read as a cursor. */}
            {themeIndex > 0 ? (
              <span className="news-theme-chip-separator" aria-hidden>
                |
              </span>
            ) : null}

            <button
              type="button"
              className="news-theme-chip"
              aria-pressed={selectedCount > 0}
              aria-haspopup="dialog"
              aria-expanded={openSourceFloatTheme === theme}
              onClick={() => onThemeChipClick(theme)}
            >
              {/* One span so label, count and chevron travel together on hover. */}
              <span className="news-theme-chip-text">
                {translateNews(newsThemeLabelMessageKeys[theme])}

                {isPartiallyNarrowed ? (
                  <span
                    className="news-theme-chip-count"
                    aria-label={translateNews("sourceFilterCount", {
                      count: selectedCount,
                    })}
                  >
                    {selectedCount}
                  </span>
                ) : null}

                <span className="news-filter-trigger-chevron">
                  <DisclosureChevronIcon />
                </span>
              </span>
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
