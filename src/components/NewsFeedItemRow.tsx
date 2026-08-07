"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { ExternalArrowIcon } from "@/components/icons/ExternalArrowIcon";
import { newsThemeLabelMessageKeys } from "@/components/newsThemeLabelMessageKeys";
import { formatNewsItemPublishedAtWithAge } from "@/news/formatNewsItemPublishedAt";
import type { NewsItem } from "@/news/newsApiTypes";

interface NewsFeedItemRowProps {
  item: NewsItem;
  isSeen: boolean;
  /**
   * The seen-set lives in `localStorage`, which the server cannot read, so the
   * tag must stay out of the markup until server and client agree.
   */
  showSeenTags: boolean;
  /** What "ago" is measured from — see `NewsFeedRequestOutcome.receivedAt`. */
  publishedAtReferenceTime: Date;
  onFollowLink: () => void;
}

/**
 * Headline and description point at the same URL, but only the headline
 * recolours on hover — two accent blocks lighting up would read as two
 * destinations. Titles and descriptions are someone else's copy, so they are
 * rendered verbatim; only the site's own chrome is upper-cased.
 */
export function NewsFeedItemRow({
  item,
  isSeen,
  showSeenTags,
  publishedAtReferenceTime,
  onFollowLink,
}: NewsFeedItemRowProps) {
  const locale = useLocale();
  const translateNews = useTranslations("newsPage");

  const publishedAtLabel = formatNewsItemPublishedAtWithAge({
    publishedAt: item.publishedAt,
    locale,
    unknownDateLabel: translateNews("dateUnknown"),
    now: publishedAtReferenceTime,
  });

  const isMarkedSeen = showSeenTags && isSeen;

  // Both tags are withheld until hydration rather than defaulting to "new",
  // which would flash every row.
  let seenStateTag: ReactNode = null;
  if (showSeenTags) {
    seenStateTag = (
      <span className="news-item-new-tag">{translateNews("newTag")}</span>
    );
  }
  if (isMarkedSeen) {
    seenStateTag = (
      <span className="news-item-seen-tag">{translateNews("seenTag")}</span>
    );
  }

  let titleContent: ReactNode = item.title;
  if (item.link) {
    titleContent = (
      <a
        className="news-item-link"
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onFollowLink}
      >
        {item.title}
        <span className="news-item-arrow">
          <ExternalArrowIcon />
        </span>
      </a>
    );
  }

  let descriptionContent: ReactNode = item.description;
  if (item.description && item.link) {
    descriptionContent = (
      <a
        className="news-item-description-link"
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onFollowLink}
      >
        {item.description}
      </a>
    );
  }

  return (
    <li className="news-feed-item" data-seen={String(isMarkedSeen)}>
      <p className="news-item-meta">
        <span className="news-item-theme-tag">
          {translateNews(newsThemeLabelMessageKeys[item.theme])}
        </span>
        <span className="news-item-source-tag">{item.source}</span>
        {seenStateTag}
      </p>

      <p className="news-item-published-at">{publishedAtLabel}</p>

      <p className="news-item-title">{titleContent}</p>

      {item.description ? (
        <p className="news-item-description">{descriptionContent}</p>
      ) : null}
    </li>
  );
}
