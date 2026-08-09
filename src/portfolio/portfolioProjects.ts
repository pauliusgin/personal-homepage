/**
 * The project catalogue: structure only. Titles and descriptions live under
 * `portfolioPage.projects.<projectId>` in `locales/*.json`, because a URL and an
 * image are configuration while prose is copy — the same split `siteSections`
 * makes for the homepage rows.
 */

/**
 * A property of the image file rather than a style choice: a screenshot is a
 * rectangle that fills its box and earns a border, a logo is art on transparency
 * that must not be cropped and has no rectangle for a border to trace.
 */
export type PortfolioThumbnailKind = "screenshot" | "logo";

export interface PortfolioProjectEntry {
  /** Key under `portfolioPage.projects` in `locales/*.json`; also the React key. */
  projectId: string;
  /** Path under `public/`. */
  thumbnailImagePath: string;
  /**
   * Written as the ecosystem spells it — "Go", "Next.js". Not translated: a
   * language is a proper noun in every locale.
   */
  technologies: readonly string[];
  /**
   * Required rather than defaulted: a logo left as `screenshot` is cropped to
   * the box and framed by a border it does not fill.
   */
  thumbnailKind: PortfolioThumbnailKind;
  /** Absent when the project is not deployed anywhere a visitor can reach. */
  liveSiteUrl?: string;
  /** Absent when the source is private. Not every project's repo is public. */
  sourceRepositoryUrl?: string;
  /**
   * A destination carried by the title alone, with no labelled link beneath the
   * description — for a row whose target is neither a live site nor a repo, so
   * both existing labels would misname it. Commercial work is the case that
   * needs it: the only public page is the employer's.
   */
  titleOnlyLinkUrl?: string;
}

/** Order here is order on the page — the same contract `siteSections` keeps. */
export const portfolioProjects: readonly PortfolioProjectEntry[] = [
  {
    projectId: "curatedNews",
    technologies: ["Go"],
    thumbnailImagePath: "/portfolio/curated-news.webp",
    thumbnailKind: "screenshot",
    sourceRepositoryUrl: "https://github.com/pauliusgin/curated-news",
  },
  {
    projectId: "sistersArtGallery",
    technologies: [
      "TypeScript",
      "Node.js",
      "Express.js",
      "htmx",
      "PostgreSQL",
      "Firebase",
    ],
    thumbnailImagePath: "/portfolio/sisters-art-gallery.webp",
    thumbnailKind: "screenshot",
    liveSiteUrl: "https://www.sisters.lt/",
    sourceRepositoryUrl: "https://github.com/pauliusgin/sisters-art-v2",
  },
  {
    projectId: "totalLineCount",
    technologies: ["TypeScript"],
    thumbnailImagePath: "/portfolio/total-line-count.webp",
    thumbnailKind: "logo",
    liveSiteUrl:
      "https://marketplace.visualstudio.com/items?itemName=pauliusgin.total-line-count",
    sourceRepositoryUrl: "https://github.com/pauliusgin/total-line-count",
  },
  {
    projectId: "changeRoot",
    technologies: ["TypeScript"],
    thumbnailImagePath: "/portfolio/change-root.webp",
    thumbnailKind: "logo",
    liveSiteUrl:
      "https://marketplace.visualstudio.com/items?itemName=pauliusgin.change-root",
    sourceRepositoryUrl: "https://github.com/pauliusgin/change-root",
  },
  {
    projectId: "gettingApp",
    technologies: [
      "TypeScript",
      "PostgreSQL",
      "Firebase",
      "Redis",
      "Stripe",
      "H3",
    ],
    thumbnailImagePath: "/portfolio/gettingapp.webp",
    thumbnailKind: "logo",
    titleOnlyLinkUrl: "https://www.linkedin.com/company/gettingapp/",
  },
];
