/**
 * Shared geometry for every line glyph on the page.
 *
 * Each icon is authored on a 24-unit grid and rendered into a fixed 20px layout
 * box, so every authored unit lands at 20/24 of a pixel. Every icon in this
 * folder must spread these props onto its `<svg>` so that contract holds in one
 * place.
 *
 * `strokeWidth` is the load-bearing number: 1.2 × 20/24 = exactly 1px, which is
 * the stem width of Terminus regular at the page's 16px (it is a traced bitmap
 * face — an 8×16 cell with 1px stems, measured, not estimated). The glyphs are
 * meant to read as another character in the same run of text, and a heavier
 * stroke makes them read as artwork sitting next to it instead. Any change to
 * the 20px box or the 24-unit grid has to keep that product at 1.
 */
export const glyphIconSvgProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;
