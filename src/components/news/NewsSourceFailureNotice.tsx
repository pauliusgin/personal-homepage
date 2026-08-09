"use client";

import { useTranslations } from "next-intl";
import type { NewsSourceFailure } from "@/news/newsApiTypes";

interface NewsSourceFailureNoticeProps {
  failures: readonly NewsSourceFailure[];
  onDismiss: () => void;
}

/**
 * A note beside the items, never a replacement for them — a broken feed never
 * fails the request. Only `source` is shown; `message` is developer-facing and
 * the API's guidance says never to display it.
 */
export function NewsSourceFailureNotice({
  failures,
  onDismiss,
}: NewsSourceFailureNoticeProps) {
  const translateNews = useTranslations("newsPage");

  const failedSourceNames = failures
    .map((failure) => failure.source)
    .join(", ");

  return (
    <div className="news-failure-notice" role="status">
      <p className="news-failure-text">
        {translateNews("partialFailure", { sources: failedSourceNames })}
      </p>
      {/* The word rather than a × glyph: the shipped Terminus subset is latin
          plus latin-ext, and anything outside it falls back to another face. */}
      <button type="button" className="news-filter-button" onClick={onDismiss}>
        {translateNews("dismiss")}
      </button>
    </div>
  );
}
