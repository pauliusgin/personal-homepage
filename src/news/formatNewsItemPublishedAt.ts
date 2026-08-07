/**
 * Framework-free on purpose: locale and labels are plain parameters rather than
 * `next-intl` lookups, so this works from a server component, a client
 * component or a test with no provider in scope.
 */

/**
 * Go's RFC3339 zero time, emitted for an item whose feed carried no parsable
 * date. It survives `since`/`until` filtering and reaches the renderer, so it
 * must be caught before formatting — otherwise a reader is shown "1 January 1".
 */
export const UNKNOWN_PUBLISHED_AT = "0001-01-01T00:00:00Z";

/** The year check catches any other pre-2000 sentinel: no real feed predates the web. */
export function isUnknownPublishedAt(publishedAt: string): boolean {
  if (publishedAt === UNKNOWN_PUBLISHED_AT) {
    return true;
  }

  const publishedDate = new Date(publishedAt);
  if (Number.isNaN(publishedDate.getTime())) {
    return true;
  }

  return publishedDate.getUTCFullYear() < 2000;
}

export interface FormatNewsItemPublishedAtParams {
  /** RFC3339 UTC string, possibly the zero time. */
  publishedAt: string;
  /** BCP-47 tag, i.e. the active locale: `"en"` or `"lt"`. */
  locale: string;
  unknownDateLabel: string;
  dateStyle?: Intl.DateTimeFormatOptions["dateStyle"];
  timeStyle?: Intl.DateTimeFormatOptions["timeStyle"];
}

/** Renders in the viewer's timezone, not UTC. */
export function formatNewsItemPublishedAt({
  publishedAt,
  locale,
  unknownDateLabel,
  dateStyle = "medium",
  timeStyle = "short",
}: FormatNewsItemPublishedAtParams): string {
  if (isUnknownPublishedAt(publishedAt)) {
    return unknownDateLabel;
  }

  return new Intl.DateTimeFormat(locale, { dateStyle, timeStyle }).format(
    new Date(publishedAt),
  );
}

interface RelativeAgeUnit {
  /** Upper bound, exclusive, on the age in seconds this unit covers. */
  maxAgeInSeconds: number;
  unit: Intl.RelativeTimeFormatUnit;
  secondsPerUnit: number;
}

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
/** Calendar-month lengths vary; 30 days is the conventional approximation. */
const SECONDS_PER_MONTH = 30 * SECONDS_PER_DAY;
const SECONDS_PER_YEAR = 365 * SECONDS_PER_DAY;

/** First row whose bound the age falls under wins. */
const RELATIVE_AGE_UNITS: readonly RelativeAgeUnit[] = [
  { maxAgeInSeconds: SECONDS_PER_MINUTE, unit: "second", secondsPerUnit: 1 },
  {
    maxAgeInSeconds: SECONDS_PER_HOUR,
    unit: "minute",
    secondsPerUnit: SECONDS_PER_MINUTE,
  },
  {
    maxAgeInSeconds: SECONDS_PER_DAY,
    unit: "hour",
    secondsPerUnit: SECONDS_PER_HOUR,
  },
  {
    maxAgeInSeconds: SECONDS_PER_MONTH,
    unit: "day",
    secondsPerUnit: SECONDS_PER_DAY,
  },
  {
    maxAgeInSeconds: SECONDS_PER_YEAR,
    unit: "month",
    secondsPerUnit: SECONDS_PER_MONTH,
  },
  {
    maxAgeInSeconds: Number.POSITIVE_INFINITY,
    unit: "year",
    secondsPerUnit: SECONDS_PER_YEAR,
  },
];

export interface FormatNewsItemRelativeAgeParams {
  publishedAt: string;
  locale: string;
  unknownDateLabel: string;
  relativeTimeStyle?: Intl.RelativeTimeFormatOptions["style"];
  /**
   * Passed in rather than read from `Date.now()` inside: ambient time is
   * non-deterministic between the server render and the client hydration of the
   * same markup, which React reports as a hydration mismatch.
   */
  now: Date;
}

/** Sign is preserved, so a feed with a skewed clock yields "in 3 minutes". */
export function formatNewsItemRelativeAge({
  publishedAt,
  locale,
  unknownDateLabel,
  now,
  relativeTimeStyle = "narrow",
}: FormatNewsItemRelativeAgeParams): string {
  if (isUnknownPublishedAt(publishedAt)) {
    return unknownDateLabel;
  }

  const ageInSeconds = (new Date(publishedAt).getTime() - now.getTime()) / 1000;
  const matchedUnit = RELATIVE_AGE_UNITS.find(
    ({ maxAgeInSeconds }) => Math.abs(ageInSeconds) < maxAgeInSeconds,
  );
  // The last row is unbounded, so `find` always matches; the fallback only
  // satisfies the type checker.
  const { unit, secondsPerUnit } =
    matchedUnit ?? RELATIVE_AGE_UNITS[RELATIVE_AGE_UNITS.length - 1];

  return new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
    style: relativeTimeStyle,
  }).format(Math.round(ageInSeconds / secondsPerUnit), unit);
}

/**
 * Hand-built, not `Intl`: the format must read identically on `/en` and `/lt`.
 * The calendar day is local so it agrees with the relative age beside it.
 */
function formatNewsItemCalendarDate(publishedDate: Date): string {
  const year = String(publishedDate.getFullYear()).padStart(4, "0");
  const month = String(publishedDate.getMonth() + 1).padStart(2, "0");
  const day = String(publishedDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Hand-built too: `Intl` would give `/en` a 12-hour `3:20 PM` and `/lt` `15:20`. */
function formatNewsItemClockTime(publishedDate: Date): string {
  const hours = String(publishedDate.getHours()).padStart(2, "0");
  const minutes = String(publishedDate.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export interface FormatNewsItemPublishedAtWithAgeParams {
  publishedAt: string;
  locale: string;
  unknownDateLabel: string;
  /** See `FormatNewsItemRelativeAgeParams.now`. */
  now: Date;
}

/** `2026-08-06 15:20, 15 min. ago` — the feed's publish-date line. */
export function formatNewsItemPublishedAtWithAge({
  publishedAt,
  locale,
  unknownDateLabel,
  now,
}: FormatNewsItemPublishedAtWithAgeParams): string {
  if (isUnknownPublishedAt(publishedAt)) {
    return unknownDateLabel;
  }

  const publishedDate = new Date(publishedAt);
  const calendarDate = formatNewsItemCalendarDate(publishedDate);
  const clockTime = formatNewsItemClockTime(publishedDate);
  const relativeAge = formatNewsItemRelativeAge({
    publishedAt,
    locale,
    unknownDateLabel,
    now,
  });

  return `${calendarDate} ${clockTime}, ${relativeAge}`;
}
