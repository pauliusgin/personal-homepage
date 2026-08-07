import type {
  NewsEnvelope,
  NewsItem,
  NewsSourceFailure,
} from "@/news/newsApiTypes";

/**
 * One completed request, tagged with the request that produced it. The token
 * makes "is a request in flight" derived — a boolean flipped in the fetching
 * effect would cascade an extra render per filter change.
 */
export interface NewsFeedRequestOutcome {
  requestToken: string;
  envelope: NewsEnvelope | null;
  loadError: Error | null;
  /**
   * What the items' "…ago" labels are measured against, stored with the
   * response so a whole batch agrees on one "now". `null` before the first one.
   */
  receivedAt: Date | null;
}

/** No token, so every real token reads as in flight. */
export const NO_NEWS_FEED_REQUEST_OUTCOME: NewsFeedRequestOutcome = {
  requestToken: "",
  envelope: null,
  loadError: null,
  receivedAt: null,
};

export interface ResolveNewsFeedViewStateParams {
  requestOutcome: NewsFeedRequestOutcome;
  requestToken: string;
}

export interface NewsFeedViewState {
  envelope: NewsEnvelope | null;
  loadError: Error | null;
  isRequestInFlight: boolean;
  items: NewsItem[];
  failures: NewsSourceFailure[];
  /** Non-null whenever `envelope` is — the two are set by the same response. */
  receivedAt: Date | null;
}

/**
 * The envelope survives a token change, so a refresh dims the previous items
 * instead of blanking the page. A stale error does not: pressing retry has to
 * look like loading, not like the failure it is retrying.
 */
export function resolveNewsFeedViewState({
  requestOutcome,
  requestToken,
}: ResolveNewsFeedViewStateParams): NewsFeedViewState {
  const isRequestInFlight = requestOutcome.requestToken !== requestToken;

  let loadError = requestOutcome.loadError;
  if (isRequestInFlight) {
    loadError = null;
  }

  return {
    envelope: requestOutcome.envelope,
    loadError,
    isRequestInFlight,
    items: requestOutcome.envelope?.items ?? [],
    failures: requestOutcome.envelope?.failures ?? [],
    receivedAt: requestOutcome.receivedAt,
  };
}
