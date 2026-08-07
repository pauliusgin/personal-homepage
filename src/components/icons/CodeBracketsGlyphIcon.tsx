import { glyphIconSvgProps } from "./glyphIconGeometry";

export function CodeBracketsGlyphIcon() {
  return (
    <svg {...glyphIconSvgProps}>
      <polyline points="8 6 3 12 8 18" />
      <polyline points="16 6 21 12 16 18" />
    </svg>
  );
}
