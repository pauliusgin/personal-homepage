import { glyphIconSvgProps } from "./glyphIconGeometry";

/** Leading glyph for the "email" row. */
export function EnvelopeGlyphIcon() {
  return (
    <svg {...glyphIconSvgProps}>
      <rect x="3" y="5" width="18" height="14" />
      <polyline points="3 6 12 13 21 6" />
    </svg>
  );
}
