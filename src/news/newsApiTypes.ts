/**
 * Wire types for the curated-news HTTP API, mirroring the server's structs field
 * for field. Nothing here is a view model — if a shape diverges, this file is
 * wrong, not the server.
 */

/** Responses carry canonical slugs only, never one of the server's aliases. */
export type NewsTheme =
  | "general-news"
  | "software-development"
  | "cybersecurity"
  | "finance";

/** Editorial display order — broad news first, then specialist themes. */
export const NEWS_THEMES: readonly NewsTheme[] = [
  "general-news",
  "software-development",
  "cybersecurity",
  "finance",
];

export interface NewsItem {
  theme: NewsTheme;
  /** Human display name, e.g. "BleepingComputer". Use this for rendering. */
  source: string;
  /** Stable registry slug, e.g. "bleepingcomputer". Use this for logic and keys. */
  sourceId: string;
  title: string;
  description?: string;
  link?: string;
  /**
   * RFC3339 UTC. `"0001-01-01T00:00:00Z"` means the feed gave no parsable date;
   * see `formatNewsItemPublishedAt.ts` before formatting this anywhere.
   */
  publishedAt: string;
}

/**
 * One unreadable upstream feed. A broken feed never fails the request — it
 * lands here and every other feed's items still come back.
 *
 * `message` is deliberately URL-free (some feed URLs embed an account key and
 * this endpoint is public). Display `source`, branch on `sourceId`, never parse
 * `message`.
 */
export interface NewsSourceFailure {
  sourceId: string;
  source: string;
  message: string;
}

/**
 * The `200` body. Server guarantees: `items` is `[]` rather than `null` when
 * nothing matched; `count === items.length` always (there is no pagination, so
 * it is never a total-before-limit); items arrive newest-first, ties broken by
 * `sourceId` then `title`.
 */
export interface NewsEnvelope {
  count: number;
  items: NewsItem[];
  failures?: NewsSourceFailure[];
}

/** The body of every non-`200` response, including `404` and `405`. */
export interface NewsErrorEnvelope {
  error: string;
}
