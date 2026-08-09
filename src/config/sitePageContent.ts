import { portfolioProjects } from "@/portfolio/portfolioProjects";

/**
 * The body copy each section's page renders, so a palette query matches what a
 * page says and not only what it is called. Keyed by `translationKey` from
 * `siteSections`; a section with no entry is matched on its label alone. A
 * value is a message holding either a string or an array of them.
 */
export const sitePageContentMessageKeys: Record<string, readonly string[]> = {
  about: ["aboutPage.paragraphs"],
  // Derived from the catalogue so adding a project cannot forget to index it.
  // Every leaf is named individually because `resolveSearchPaletteItems`
  // flattens a nested object to no passages, so naming the `projects` object
  // itself would silently index nothing.
  portfolio: portfolioProjects.flatMap((project) => [
    `portfolioPage.projects.${project.projectId}.title`,
    `portfolioPage.projects.${project.projectId}.descriptionParagraphs`,
  ]),
  // Feed items come from an HTTP API rather than the catalogue, so ⌘K matches
  // the page's vocabulary ("cybersecurity", "finance") but never a headline.
  news: [
    "newsPage.intro",
    "newsPage.themeGeneralNews",
    "newsPage.themeSoftwareDevelopment",
    "newsPage.themeCybersecurity",
    "newsPage.themeFinance",
  ],
};
