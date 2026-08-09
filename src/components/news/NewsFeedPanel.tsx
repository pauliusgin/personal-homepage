"use client";

import { useTranslations } from "next-intl";
// `useSearchParams` needs no locale-aware wrapper — the query string carries no
// locale prefix. `useRouter` and `usePathname` do, and come from the wrapper.
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { hasAnyActiveNewsFilter } from "@/components/news/hasAnyActiveNewsFilter";
import { NewsFeedFilterControls } from "@/components/news/NewsFeedFilterControls";
import { NewsFeedItemList } from "@/components/news/NewsFeedItemList";
import { NewsSourceFailureNotice } from "@/components/news/NewsSourceFailureNotice";
import {
  NO_NEWS_FEED_REQUEST_OUTCOME,
  resolveNewsFeedViewState,
  type NewsFeedRequestOutcome,
} from "@/components/news/resolveNewsFeedViewState";
import { useStoredNewsFeedFilterRestore } from "@/components/news/useStoredNewsFeedFilterRestore";
import { usePathname, useRouter } from "@/i18n/navigation";
import { fetchCuratedNews } from "@/news/fetchCuratedNews";
import { resolveNewsApiBaseUrl } from "@/news/newsApiBaseUrl";
import { persistNewsFeedFilterPreferences } from "@/news/newsFeedFilterPreferences";
import {
  parseNewsFeedFiltersFromQuery,
  serializeNewsFeedFiltersToQuery,
  type NewsFeedFilterState,
} from "@/news/newsFeedFilterState";
import {
  buildNewsItemIdentityKey,
  markNewsItemKeysAsSeen,
  readSeenNewsItemKeys,
} from "@/news/seenNewsItemStorage";

// Hydration probe: the server snapshot is always `false` and the client
// snapshot always `true`, so the first client render matches the server and the
// second reflects reality.
const subscribeWithoutUpdates = () => () => {};
const getHydratedSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Filter state lives in the query string so a filtered view is linkable. Writes
 * use `router.replace`, not `push`, because a history entry per filter toggle
 * would make the back button unusable; `scroll: false` for the same reason.
 *
 * Reading the query string opts the surrounding tree out of prerendering, which
 * is why `/news/page.tsx` wraps this in a `<Suspense>` boundary.
 */
export function NewsFeedPanel() {
  const translateNews = useTranslations("newsPage");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Memoised on the serialized string: the parsed state feeds an effect's
  // dependency list, so a fresh identity per render would refetch every render.
  const searchParamsKey = searchParams.toString();
  const filters = useMemo(
    () =>
      parseNewsFeedFiltersFromQuery({
        query: new URLSearchParams(searchParamsKey),
      }),
    [searchParamsKey],
  );

  const [refreshCounter, setRefreshCounter] = useState(0);
  const [requestOutcome, setRequestOutcome] = useState<NewsFeedRequestOutcome>(
    NO_NEWS_FEED_REQUEST_OUTCOME,
  );
  const [dismissedFailureRequestToken, setDismissedFailureRequestToken] =
    useState<string | null>(null);

  // Filters plus refresh count are the whole input to a request, so their
  // spelling is its identity — one effect stays the only thing issuing a request.
  const requestToken = `${refreshCounter}:${searchParamsKey}`;

  const hasHydrated = useSyncExternalStore(
    subscribeWithoutUpdates,
    getHydratedSnapshot,
    getServerSnapshot,
  );

  // Safe to read during the hydrating render because nothing derived from it
  // reaches the markup until `hasHydrated` flips on the second pass.
  const [seenKeys, setSeenKeys] = useState<Set<string>>(readSeenNewsItemKeys);

  const applyFilters = useCallback(
    (nextFilters: NewsFeedFilterState) => {
      // Written from here rather than from the URL effect so a preference is
      // only recorded for a filter change the reader actually made.
      persistNewsFeedFilterPreferences({ filters: nextFilters });

      const query = serializeNewsFeedFiltersToQuery({
        filters: nextFilters,
      }).toString();

      let nextHref = pathname;
      if (query) {
        nextHref = `${pathname}?${query}`;
      }
      router.replace(nextHref, { scroll: false });
    },
    [pathname, router],
  );

  const { isAwaitingStoredFilters } = useStoredNewsFeedFilterRestore({
    searchParamsKey,
    applyFilters,
  });

  useEffect(() => {
    // Hold the first request until a stored selection has had its chance to
    // rewrite the URL — fetching now would fan out across every feed for a view
    // about to be replaced.
    if (isAwaitingStoredFilters) {
      return;
    }

    const abortController = new AbortController();

    fetchCuratedNews({
      baseUrl: resolveNewsApiBaseUrl(),
      query: {
        sourceIds: filters.sourceIds,
        since: filters.since,
        until: filters.until,
        limit: filters.limit,
      },
      signal: abortController.signal,
    })
      .then((fetchedEnvelope) => {
        setRequestOutcome({
          requestToken,
          envelope: fetchedEnvelope,
          loadError: null,
          receivedAt: new Date(),
        });
      })
      .catch((error: Error) => {
        // An abort is this effect's own cleanup, not a failure to report.
        if (error.name === "AbortError") {
          return;
        }
        setRequestOutcome({
          requestToken,
          envelope: null,
          loadError: error,
          receivedAt: new Date(),
        });
      });

    return () => abortController.abort();
  }, [filters, requestToken, isAwaitingStoredFilters]);

  const {
    envelope,
    loadError,
    isRequestInFlight,
    items,
    failures,
    receivedAt,
  } = resolveNewsFeedViewState({ requestOutcome, requestToken });

  /** Following a link is the signal; nothing is marked on mount. */
  function markNewsItemAsSeen(identityKey: string) {
    markNewsItemKeysAsSeen({ keys: [identityKey] });
    setSeenKeys((previousKeys) => new Set(previousKeys).add(identityKey));
  }

  function markAllVisibleItemsAsSeen() {
    const identityKeys = items.map((item) =>
      buildNewsItemIdentityKey({ item }),
    );
    markNewsItemKeysAsSeen({ keys: identityKeys });
    setSeenKeys((previousKeys) => new Set([...previousKeys, ...identityKeys]));
  }

  function requestFeedRefresh() {
    setRefreshCounter((previousCounter) => previousCounter + 1);
  }

  // Dismissal is remembered per response: the next refresh may report a
  // different set of dead feeds, worth saying again.
  const showFailureNotice =
    failures.length > 0 &&
    dismissedFailureRequestToken !== requestOutcome.requestToken;

  return (
    <section
      className="news-feed-column"
      aria-label={translateNews("feedLabel")}
    >
      <NewsFeedFilterControls
        filters={filters}
        onFiltersChange={applyFilters}
        onRefresh={requestFeedRefresh}
        onMarkAllSeen={markAllVisibleItemsAsSeen}
        canMarkAllSeen={hasHydrated && items.length > 0}
      />

      {showFailureNotice ? (
        <NewsSourceFailureNotice
          failures={failures}
          onDismiss={() =>
            setDismissedFailureRequestToken(requestOutcome.requestToken)
          }
        />
      ) : null}

      <NewsFeedItemList
        envelope={envelope}
        loadError={loadError}
        isRequestInFlight={isRequestInFlight}
        hasActiveFilters={hasAnyActiveNewsFilter({ filters })}
        receivedAt={receivedAt}
        seenKeys={seenKeys}
        showSeenTags={hasHydrated}
        onFollowItemLink={markNewsItemAsSeen}
        onRetry={requestFeedRefresh}
      />
    </section>
  );
}
