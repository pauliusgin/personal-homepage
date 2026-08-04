/**
 * The body copy each section's page renders, addressed by message key.
 *
 * The search palette reads these so a query matches what a page *says*, not
 * only what it is called: "juggling" finds /about because the bio mentions it,
 * even though neither the label nor the descriptor contains the word.
 *
 * Keyed by `translationKey` from `siteSections`. A section with no entry here —
 * every external link and the mailto row today — is matched on its label and
 * descriptor alone, which is all the content it has.
 *
 * A value is either a message holding a string or one holding an array of
 * strings; both shapes are flattened to passages by
 * src/config/resolveSearchPaletteItems.ts. When /portfolio and /news grow real
 * bodies, swap `comingSoon` for whatever keys those bodies render and the
 * palette picks the new copy up with no other change.
 */
export const sitePageContentMessageKeys: Record<string, readonly string[]> = {
  about: ["aboutPage.paragraphs"],
  portfolio: ["comingSoon"],
  news: ["comingSoon"],
};
