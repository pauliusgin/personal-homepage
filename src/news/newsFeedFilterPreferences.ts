import { resolveGuardedLocalStorage } from "./guardedLocalStorage";
import {
  parseNewsFeedFiltersFromQuery,
  serializeNewsFeedFiltersToQuery,
  type NewsFeedFilterState,
} from "./newsFeedFilterState";

/**
 * Remembers the reader's last source and limit selection so a return visit to a
 * bare `/news` opens on the feed they configured.
 *
 * A query string is stored rather than a filter object, so reading one back
 * runs through `parseNewsFeedFiltersFromQuery` — the same validator the URL
 * goes through, leaving no second validation path to keep in sync.
 *
 * The URL stays the source of truth: `useStoredNewsFeedFilterRestore` decides
 * when to restore, and only into a query string carrying no filters of its own.
 */

const NEWS_FEED_FILTER_PREFERENCES_STORAGE_KEY =
  "giniunas-homepage:news:filter-preferences";

/** An unrecognised version reads as "nothing stored" — a shape change is not a migration. */
const NEWS_FEED_FILTER_PREFERENCES_PAYLOAD_VERSION = 1;

interface NewsFeedFilterPreferencesPayload {
  version: number;
  /** A `serializeNewsFeedFiltersToQuery` string, minus the date bounds. */
  query: string;
}

/**
 * Date bounds are deliberately not persisted: they are absolute instants, so a
 * reader who once looked at "last week" would return a month later to an empty
 * feed with no visible cause.
 */
function buildStorableFilterQuery(filters: NewsFeedFilterState): string {
  return serializeNewsFeedFiltersToQuery({
    filters: { ...filters, since: undefined, until: undefined },
  }).toString();
}

function isNewsFeedFilterPreferencesPayload(
  value: unknown,
): value is NewsFeedFilterPreferencesPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as NewsFeedFilterPreferencesPayload;
  return (
    typeof candidate.version === "number" && typeof candidate.query === "string"
  );
}

export interface PersistNewsFeedFilterPreferencesParams {
  filters: NewsFeedFilterState;
}

/**
 * Called on every filter change, including the one that clears them all — an
 * empty query is how "drop my old selection" is recorded.
 */
export function persistNewsFeedFilterPreferences({
  filters,
}: PersistNewsFeedFilterPreferencesParams): void {
  const storage = resolveGuardedLocalStorage();
  if (!storage) {
    return;
  }

  const payload: NewsFeedFilterPreferencesPayload = {
    version: NEWS_FEED_FILTER_PREFERENCES_PAYLOAD_VERSION,
    query: buildStorableFilterQuery(filters),
  };

  try {
    storage.setItem(
      NEWS_FEED_FILTER_PREFERENCES_STORAGE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // Storage full or blocked — the preference is a nicety, so it is dropped.
  }
}

/** `null` means "do not touch the URL"; a result always means a narrower view to restore. */
export function readPersistedNewsFeedFilterPreferences(): NewsFeedFilterState | null {
  const storage = resolveGuardedLocalStorage();
  if (!storage) {
    return null;
  }

  let storedQuery = "";
  try {
    const rawPayload = storage.getItem(
      NEWS_FEED_FILTER_PREFERENCES_STORAGE_KEY,
    );
    if (!rawPayload) {
      return null;
    }

    const parsedPayload: unknown = JSON.parse(rawPayload);
    if (!isNewsFeedFilterPreferencesPayload(parsedPayload)) {
      return null;
    }
    if (
      parsedPayload.version !== NEWS_FEED_FILTER_PREFERENCES_PAYLOAD_VERSION
    ) {
      return null;
    }

    storedQuery = parsedPayload.query;
  } catch {
    return null;
  }

  const restoredFilters = parseNewsFeedFiltersFromQuery({
    query: new URLSearchParams(storedQuery),
  });

  // Re-serialized rather than tested field by field: validation may have
  // dropped everything the payload asked for (a registry rename, say).
  if (buildStorableFilterQuery(restoredFilters).length === 0) {
    return null;
  }

  return restoredFilters;
}
