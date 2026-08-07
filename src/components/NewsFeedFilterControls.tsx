"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { hasAnyActiveNewsFilter } from "@/components/hasAnyActiveNewsFilter";
import { NewsArticleCountFloatContent } from "@/components/NewsArticleCountFloatContent";
import { NewsDateRangeFloatContent } from "@/components/NewsDateRangeFloatContent";
import { NewsFilterFloat } from "@/components/NewsFilterFloat";
import { NewsSourceSelectionFloatContent } from "@/components/NewsSourceSelectionFloatContent";
import { NewsThemeFilterChipRow } from "@/components/NewsThemeFilterChipRow";
import { DisclosureChevronIcon } from "@/components/icons/DisclosureChevronIcon";
import type { NewsTheme } from "@/news/newsApiTypes";
import {
  createDefaultNewsFeedFilterState,
  type NewsFeedFilterState,
} from "@/news/newsFeedFilterState";

/** One value rather than three booleans: "at most one open" becomes unrepresentable otherwise. */
type OpenNewsFilterFloat =
  | { kind: "sources"; theme: NewsTheme }
  | { kind: "dateRange" }
  | { kind: "articleCount" };

function formatDateBoundForTrigger(dateBound: string | undefined): string {
  if (!dateBound) {
    return "…";
  }
  // A bare date and an RFC3339 instant share their first ten characters, which
  // is the whole of what the trigger shows.
  return dateBound.slice(0, 10);
}

interface NewsFeedFilterControlsProps {
  filters: NewsFeedFilterState;
  /** Every change round-trips through the URL — see `NewsFeedPanel`. */
  onFiltersChange: (nextFilters: NewsFeedFilterState) => void;
  onRefresh: () => void;
  onMarkAllSeen: () => void;
  /** False until hydration and while the feed has no items to mark. */
  canMarkAllSeen: boolean;
}

/**
 * Refresh is a button and not an interval: the server keeps parsed items for 15
 * minutes and sends no cache headers, so polling faster fetches identical bytes
 * over a real request every time.
 */
export function NewsFeedFilterControls({
  filters,
  onFiltersChange,
  onRefresh,
  onMarkAllSeen,
  canMarkAllSeen,
}: NewsFeedFilterControlsProps) {
  const translateNews = useTranslations("newsPage");
  const [openFloat, setOpenFloat] = useState<OpenNewsFilterFloat | null>(null);

  // Stable identity so no float re-subscribes its dismissal listeners on an
  // unrelated render.
  const closeFloat = useCallback(() => setOpenFloat(null), []);

  function applySourceIds(nextSourceIds: string[]) {
    onFiltersChange({ ...filters, sourceIds: nextSourceIds });
  }

  /**
   * A chip is a disclosure and nothing else — it never selects or clears on the
   * reader's behalf; the `ALL` row inside the float is the whole-theme shortcut.
   */
  function handleThemeChipClick(theme: NewsTheme) {
    if (openFloat?.kind === "sources" && openFloat.theme === theme) {
      setOpenFloat(null);
      return;
    }
    setOpenFloat({ kind: "sources", theme });
  }

  function toggleFloat(nextFloat: OpenNewsFilterFloat) {
    if (openFloat?.kind === nextFloat.kind) {
      setOpenFloat(null);
      return;
    }
    setOpenFloat(nextFloat);
  }

  let dateRangeSummary: string | null = null;
  if (filters.since || filters.until) {
    dateRangeSummary = `${formatDateBoundForTrigger(filters.since)} → ${formatDateBoundForTrigger(filters.until)}`;
  }

  return (
    <div
      className="news-filter-bar"
      role="group"
      aria-label={translateNews("filtersLabel")}
    >
      <NewsFilterFloat
        isOpen={openFloat?.kind === "sources"}
        onClose={closeFloat}
        label={translateNews("sourceFilterLabel")}
        trigger={
          <NewsThemeFilterChipRow
            selectedSourceIds={filters.sourceIds}
            openSourceFloatTheme={
              openFloat?.kind === "sources" ? openFloat.theme : null
            }
            onThemeChipClick={handleThemeChipClick}
          />
        }
      >
        {openFloat?.kind === "sources" ? (
          <NewsSourceSelectionFloatContent
            theme={openFloat.theme}
            selectedSourceIds={filters.sourceIds}
            onSelectedSourceIdsChange={applySourceIds}
          />
        ) : null}
      </NewsFilterFloat>

      <div className="news-filter-row">
        <NewsFilterFloat
          isOpen={openFloat?.kind === "articleCount"}
          onClose={closeFloat}
          label={translateNews("limitFilterLabel")}
          trigger={
            // The count alone; the label survives as the accessible name.
            <button
              type="button"
              className="news-filter-button"
              aria-haspopup="dialog"
              aria-expanded={openFloat?.kind === "articleCount"}
              aria-label={`${translateNews("limitFilterLabel")} ${filters.limit}`}
              onClick={() => toggleFloat({ kind: "articleCount" })}
            >
              {filters.limit}
              <span className="news-filter-trigger-chevron">
                <DisclosureChevronIcon />
              </span>
            </button>
          }
        >
          <NewsArticleCountFloatContent
            selectedLimit={filters.limit}
            onLimitChange={(nextLimit) => {
              onFiltersChange({ ...filters, limit: nextLimit });
              closeFloat();
            }}
          />
        </NewsFilterFloat>

        <NewsFilterFloat
          isOpen={openFloat?.kind === "dateRange"}
          onClose={closeFloat}
          label={translateNews("dateFilterLabel")}
          trigger={
            <button
              type="button"
              className="news-filter-button"
              aria-haspopup="dialog"
              aria-expanded={openFloat?.kind === "dateRange"}
              onClick={() => toggleFloat({ kind: "dateRange" })}
            >
              {translateNews("dateFilterLabel")}
              {dateRangeSummary ? (
                <span className="news-filter-trigger-value">
                  {dateRangeSummary}
                </span>
              ) : null}
              <span className="news-filter-trigger-chevron">
                <DisclosureChevronIcon />
              </span>
            </button>
          }
        >
          <NewsDateRangeFloatContent
            since={filters.since}
            until={filters.until}
            onSinceChange={(nextSince) =>
              onFiltersChange({ ...filters, since: nextSince })
            }
            onUntilChange={(nextUntil) =>
              onFiltersChange({ ...filters, until: nextUntil })
            }
          />
        </NewsFilterFloat>
      </div>

      <div className="news-filter-row">
        <button
          type="button"
          className="news-filter-button"
          onClick={onMarkAllSeen}
          disabled={!canMarkAllSeen}
        >
          {translateNews("markAllSeen")}
        </button>

        <button
          type="button"
          className="news-filter-button"
          onClick={onRefresh}
        >
          {translateNews("refresh")}
        </button>
      </div>

      {/* Always rendered; its height is held open in CSS so the feed does not
          jump when the reset button appears. */}
      <div className="news-filter-row news-filter-reset-row">
        {hasAnyActiveNewsFilter({ filters }) ? (
          <button
            type="button"
            className="news-filter-button"
            onClick={() => {
              setOpenFloat(null);
              onFiltersChange(createDefaultNewsFeedFilterState());
            }}
          >
            {translateNews("reset")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
