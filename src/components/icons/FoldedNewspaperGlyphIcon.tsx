import { glyphIconSvgProps } from "./glyphIconGeometry";

/**
 * Opposite corners of the page must keep summing to the same point
 * ((4,8.6)+(20.6,9) = (12,3.4)+(12.6,14.2)) or it stops reading as one flat
 * plane. Three column rules, not four — a fourth closes into a hatch at 20px.
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
