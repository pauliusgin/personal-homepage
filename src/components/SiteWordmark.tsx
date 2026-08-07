import { BackToHomeArrowLink } from "@/components/BackToHomeArrowLink";

interface SiteWordmarkProps {
  wordmarkText: string;
  /** The <640px face — see `wordmarkShort` in `locales/*.json`. */
  shortWordmarkText: string;
  backToHomeLabel: string;
}

/**
 * The name is inert type, not a link — the way home is the ← after the `|`, so
 * there is one visible target rather than a silently clickable word. Both faces
 * sit in the markup and CSS picks one at the 640px breakpoint.
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
