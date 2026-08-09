interface NewsFeedStatusLineProps {
  message: string;
}

/**
 * Takes a finished string rather than translating, so the same element serves
 * as the server-rendered `<Suspense>` fallback and as the client's in-flight
 * state.
 */
export function NewsFeedStatusLine({ message }: NewsFeedStatusLineProps) {
  return (
    <p className="news-feed-status" aria-live="polite">
      {message}
    </p>
  );
}
