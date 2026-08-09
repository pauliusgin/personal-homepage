"use client";

import { useTranslations } from "next-intl";
import { NEWS_FEED_LIMIT_OPTIONS } from "@/news/newsFeedFilterState";

interface NewsArticleCountFloatContentProps {
  selectedLimit: number;
  onLimitChange: (nextLimit: number) => void;
}

/** A radio group, not `aria-pressed` buttons: exactly one option is always in force. */
export function NewsArticleCountFloatContent({
  selectedLimit,
  onLimitChange,
}: NewsArticleCountFloatContentProps) {
  const translateNews = useTranslations("newsPage");

  return (
    <div
      className="news-article-count-panel"
      role="radiogroup"
      aria-label={translateNews("limitFilterLabel")}
    >
      {NEWS_FEED_LIMIT_OPTIONS.map((limitOption) => (
        <button
          key={limitOption}
          type="button"
          className="news-article-count-option"
          role="radio"
          aria-checked={selectedLimit === limitOption}
          aria-label={translateNews("limitOption", { limit: limitOption })}
          onClick={() => onLimitChange(limitOption)}
        >
          {limitOption}
        </button>
      ))}
    </div>
  );
}
