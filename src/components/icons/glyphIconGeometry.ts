/**
 * Authored on a 24-unit grid, rendered into a 20px box. `strokeWidth` is
 * load-bearing: 1.2 × 20/24 = exactly 1px, the stem width of Terminus regular
 * at 16px, so a glyph reads as another character in the text. Any change to the
 * box or the grid has to keep that product at 1.
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
