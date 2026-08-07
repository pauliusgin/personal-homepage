import { findNewsSourceById } from "./newsSourceRegistry";

/**
 * Query-string filter state is untrusted input. Invariant: a query string can
 * never produce a request the server rejects (unknown source, malformed date,
 * `since` after `until` are each a `400`) — parsers validate and silently drop,
 * degrading to a valid, possibly wider, query.
 *
 * The API's `theme` parameter is deliberately not modelled: `theme` and
 * `source` intersect server-side, so carrying both allows a pair
 * (`?theme=finance&source=lrt`) that can only come back empty. A theme is
 * exactly the set of its sources.
 */

export const SOURCE_QUERY_PARAM = "source";
export const LIMIT_QUERY_PARAM = "limit";
export const SINCE_QUERY_PARAM = "since";
export const UNTIL_QUERY_PARAM = "until";

export interface NewsFeedFilterState {
  /** Registry-validated source IDs. Empty means "every source". */
  sourceIds: string[];
  limit: number;
  /** `YYYY-MM-DD` or RFC3339; `undefined` means no lower bound. */
  since: string | undefined;
  /** `YYYY-MM-DD` or RFC3339; `undefined` means no upper bound. */
  until: string | undefined;
}

/** A cold request fans out to every feed with a 10s per-feed timeout, so keep it small. */
export const DEFAULT_NEWS_FEED_LIMIT = 20;

/** Must stay within `MAX_NEWS_FEED_LIMIT`. */
export const NEWS_FEED_LIMIT_OPTIONS: readonly number[] = [20, 50, 100];

/** ~20 feeds produce hundreds of items, so 200 is effectively everything. */
export const MAX_NEWS_FEED_LIMIT = 200;

/**
 * Structural so both `URLSearchParams` and Next's `ReadonlyURLSearchParams`
 * satisfy it without a cast.
 */
export interface NewsFeedQuerySource {
  get(name: string): string | null;
  getAll(name: string): string[];
}

export function createDefaultNewsFeedFilterState(): NewsFeedFilterState {
  return {
    sourceIds: [],
    limit: DEFAULT_NEWS_FEED_LIMIT,
    since: undefined,
    until: undefined,
  };
}

interface ReadRepeatableQueryValuesParams {
  query: NewsFeedQuerySource;
  paramName: string;
}

/** `?a=x&a=y` and `?a=x,y` are the same request; a link may carry either. */
function readRepeatableQueryValues({
  query,
  paramName,
}: ReadRepeatableQueryValuesParams): string[] {
  return query
    .getAll(paramName)
    .flatMap((rawValue) => rawValue.split(","))
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

interface ParseFromQueryParams {
  query: NewsFeedQuerySource;
}

/**
 * URL order is preserved so a shared link survives a round trip byte-identical.
 * The canonical registry slug is what lands in the state.
 */
function parseSelectedSourceIdsFromQuery({
  query,
}: ParseFromQueryParams): string[] {
  const acceptedSourceIds = new Set<string>();

  for (const rawValue of readRepeatableQueryValues({
    query,
    paramName: SOURCE_QUERY_PARAM,
  })) {
    const registryEntry = findNewsSourceById({
      sourceId: rawValue.toLowerCase(),
    });
    if (registryEntry) {
      acceptedSourceIds.add(registryEntry.sourceId);
    }
  }

  return [...acceptedSourceIds];
}

/**
 * `Number`, not `parseInt` — `parseInt("20abc")` is `20`. Rejections fall back
 * to the default rather than `0`, which means "no limit" to the server.
 */
function parseNewsFeedLimitFromQuery({ query }: ParseFromQueryParams): number {
  const rawLimit = query.get(LIMIT_QUERY_PARAM);
  if (rawLimit === null) {
    return DEFAULT_NEWS_FEED_LIMIT;
  }

  const parsedLimit = Number(rawLimit.trim());
  if (!Number.isInteger(parsedLimit)) {
    return DEFAULT_NEWS_FEED_LIMIT;
  }
  if (parsedLimit < 1 || parsedLimit > MAX_NEWS_FEED_LIMIT) {
    return DEFAULT_NEWS_FEED_LIMIT;
  }

  return parsedLimit;
}

type NewsFeedDateBound = "since" | "until";

const BARE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const RFC3339_PATTERN =
  /^\d{4}-\d{2}-\d{2}[Tt]\d{2}:\d{2}:\d{2}(\.\d+)?([Zz]|[+-]\d{2}:\d{2})$/;

/**
 * Mirrors how the server widens a bare `YYYY-MM-DD`, so both bounds can be
 * compared on one scale. Widening is UTC: a reader in `UTC+3` picking "today"
 * gets the UTC day.
 */
const BARE_DATE_WIDENING_SUFFIX: Readonly<Record<NewsFeedDateBound, string>> = {
  since: "T00:00:00.000Z",
  until: "T23:59:59.999Z",
};

interface ResolveDateBoundInstantParams {
  value: string;
  bound: NewsFeedDateBound;
}

function resolveDateBoundInstant({
  value,
  bound,
}: ResolveDateBoundInstantParams): number {
  if (BARE_DATE_PATTERN.test(value)) {
    return Date.parse(`${value}${BARE_DATE_WIDENING_SUFFIX[bound]}`);
  }

  return Date.parse(value);
}

interface ParseDateBoundValueParams {
  rawValue: string | null;
  bound: NewsFeedDateBound;
}

/**
 * `Date.parse` is not a calendar check — `2026-02-31` silently becomes 3 March.
 * Both accepted shapes share their first ten characters, so one round trip
 * through `Date.UTC` covers them.
 */
function hasRealCalendarDate(value: string): boolean {
  const [year, month, day] = value
    .slice(0, 10)
    .split("-")
    .map((part) => Number(part));

  const roundTripped = new Date(Date.UTC(year, month - 1, day));
  return (
    roundTripped.getUTCFullYear() === year &&
    roundTripped.getUTCMonth() === month - 1 &&
    roundTripped.getUTCDate() === day
  );
}

function parseDateBoundValue({
  rawValue,
  bound,
}: ParseDateBoundValueParams): string | undefined {
  if (rawValue === null) {
    return undefined;
  }

  const trimmedValue = rawValue.trim();
  const hasKnownShape =
    BARE_DATE_PATTERN.test(trimmedValue) || RFC3339_PATTERN.test(trimmedValue);
  if (!hasKnownShape) {
    return undefined;
  }

  if (!hasRealCalendarDate(trimmedValue)) {
    return undefined;
  }

  if (Number.isNaN(resolveDateBoundInstant({ value: trimmedValue, bound }))) {
    return undefined;
  }

  return trimmedValue;
}

interface NewsFeedDateBounds {
  since: string | undefined;
  until: string | undefined;
}

/**
 * `since` after `until` is a `400`. The upper bound is the one dropped:
 * widening toward "now" still answers the reader's question, where dropping
 * `since` would return the whole corpus.
 */
function parseNewsFeedDateBounds({
  query,
}: ParseFromQueryParams): NewsFeedDateBounds {
  const since = parseDateBoundValue({
    rawValue: query.get(SINCE_QUERY_PARAM),
    bound: "since",
  });
  const until = parseDateBoundValue({
    rawValue: query.get(UNTIL_QUERY_PARAM),
    bound: "until",
  });

  if (!since || !until) {
    return { since, until };
  }

  const sinceInstant = resolveDateBoundInstant({
    value: since,
    bound: "since",
  });
  const untilInstant = resolveDateBoundInstant({
    value: until,
    bound: "until",
  });
  if (sinceInstant > untilInstant) {
    return { since, until: undefined };
  }

  return { since, until };
}

export interface ParseNewsFeedFiltersFromQueryParams {
  query: NewsFeedQuerySource;
}

export function parseNewsFeedFiltersFromQuery({
  query,
}: ParseNewsFeedFiltersFromQueryParams): NewsFeedFilterState {
  const { since, until } = parseNewsFeedDateBounds({ query });

  return {
    sourceIds: parseSelectedSourceIdsFromQuery({ query }),
    limit: parseNewsFeedLimitFromQuery({ query }),
    since,
    until,
  };
}

export interface SerializeNewsFeedFiltersToQueryParams {
  filters: NewsFeedFilterState;
}

/** Defaults are omitted, so a present parameter always means the reader chose it. */
export function serializeNewsFeedFiltersToQuery({
  filters,
}: SerializeNewsFeedFiltersToQueryParams): URLSearchParams {
  const query = new URLSearchParams();

  if (filters.sourceIds.length > 0) {
    query.set(SOURCE_QUERY_PARAM, filters.sourceIds.join(","));
  }
  if (filters.since) {
    query.set(SINCE_QUERY_PARAM, filters.since);
  }
  if (filters.until) {
    query.set(UNTIL_QUERY_PARAM, filters.until);
  }
  if (filters.limit !== DEFAULT_NEWS_FEED_LIMIT) {
    query.set(LIMIT_QUERY_PARAM, String(filters.limit));
  }

  return query;
}
