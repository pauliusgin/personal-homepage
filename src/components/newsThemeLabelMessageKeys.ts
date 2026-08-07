import type { NewsTheme } from "@/news/newsApiTypes";

/**
 * Theme slugs mapped onto keys relative to the `newsPage` namespace. Flat
 * rather than a nested `themes.<slug>` object: the ⌘K index in
 * `src/config/sitePageContent.ts` flattens a nested object to no passages.
 */
export const newsThemeLabelMessageKeys: Readonly<Record<NewsTheme, string>> = {
  "general-news": "themeGeneralNews",
  "software-development": "themeSoftwareDevelopment",
  cybersecurity: "themeCybersecurity",
  finance: "themeFinance",
};
