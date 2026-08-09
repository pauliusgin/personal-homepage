import type { PortfolioProjectEntry } from "@/portfolio/portfolioProjects";

/** Which destination a link points at; the label and the glyph follow from it. */
export type PortfolioProjectLinkKind = "liveSite" | "sourceRepository";

export interface PortfolioProjectLink {
  linkKind: PortfolioProjectLinkKind;
  href: string;
  /** Key under the `portfolioPage` namespace holding this link's visible label. */
  labelMessageKey: string;
}

export interface ResolvePortfolioProjectLinksParams {
  project: PortfolioProjectEntry;
}

/**
 * Collapses two optional URLs into one ordered list, so the row renders a title
 * and a `map` instead of branching once per link. A project with neither a live
 * site nor a public repo yields `[]` — the uninteresting case, represented.
 *
 * Live site first, and the order is load-bearing: the row renders every entry as
 * a labelled link beneath the description and additionally points the title at
 * the first one. A visitor who can use the thing cares less about the source.
 */
export function resolvePortfolioProjectLinks({
  project,
}: ResolvePortfolioProjectLinksParams): PortfolioProjectLink[] {
  const links: PortfolioProjectLink[] = [];

  if (project.liveSiteUrl) {
    links.push({
      linkKind: "liveSite",
      href: project.liveSiteUrl,
      labelMessageKey: "liveSiteLinkLabel",
    });
  }

  if (project.sourceRepositoryUrl) {
    links.push({
      linkKind: "sourceRepository",
      href: project.sourceRepositoryUrl,
      labelMessageKey: "sourceRepositoryLinkLabel",
    });
  }

  return links;
}
