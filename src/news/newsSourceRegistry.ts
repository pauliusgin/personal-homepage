import type { NewsTheme } from "./newsApiTypes";
import { NEWS_THEMES } from "./newsApiTypes";

/**
 * The server's source registry, transcribed by hand — no endpoint lists it. A
 * feed added server-side stays invisible to the UI until added here. The same
 * list is printed by the server's `news-cli sources`.
 */

export interface NewsSourceRegistryEntry {
  /** The exact value to send as `?source=` — a wrong slug is a `400`. */
  sourceId: string;
  displayName: string;
  theme: NewsTheme;
}

/**
 * In the server's own table order — use `groupNewsSourcesByTheme()` for display.
 *
 * `ft-myft` is always a valid `?source=` value, but the server only fetches it
 * when started with `FINANCIAL_TIMES_RSS_KEY` set. Without the key it answers
 * `200` with both `items` and `failures` empty, so empty-with-no-failure must
 * never be rendered as an error.
 */
export const newsSourceRegistry: readonly NewsSourceRegistryEntry[] = [
  { sourceId: "lrt", displayName: "LRT", theme: "general-news" },
  { sourceId: "euronews", displayName: "Euronews", theme: "general-news" },
  {
    sourceId: "dzone-security",
    displayName: "DZone Security Zone",
    theme: "software-development",
  },
  {
    sourceId: "dzone-ai-ml",
    displayName: "DZone AI/ML Zone",
    theme: "software-development",
  },
  {
    sourceId: "dzone-tools",
    displayName: "DZone Tools Zone",
    theme: "software-development",
  },
  {
    sourceId: "crazy-programmer",
    displayName: "The Crazy Programmer",
    theme: "software-development",
  },
  {
    sourceId: "alex-edwards",
    displayName: "Alex Edwards",
    theme: "software-development",
  },
  {
    sourceId: "eblog",
    displayName: "eblog: software articles by Efron Licht",
    theme: "software-development",
  },
  {
    sourceId: "modem-dev",
    displayName: "Modem Blog",
    theme: "software-development",
  },
  {
    sourceId: "bleepingcomputer",
    displayName: "BleepingComputer",
    theme: "cybersecurity",
  },
  {
    sourceId: "the-record",
    displayName: "The Record from Recorded Future News",
    theme: "cybersecurity",
  },
  {
    sourceId: "darkreading",
    displayName: "Dark Reading",
    theme: "cybersecurity",
  },
  { sourceId: "csoonline", displayName: "CSO Online", theme: "cybersecurity" },
  {
    sourceId: "ft-myft",
    displayName: "Financial Times (myFT)",
    theme: "finance",
  },
  {
    sourceId: "eba",
    displayName: "European Banking Authority",
    theme: "finance",
  },
  {
    sourceId: "financial-regulation-news",
    displayName: "Financial Regulation News",
    theme: "finance",
  },
  {
    sourceId: "intl-accounting-bulletin",
    displayName: "International Accounting Bulletin",
    theme: "finance",
  },
  {
    sourceId: "journal-of-accountancy",
    displayName: "Journal of Accountancy",
    theme: "finance",
  },
  {
    sourceId: "accounting-today",
    displayName: "Accounting Today",
    theme: "finance",
  },
  {
    sourceId: "ias-plus",
    displayName: "Deloitte's IAS Plus",
    theme: "finance",
  },
];

export interface NewsSourceThemeGroup {
  theme: NewsTheme;
  sources: readonly NewsSourceRegistryEntry[];
}

/**
 * Built once at module load, so the array identity is stable across renders.
 * The collator is pinned to `"en"`: the names are untranslated proper nouns and
 * must list identically on `/en` and `/lt`.
 */
const newsSourceThemeGroups: readonly NewsSourceThemeGroup[] = NEWS_THEMES.map(
  (theme) => ({
    theme,
    sources: newsSourceRegistry
      .filter((entry) => entry.theme === theme)
      .sort((left, right) =>
        left.displayName.localeCompare(right.displayName, "en"),
      ),
  }),
);

export function groupNewsSourcesByTheme(): readonly NewsSourceThemeGroup[] {
  return newsSourceThemeGroups;
}

export interface FindNewsSourcesInThemeParams {
  theme: NewsTheme;
}

export function findNewsSourcesInTheme({
  theme,
}: FindNewsSourcesInThemeParams): readonly NewsSourceRegistryEntry[] {
  const themeGroup = newsSourceThemeGroups.find(
    (group) => group.theme === theme,
  );
  return themeGroup?.sources ?? [];
}

const newsSourceRegistryBySourceId: ReadonlyMap<
  string,
  NewsSourceRegistryEntry
> = new Map(newsSourceRegistry.map((entry) => [entry.sourceId, entry]));

export interface FindNewsSourceByIdParams {
  sourceId: string;
}

/**
 * Doubles as the filter parser's validity check: anything returning `undefined`
 * must never reach a request, since an unknown source is a `400`.
 */
export function findNewsSourceById({
  sourceId,
}: FindNewsSourceByIdParams): NewsSourceRegistryEntry | undefined {
  return newsSourceRegistryBySourceId.get(sourceId);
}
