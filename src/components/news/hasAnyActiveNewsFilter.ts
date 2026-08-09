import {
  DEFAULT_NEWS_FEED_LIMIT,
  type NewsFeedFilterState,
} from "@/news/newsFeedFilterState";

export interface HasAnyActiveNewsFilterParams {
  filters: NewsFeedFilterState;
}

/**
 * Shared by the reset button and the empty state, so the button can never
 * appear beside a message saying filtering was not the cause. The limit counts
 * as a filter: the serializer omits it at 20, so "not 20" means the reader
 * chose it.
 */
export function hasAnyActiveNewsFilter({
  filters,
}: HasAnyActiveNewsFilterParams): boolean {
  return (
    filters.sourceIds.length > 0 ||
    filters.since !== undefined ||
    filters.until !== undefined ||
    filters.limit !== DEFAULT_NEWS_FEED_LIMIT
  );
}
