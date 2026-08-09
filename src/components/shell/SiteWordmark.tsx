import { BackToHomeArrowLink } from "@/components/shell/BackToHomeArrowLink";
import { HomeRoleTitleLabel } from "@/components/shell/HomeRoleTitleLabel";

interface SiteWordmarkProps {
  wordmarkText: string;
  /** The <640px face — see `wordmarkShort` in `locales/*.json`. */
  shortWordmarkText: string;
  roleTitleText: string;
  backToHomeLabel: string;
}

/**
 * The name is inert type, not a link — the way home is the ← after the `|`, so
 * there is one visible target rather than a silently clickable word. Both faces
 * sit in the markup and CSS picks one at the 640px breakpoint.
 *
 * The slot after the `|` carries the role title on the homepage and the ← on
 * every other route.
 */
export function SiteWordmark({
  wordmarkText,
  shortWordmarkText,
  roleTitleText,
  backToHomeLabel,
}: SiteWordmarkProps) {
  return (
    <div className="wordmark">
      <span className="wordmark-full">{wordmarkText}</span>
      <span className="wordmark-short">{shortWordmarkText}</span>
      <span className="wordmark-cursor" aria-hidden>
        |
      </span>
      <HomeRoleTitleLabel roleTitleText={roleTitleText} />
      <BackToHomeArrowLink backToHomeLabel={backToHomeLabel} />
    </div>
  );
}
