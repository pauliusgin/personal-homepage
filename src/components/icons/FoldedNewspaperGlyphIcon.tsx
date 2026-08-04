import { glyphIconSvgProps } from "./glyphIconGeometry";

/**
 * Leading glyph for the "news" row: a folded newspaper seen in perspective —
 * the page as a parallelogram, its far edge curling under, its near edge rolled
 * into a tube.
 *
 * The parallelogram is the load-bearing part: opposite corners sum to the same
 * point ((4,8.6)+(20.6,9) = (12,3.4)+(12.6,14.2)), which is what keeps it
 * reading as one flat plane rather than a dented quad. The three column rules
 * run along the plane's long axis on a 4.2,-2.6 delta, near enough parallel to
 * the top edge's 8,-5.2 to read as ruled columns; a fourth would close the gaps
 * up into a hatch at the 20px box.
 */
export function FoldedNewspaperGlyphIcon() {
  return (
    <svg {...glyphIconSvgProps}>
      <path d="M4 8.6 12 3.4 20.6 9 12.6 14.2Z" />
      <path d="M4 8.6c-1.8 1.4-1.8 3.4 0 4.6l7.4 4.8" />
      <path d="M12.6 14.2 20.6 9c1.5-.9 3 .2 2.6 1.9-.2.8-.8 1.3-1.4 1.7l-7.5 4.9c-1.6 1-3.1-.3-2.6-2 .2-.7.6-1.1 1-1.4Z" />
      <path d="M8.2 8.6 12.4 6" />
      <path d="M10.6 10.2 14.8 7.6" />
      <path d="M13 11.8 17.2 9.2" />
    </svg>
  );
}
