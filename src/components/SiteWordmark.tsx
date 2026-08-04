import { BackToHomeArrowLink } from "@/components/BackToHomeArrowLink";

interface SiteWordmarkProps {
  wordmarkText: string;
  /** The <640px face — see `wordmarkShort` in `locales/*.json`. */
  shortWordmarkText: string;
  backToHomeLabel: string;
}

/**
 * The identity mark, pinned to the header's left gutter. The trailing `|` is
 * the brand mark — orange here and orange again as the separator on every row,
 * which is what turns the list into a vertical spine of accent marks.
 *
 * The name is inert type, not a link: the way home is the ← that follows the
 * `|` on every page but the homepage (see BackToHomeArrowLink), so there is one
 * visible, unambiguous target rather than a word that is silently clickable.
 *
 * Both faces of the name sit in the markup and CSS picks one: the full name
 * above 640px, the surname alone below it, where the wordmark and the controls
 * have to share a single line.
 */
export function SiteWordmark({
  wordmarkText,
  shortWordmarkText,
  backToHomeLabel,
}: SiteWordmarkProps) {
  return (
    <div className="wordmark">
      <span className="wordmark-full">{wordmarkText}</span>
      <span className="wordmark-short">{shortWordmarkText}</span>
      <span className="wordmark-cursor" aria-hidden>
        |
      </span>
      <BackToHomeArrowLink backToHomeLabel={backToHomeLabel} />
    </div>
  );
}
