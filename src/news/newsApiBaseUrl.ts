/**
 * The deployed default. Override in `.env.local` to point at a local
 * `news-server`, which binds `:8080`:
 *
 *     NEXT_PUBLIC_NEWS_API_BASE_URL=http://localhost:8080
 */
export const DEFAULT_NEWS_API_BASE_URL = "https://news.giniunas.com";

/**
 * Inlining is a build-time textual substitution, so this must stay a full
 * static member expression — a computed `process.env[name]` lookup comes back
 * empty in the browser bundle.
 */
const configuredNewsApiBaseUrl = process.env.NEXT_PUBLIC_NEWS_API_BASE_URL;

/** Strips any trailing slash so callers can concatenate `/api/news` blindly. */
export function resolveNewsApiBaseUrl(): string {
  const trimmedBaseUrl = configuredNewsApiBaseUrl?.trim();
  if (!trimmedBaseUrl) {
    return DEFAULT_NEWS_API_BASE_URL;
  }

  return trimmedBaseUrl.replace(/\/+$/, "");
}
