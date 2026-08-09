"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, useState } from "react";

interface PortfolioProjectDescriptionProps {
  paragraphs: readonly string[];
}

/**
 * Collapsed to `--portfolio-description-collapsed-height` with a "read more"
 * toggle beneath. The toggle only appears once the text is measured as
 * overflowing, so a two-line entry never offers to expand what is already whole.
 *
 * Measuring is the reason this is a client component: paragraph count says
 * nothing about rendered height, which depends on the column width and the
 * locale, and only the browser knows either.
 */
export function PortfolioProjectDescription({
  paragraphs,
}: PortfolioProjectDescriptionProps) {
  const translatePortfolio = useTranslations("portfolioPage");

  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const collapsibleElementRef = useRef<HTMLDivElement>(null);
  const collapsibleElementId = useId();

  // Read against the collapsed box, so expanding must not re-measure — an
  // expanded element has no overflow and would report the toggle away.
  const measureDescriptionOverflow = useCallback(() => {
    const collapsibleElement = collapsibleElementRef.current;
    if (!collapsibleElement || isExpanded) {
      return;
    }
    setIsOverflowing(
      collapsibleElement.scrollHeight > collapsibleElement.clientHeight,
    );
  }, [isExpanded]);

  // Wrapping changes with the column width, so the answer is re-derived on
  // resize rather than trusted from first paint.
  useEffect(() => {
    const collapsibleElement = collapsibleElementRef.current;
    if (!collapsibleElement) {
      return;
    }

    measureDescriptionOverflow();

    const resizeObserver = new ResizeObserver(measureDescriptionOverflow);
    resizeObserver.observe(collapsibleElement);

    return () => resizeObserver.disconnect();
  }, [measureDescriptionOverflow]);

  let toggleLabel = translatePortfolio("expandDescriptionLabel");
  if (isExpanded) {
    toggleLabel = translatePortfolio("collapseDescriptionLabel");
  }

  return (
    <div className="portfolio-item-description">
      <div
        ref={collapsibleElementRef}
        id={collapsibleElementId}
        className="portfolio-item-description-body"
        data-expanded={isExpanded}
      >
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className="portfolio-item-description-paragraph">
            {paragraph}
          </p>
        ))}
      </div>

      {isOverflowing ? (
        <button
          type="button"
          className="portfolio-item-description-toggle"
          aria-expanded={isExpanded}
          aria-controls={collapsibleElementId}
          onClick={() => setIsExpanded((wasExpanded) => !wasExpanded)}
        >
          {toggleLabel}
        </button>
      ) : null}
    </div>
  );
}
