import type { NewsEnvelope, NewsErrorEnvelope } from "./newsApiTypes";

/**
 * Typed client for `GET /api/news`. Two omissions come from the API's CORS
 * contract: no `credentials`, because every response carries
 * `Access-Control-Allow-Origin: *`; and no custom headers, not even `Accept`,
 * so a plain `GET` stays a CORS simple request and skips preflight.
 */

/**
 * A non-`2xx`, carrying the server's developer-facing message. Surfaced loudly
 * rather than swallowed into an empty list: a `400` is only reachable by
 * sending a value the UI should have prevented.
 */
export class CuratedNewsRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "CuratedNewsRequestError";
  }
}

export interface CuratedNewsQueryParams {
  /** The API's `theme` parameter is not offered — see `newsApiTypes.ts`. */
  sourceIds?: readonly string[];
  /** `YYYY-MM-DD` (read in UTC, widened to the whole day) or RFC3339. */
  since?: string;
  /** `YYYY-MM-DD` (read in UTC, widened to the whole day) or RFC3339. */
  until?: string;
  /** Applied after filtering and sorting. Absent or `<= 0` means no limit. */
  limit?: number;
}

export interface BuildCuratedNewsQueryParams {
  params: CuratedNewsQueryParams;
}

/** Separate from the fetch so callers can reuse it for a cache key or debug URL. */
export function buildCuratedNewsQuery({
  params,
}: BuildCuratedNewsQueryParams): URLSearchParams {
  const query = new URLSearchParams();

  if (params.sourceIds?.length) {
    query.set("source", params.sourceIds.join(","));
  }
  if (params.since) {
    query.set("since", params.since);
  }
  if (params.until) {
    query.set("until", params.until);
  }
  if (params.limit !== undefined && params.limit > 0) {
    query.set("limit", String(params.limit));
  }

  return query;
}

function isNewsErrorEnvelope(value: unknown): value is NewsErrorEnvelope {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return typeof (value as NewsErrorEnvelope).error === "string";
}

/**
 * The parse is guarded because nothing guarantees the responder is the API — a
 * proxy error page answering HTML would turn a useful "HTTP 502" into a
 * `SyntaxError`.
 */
async function readCuratedNewsErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const errorBody: unknown = await response.json();
    if (isNewsErrorEnvelope(errorBody)) {
      return errorBody.error;
    }
  } catch {
    // Fall through to the status-only message below.
  }

  return `curated-news request failed with HTTP ${response.status}`;
}

export interface FetchCuratedNewsParams {
  /** Resolved by `resolveNewsApiBaseUrl()`; must carry no trailing slash. */
  baseUrl: string;
  query: CuratedNewsQueryParams;
  /** The server threads this through, so aborting also cancels its upstream fetches. */
  signal?: AbortSignal;
}

export async function fetchCuratedNews({
  baseUrl,
  query,
  signal,
}: FetchCuratedNewsParams): Promise<NewsEnvelope> {
  const requestUrl = `${baseUrl}/api/news?${buildCuratedNewsQuery({ params: query }).toString()}`;

  const response = await fetch(requestUrl, { signal });
  if (!response.ok) {
    throw new CuratedNewsRequestError(
      response.status,
      await readCuratedNewsErrorMessage(response),
    );
  }

  return response.json();
}
