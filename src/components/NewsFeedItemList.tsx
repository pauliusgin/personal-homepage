"use client";

import { useTranslations } from "next-intl";
import { NewsFeedItemRow } from "@/components/NewsFeedItemRow";
import { NewsFeedStatusLine } from "@/components/NewsFeedStatusLine";
import type { NewsEnvelope } from "@/news/newsApiTypes";
import { buildNewsItemIdentityKey } from "@/news/seenNewsItemStorage";

interface NewsFeedItemListProps {
  /** Null until the first response lands — that is the first-load state. */
  envelope: NewsEnvelope | null;
  loadError: Error | null;
  isRequestInFlight: boolean;
  /** Distinguishes "nothing matched your filters" from "the feed is empty". */
  hasActiveFilters: boolean;
  receivedAt: Date | null;
  seenKeys: ReadonlySet<string>;
  showSeenTags: boolean;
  onFollowItemLink: (identityKey: string) => void;
  onRetry: () => void;
}

/**
 * A refresh never blanks the page: once items exist they stay on screen and dim
 * while the next response is in flight; only the first load shows a bare line.
 */
export function NewsFeedItemList({
  envelope,
  loadError,
  isRequestInFlight,
  hasActiveFilters,
  receivedAt,
  seenKeys,
  showSeenTags,
  onFollowItemLink,
  onRetry,
}: NewsFeedItemListProps) {
  const translateNews = useTranslations("newsPage");

  if (loadError) {
    return (
      <div className="news-feed-error" role="alert">
        <p className="news-feed-error-heading">
          {translateNews("errorHeading")}
        </p>
        {/* The server's own message, verbatim — it names the offending value. */}
        <p className="news-feed-error-detail">{loadError.message}</p>
        <button type="button" className="news-filter-button" onClick={onRetry}>
          {translateNews("retry")}
        </button>
      </div>
    );
  }

  if (!envelope) {
    return <NewsFeedStatusLine message={translateNews("loading")} />;
  }

  if (envelope.items.length === 0) {
    let emptyMessage = translateNews("emptyFeed");
    if (hasActiveFilters) {
      emptyMessage = translateNews("emptyFiltered");
    }
    return <NewsFeedStatusLine message={emptyMessage} />;
  }

  // `receivedAt` is set by the same response that set `envelope`, so the
  // fallback is unreachable — the two fields are just separately nullable.
  const publishedAtReferenceTime = receivedAt ?? new Date();

  return (
    <>
      {isRequestInFlight ? (
        <NewsFeedStatusLine message={translateNews("refreshing")} />
      ) : null}

      <ol
        className="news-feed-list"
        data-refreshing={String(isRequestInFlight)}
      >
        {envelope.items.map((item, itemIndex) => {
          const identityKey = buildNewsItemIdentityKey({ item });
          return (
            // Two feeds can syndicate the same piece under the same link, so
            // the position disambiguates the React key.
            <NewsFeedItemRow
              key={`${itemIndex}:${identityKey}`}
              item={item}
              isSeen={seenKeys.has(identityKey)}
              showSeenTags={showSeenTags}
              publishedAtReferenceTime={publishedAtReferenceTime}
              onFollowLink={() => onFollowItemLink(identityKey)}
            />
          );
        })}
      </ol>
    </>
  );
}
