# Consuming the curated-news HTTP API from a frontend

This is the client-side companion to the API reference in [README.md](README.md#http-api).
It covers what a browser app needs: the exact shapes that come back, how to build the query
string, what to do about partial failures, and the behaviours that are easy to get wrong
(no pagination, no cache headers, a zero publish date).

The API is public, read-only and unauthenticated. There are no tokens, cookies or headers to
send — a plain `fetch(url)` is a complete request.

## Base URL and endpoints

`news-server` binds `:8080` by default, so in local development the base URL is
`http://localhost:8080`.

| Method    | Path        | Purpose                         |
| --------- | ----------- | ------------------------------- |
| `GET`     | `/api/news` | the filtered, sorted feed items |
| `GET`     | `/healthz`  | liveness probe, touches no feed |
| `HEAD`    | either      | same status as `GET`, no body   |
| `OPTIONS` | either      | CORS preflight, `204`           |

Anything else on those paths is `405` with an `Allow: GET, HEAD, OPTIONS` header. Any other
path is `404`.

## CORS

Every response — including error responses — carries `Access-Control-Allow-Origin: *`.
Preflights answer `204` with `Access-Control-Allow-Methods: GET, HEAD, OPTIONS` and
`Access-Control-Allow-Headers: Accept, Content-Type`.

Consequences for the client:

- No origin allowlist to register. Any origin, including `file://` pages and `localhost`
  dev servers on any port, can call it.
- Do **not** set `credentials: 'include'`. A wildcard `Access-Control-Allow-Origin` is
  incompatible with credentialed requests and the browser will reject the response. There is
  nothing to authenticate anyway.
- A plain `GET` with no custom headers is a simple request → no preflight round trip. If you
  add an `Accept: application/json` header the preflight is still answered correctly, but it
  costs an extra round trip and buys nothing: the server always replies
  `Content-Type: application/json; charset=utf-8`.

## Response shapes

Copy these into your codebase as-is; they mirror the server's structs field for field.

```ts
/** The four canonical theme slugs. Responses only ever contain these — never an alias. */
export type NewsTheme =
  | "general-news"
  | "software-development"
  | "cybersecurity"
  | "finance";

export interface NewsItem {
  theme: NewsTheme;
  source: string; // human display name, e.g. "BleepingComputer"
  sourceId: string; // stable registry slug, e.g. "bleepingcomputer"
  title: string;
  description?: string; // omitted when the feed carried none
  link?: string; // omitted when the feed carried none
  publishedAt: string; // RFC3339 UTC; "0001-01-01T00:00:00Z" means unknown
}

export interface NewsSourceFailure {
  sourceId: string;
  source: string;
  message: string;
}

export interface NewsEnvelope {
  count: number; // always equals items.length
  items: NewsItem[]; // always an array, never null
  failures: NewsSourceFailure[]; // always an array; [] when every feed answered
}

export interface NewsErrorEnvelope {
  error: string; // human-readable, names the offending value
}

export interface HealthEnvelope {
  status: "ok";
}
```

Three guarantees worth relying on:

- `items` and `failures` are `[]` when empty, never `null` and never absent. No null check
  and no optional chaining needed on either.
- `count === items.length`. It is a convenience, not a total-before-limit — see
  [No pagination](#no-pagination) below.
- Items arrive **newest first**, ties broken by `sourceId` then `title`. The order is stable:
  identical inputs produce identical output. Re-sorting client-side is only needed if you
  want a different order.

## Query parameters

All optional. Omitting everything returns every item from every source.

| param    | value                       | notes                                  |
| -------- | --------------------------- | -------------------------------------- |
| `theme`  | theme slug or alias         | repeatable and/or comma-separated      |
| `source` | source ID from the registry | repeatable and/or comma-separated      |
| `since`  | `YYYY-MM-DD` or RFC3339     | inclusive lower bound on `publishedAt` |
| `until`  | `YYYY-MM-DD` or RFC3339     | inclusive upper bound on `publishedAt` |
| `limit`  | non-negative integer        | `0` or absent = no limit               |

`?theme=finance&theme=news` and `?theme=finance,news` are the same request — `URLSearchParams`
with repeated `append` calls works, and so does one joined string. Blank entries are dropped,
so a trailing comma is not an error.

`theme` and `source` intersect: `?theme=finance&source=lrt` returns nothing, because `lrt` is
a `general-news` source and it must satisfy both.

### Dates

A bare `YYYY-MM-DD` is read **in UTC** and widened to the edge of that day: `since` to
`00:00:00`, `until` to the last instant of the day. So `?since=2026-07-24&until=2026-07-24`
covers that whole day, and a user in `UTC+3` picking "today" in a date picker gets the UTC
day, not their local one. If local-day semantics matter, send full RFC3339 bounds instead:

```ts
const startOfLocalDay = new Date(2026, 6, 24, 0, 0, 0);
const sinceParam = startOfLocalDay.toISOString(); // "2026-07-23T21:00:00.000Z" in UTC+3
```

RFC3339 values are used verbatim (converted to UTC). `since` after `until` is a `400`.

### Themes and their aliases

Aliases are accepted on the way in and case-insensitively; the response always carries the
canonical slug. Build filter UIs against the canonical slugs so request and response line up.

| canonical slug         | also accepted                  |
| ---------------------- | ------------------------------ |
| `general-news`         | `general`, `news`              |
| `software-development` | `software`, `dev`, `tech`      |
| `cybersecurity`        | `security`, `cyber`, `infosec` |
| `finance`              | `financial`, `audit`           |

An unknown theme is a `400`, not a silent empty result.

### Source IDs

The registry is fixed and hardcoded — there is no endpoint that lists it, so if you need a
source picker, hardcode this table client-side (the CLI's `news-cli sources` prints the same
list).

| sourceId                    | name                                    | theme                  |
| --------------------------- | --------------------------------------- | ---------------------- |
| `lrt`                       | LRT                                     | `general-news`         |
| `euronews`                  | Euronews                                | `general-news`         |
| `dzone-security`            | DZone Security Zone                     | `software-development` |
| `dzone-ai-ml`               | DZone AI/ML Zone                        | `software-development` |
| `dzone-tools`               | DZone Tools Zone                        | `software-development` |
| `crazy-programmer`          | The Crazy Programmer                    | `software-development` |
| `alex-edwards`              | Alex Edwards                            | `software-development` |
| `eblog`                     | eblog: software articles by Efron Licht | `software-development` |
| `modem-dev`                 | Modem Blog                              | `software-development` |
| `bleepingcomputer`          | BleepingComputer                        | `cybersecurity`        |
| `the-record`                | The Record from Recorded Future News    | `cybersecurity`        |
| `darkreading`               | Dark Reading                            | `cybersecurity`        |
| `csoonline`                 | CSO Online                              | `cybersecurity`        |
| `ft-myft`                   | Financial Times (myFT)                  | `finance`              |
| `eba`                       | European Banking Authority              | `finance`              |
| `financial-regulation-news` | Financial Regulation News               | `finance`              |
| `intl-accounting-bulletin`  | International Accounting Bulletin       | `finance`              |
| `journal-of-accountancy`    | Journal of Accountancy                  | `finance`              |
| `accounting-today`          | Accounting Today                        | `finance`              |
| `ias-plus`                  | Deloitte's IAS Plus                     | `finance`              |

An unknown source ID is a `400`.

`ft-myft` is a special case: it is always a **valid** parameter value, but the server only
actually fetches it when it was started with `FINANCIAL_TIMES_RSS_KEY` set. On a server
without the key, `?source=ft-myft` returns `200` with both `items` and `failures` empty — the
source simply is not in that server's registry. Do not read empty-with-no-failure as an error.

## Status codes and error handling

| status | when                                               | body                |
| ------ | -------------------------------------------------- | ------------------- |
| `200`  | success, including when some feeds failed          | `NewsEnvelope`      |
| `204`  | `OPTIONS` preflight                                | none                |
| `400`  | bad `theme`, `source`, `since`, `until` or `limit` | `NewsErrorEnvelope` |
| `404`  | unknown path                                       | `NewsErrorEnvelope` |
| `405`  | method other than `GET`/`HEAD`/`OPTIONS`           | `NewsErrorEnvelope` |

`400` messages are written to be shown to a developer, and they name the offending value:

```json
{ "error": "unknown theme \"crypto\"" }
{ "error": "unknown source \"lrt-news\"" }
{ "error": "invalid date \"24-07-2026\": expected YYYY-MM-DD or RFC3339" }
{ "error": "invalid limit \"-5\": expected a non-negative integer, or 0 for no limit" }
{ "error": "since 2026-08-01T00:00:00Z is after until 2026-07-01T23:59:59Z" }
```

A `400` is a bug in your query construction, not a user-facing condition — every one of them
is reachable only by sending a value your own UI should have prevented. Surface them loudly in
development rather than swallowing them into an empty list.

There is no `5xx` for an upstream feed being down. That is what `failures` is for.

## Partial failures

An unreachable or broken feed never fails the request. It contributes one entry to `failures`
and every other feed's items still come back:

```json
{
  "count": 42,
  "items": [
    /* ... */
  ],
  "failures": [
    {
      "sourceId": "ft-myft",
      "source": "Financial Times (myFT)",
      "message": "unexpected HTTP status 403 Forbidden"
    }
  ]
}
```

`failures` is `[]` when every feed answered — `envelope.failures.length` is always safe, and
so is iterating it without a guard.

`message` is deliberately URL-free (some feed URLs embed an account key, and this endpoint is
public). It is either an HTTP status line or one of a short fixed set: `request timed out`,
`request cancelled`, `connection failed`, `feed host could not be resolved`,
`invalid feed URL`, `building request: …`, `parsing feed: …`, `unknown source format "…"`.
Use `source` for display and `sourceId` for logic; do not parse `message`.

Suggested UX: render the items normally and show a dismissible note listing the failed source
names. A feed being down for one refresh is routine — do not blank the page over it.

## Unknown publish dates

An item whose feed gave no parsable date arrives as
`"publishedAt": "0001-01-01T00:00:00Z"`. It is deliberately **never filtered out** by
`since`/`until` (it has no instant to compare), and it sorts to the bottom of the newest-first
order.

Guard for it before formatting, or a user sees "January 1, year 1":

```ts
const UNKNOWN_PUBLISHED_AT = "0001-01-01T00:00:00Z";

export function formatItemPublishedAt(item: NewsItem): string {
  if (item.publishedAt === UNKNOWN_PUBLISHED_AT) {
    return "date unknown";
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(item.publishedAt));
}
```

Comparing the string against the constant is exact — the server emits Go's RFC3339 zero time
in that one spelling. If you prefer not to depend on that, `new Date(item.publishedAt).getUTCFullYear() < 2000`
is equivalent for any real feed item.

## No pagination

There is no `offset`, `page` or `cursor`, and `count` is the size of the returned page, not a
total. `limit` is applied **after** filtering and sorting, so `?limit=20` means "the 20 most
recent matching items" — a stable, useful answer, but you cannot walk past it with an offset.

Two workable strategies:

1. **Fetch a window, page client-side.** Request `?limit=200` once, slice locally. The whole
   registry is 21 sources, so full result sets are hundreds of items, not thousands.
2. **Page by date.** After rendering a batch, take the oldest item's `publishedAt` and request
   `?until=<that timestamp>` for the next batch. Items sitting exactly on the bound are
   included, so drop the duplicate by `link` or by `sourceId` + `title`.

## Caching and refresh cadence

The server keeps parsed items in memory for 15 minutes by default (`--cache-ttl`), so repeated
requests are cheap and mostly do not touch the upstream feeds.

It sends **no** `Cache-Control`, `ETag` or `Last-Modified`, so the browser will not cache the
response and every call is a real request. Practical guidance:

- Do not poll faster than the server's cache TTL — you will get identical bytes back. Once
  every few minutes is plenty; a manual refresh button is better than a tight interval.
- A cold request (empty cache) fans out to every selected feed with a 10s per-feed timeout,
  so the first call after startup can take several seconds. Narrowing with `theme` or `source`
  fetches fewer feeds and returns faster.
- Show a loading state on first load and keep the previous items visible during a refresh.

## A typed client

```ts
export interface FetchCuratedNewsParams {
  baseUrl: string;
  themes?: NewsTheme[];
  sourceIds?: string[];
  since?: string; // YYYY-MM-DD or RFC3339
  until?: string; // YYYY-MM-DD or RFC3339
  limit?: number; // 0 or omitted -> no limit
  signal?: AbortSignal;
}

export class CuratedNewsRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "CuratedNewsRequestError";
  }
}

export function buildCuratedNewsQuery(
  params: FetchCuratedNewsParams,
): URLSearchParams {
  const query = new URLSearchParams();
  if (params.themes?.length) {
    query.set("theme", params.themes.join(","));
  }
  if (params.sourceIds?.length) {
    query.set("source", params.sourceIds.join(","));
  }
  if (params.since) {
    query.set("since", params.since);
  }
  if (params.until) {
    query.set("until", params.until);
  }
  if (params.limit && params.limit > 0) {
    query.set("limit", String(params.limit));
  }
  return query;
}

export async function fetchCuratedNews(
  params: FetchCuratedNewsParams,
): Promise<NewsEnvelope> {
  const query = buildCuratedNewsQuery(params);
  const requestUrl = `${params.baseUrl}/api/news?${query.toString()}`;

  const response = await fetch(requestUrl, { signal: params.signal });
  if (!response.ok) {
    const errorEnvelope: NewsErrorEnvelope = await response.json();
    throw new CuratedNewsRequestError(response.status, errorEnvelope.error);
  }

  return response.json();
}
```

Notes on that code:

- Every error body is JSON, including `404` and `405`, so parsing the failure branch as JSON
  is safe.
- Passing an `AbortSignal` is worth doing. The handler threads the request context straight
  into the fetcher, so aborting a request the user navigated away from also cancels the
  upstream feed downloads the server was still waiting on.
- `limit` is only sent when positive; sending `limit=0` is legal and means the same as sending
  nothing, but omitting it keeps URLs (and any client-side cache keys built from them) tidy.

### React usage sketch

```tsx
function useCuratedNews(params: Omit<FetchCuratedNewsParams, "signal">) {
  const [envelope, setEnvelope] = useState<NewsEnvelope | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    fetchCuratedNews({ ...params, signal: abortController.signal })
      .then(setEnvelope)
      .catch((error: Error) => {
        if (error.name !== "AbortError") {
          setLoadError(error);
        }
      });

    return () => abortController.abort();
  }, [
    params.baseUrl,
    params.themes?.join(","),
    params.sourceIds?.join(","),
    params.since,
    params.until,
    params.limit,
  ]);

  return { envelope, loadError, failures: envelope?.failures ?? [] };
}
```

## Health check

```
GET /healthz  ->  200  {"status":"ok"}
```

Answers without touching any feed, so it is a liveness signal only — a `200` here says
nothing about whether the upstream feeds are reachable. `HEAD /healthz` returns the same `200`
with no body.

## Worked examples

```
# Three most recent security or general-news items since a date.
GET /api/news?theme=security,news&since=2026-07-22&limit=3

# Everything published on one UTC day, every theme.
GET /api/news?since=2026-07-24&until=2026-07-24

# Two named sources, no date bound, latest 50.
GET /api/news?source=lrt,euronews&limit=50

# One theme, last 24 hours, using an exact instant.
GET /api/news?theme=cybersecurity&since=2026-08-05T09:00:00Z
```
