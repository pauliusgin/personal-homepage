"use client";

import { useEffect, useState } from "react";
import { readPersistedNewsFeedFilterPreferences } from "@/news/newsFeedFilterPreferences";
import type { NewsFeedFilterState } from "@/news/newsFeedFilterState";

/**
 * Restores the stored filter selection into the URL, once, on mount, and only
 * for a bare `/news`. A shared link, a bookmark and a back-navigation all carry
 * a query string and must render what they say; storage only fills a vacuum.
 *
 * `isAwaitingStoredFilters` keeps the restore from costing a wasted request: a
 * cold visit would otherwise fetch the unfiltered feed, have the URL change
 * under it and fetch again — two fan-outs across ~20 upstream feeds.
 *
 * The URL is the signal rather than a restore state machine, which also keeps
 * state updates out of effect bodies, forbidden by the React Compiler lint.
 */

/** Backstop for the URL write not landing; the failure mode is a feed that never loads. */
const STORED_FILTER_RESTORE_TIMEOUT_MS = 1500;

export interface UseStoredNewsFeedFilterRestoreParams {
  /** `searchParams.toString()` — a stable string, so it can key an effect. */
  searchParamsKey: string;
  /** The panel's URL writer. Also what persists the restored selection back. */
  applyFilters: (filters: NewsFeedFilterState) => void;
}

export interface StoredNewsFeedFilterRestoreState {
  /** True while the first request must be held back. Render it as loading. */
  isAwaitingStoredFilters: boolean;
}

export function useStoredNewsFeedFilterRestore({
  searchParamsKey,
  applyFilters,
}: UseStoredNewsFeedFilterRestoreParams): StoredNewsFeedFilterRestoreState {
  // The initialiser runs on the server too, where the read returns `null`, so
  // the hydrating render can disagree — both spellings render the same loading
  // state, so the markup still matches.
  const [restorableFilters] = useState<NewsFeedFilterState | null>(() => {
    if (searchParamsKey.length > 0) {
      return null;
    }

    return readPersistedNewsFeedFilterPreferences();
  });
  const [hasRestoreTimedOut, setHasRestoreTimedOut] = useState(false);

  // A non-empty query string is proof the write landed — or that the reader
  // touched a control first, in which case their choice supersedes the restore.
  const isRestoreOutstanding =
    restorableFilters !== null && searchParamsKey.length === 0;

  useEffect(() => {
    if (!restorableFilters) {
      return;
    }

    applyFilters(restorableFilters);
  }, [restorableFilters, applyFilters]);

  useEffect(() => {
    if (!isRestoreOutstanding) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHasRestoreTimedOut(true);
    }, STORED_FILTER_RESTORE_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isRestoreOutstanding]);

  return {
    isAwaitingStoredFilters: isRestoreOutstanding && !hasRestoreTimedOut,
  };
}
