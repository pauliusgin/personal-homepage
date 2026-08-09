import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { ComponentType, ReactNode } from "react";
import { CodeBracketsGlyphIcon } from "@/components/icons/CodeBracketsGlyphIcon";
import { ExternalArrowIcon } from "@/components/icons/ExternalArrowIcon";
import { PortfolioProjectDescription } from "@/components/portfolio/PortfolioProjectDescription";
import type {
  PortfolioProjectEntry,
  PortfolioThumbnailKind,
} from "@/portfolio/portfolioProjects";
import {
  resolvePortfolioProjectLinks,
  type PortfolioProjectLinkKind,
} from "@/portfolio/resolvePortfolioProjectLinks";

/** Matches the box `portfolio.css` draws; declared so nothing shifts as images load. */
const PORTFOLIO_THUMBNAIL_WIDTH = 180;
const PORTFOLIO_THUMBNAIL_HEIGHT = 140;

/**
 * A screenshot takes the full measure below `--breakpoint-sm` — without saying
 * so the srcset is built from the 180px box alone and a phone stretches a 360px
 * file across ~600px. A logo keeps its box at every width.
 */
const portfolioThumbnailSizesByKind: Record<PortfolioThumbnailKind, string> = {
  screenshot: "(width < 40rem) 100vw, 180px",
  logo: "180px",
};

/**
 * GitHub is drawn with `CodeBracketsGlyphIcon` on the homepage row, so the same
 * mark answers "source" here — one site, one glyph per destination.
 */
const portfolioLinkGlyphIcons: Record<PortfolioProjectLinkKind, ComponentType> =
  {
    liveSite: ExternalArrowIcon,
    sourceRepository: CodeBracketsGlyphIcon,
  };

interface PortfolioProjectRowProps {
  project: PortfolioProjectEntry;
}

/**
 * Only the title recolours and only the title carries the ↗, matching the news
 * row: two blocks lighting up together would read as two destinations. The
 * description is deliberately not wrapped in the anchor so it stays selectable.
 */
export async function PortfolioProjectRow({
  project,
}: PortfolioProjectRowProps) {
  const translatePortfolio = await getTranslations("portfolioPage");

  const title = translatePortfolio(`projects.${project.projectId}.title`);
  // next-intl's `raw` is typed `any`, so the shape is asserted here rather than
  // trusted downstream — the same narrowing `AboutProseColumn` does.
  const descriptionParagraphs = translatePortfolio.raw(
    `projects.${project.projectId}.descriptionParagraphs`,
  ) as string[];

  // The first link is additionally wired to the title, so a destination is
  // stated in the labelled row rather than only implied by a linked title.
  // `titleOnlyLinkUrl` is the exception the row exists to allow: a destination
  // no label fits, so the title carries it and the labelled row stays empty.
  const projectLinks = resolvePortfolioProjectLinks({ project });
  const titleHref = project.titleOnlyLinkUrl ?? projectLinks[0]?.href;

  // A project with nowhere to send a visitor keeps a plain-text title: an arrow
  // promising a destination the row does not have is worse than no arrow.
  let titleContent: ReactNode = title;
  if (titleHref) {
    titleContent = (
      <a
        className="portfolio-item-link"
        href={titleHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        {title}
        <span className="portfolio-item-arrow">
          <ExternalArrowIcon />
        </span>
      </a>
    );
  }

  return (
    <li className="portfolio-item">
      <div
        className="portfolio-item-thumbnail"
        data-thumbnail-kind={project.thumbnailKind}
      >
        <Image
          className="portfolio-item-image"
          src={project.thumbnailImagePath}
          alt=""
          width={PORTFOLIO_THUMBNAIL_WIDTH}
          height={PORTFOLIO_THUMBNAIL_HEIGHT}
          sizes={portfolioThumbnailSizesByKind[project.thumbnailKind]}
        />
      </div>

      <div className="portfolio-item-body">
        <p className="portfolio-item-title">{titleContent}</p>

        <PortfolioProjectDescription paragraphs={descriptionParagraphs} />

        <div className="portfolio-item-footer">
          <p className="portfolio-item-tech-row">
            {translatePortfolio("technologiesLabel")}:{" "}
            {project.technologies.join(", ")}
          </p>

          {projectLinks.length > 0 ? (
            <p className="portfolio-item-link-row">
              {projectLinks.map((link) => {
                const LinkGlyphIcon = portfolioLinkGlyphIcons[link.linkKind];

                return (
                  <a
                    key={link.linkKind}
                    className="portfolio-item-secondary-link"
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="portfolio-item-secondary-link-icon">
                      <LinkGlyphIcon />
                    </span>
                    {translatePortfolio(link.labelMessageKey)}
                  </a>
                );
              })}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}
