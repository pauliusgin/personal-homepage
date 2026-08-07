import { glyphIconSvgProps } from "./glyphIconGeometry";

export function MagnifierGlyphIcon() {
  return (
    <svg {...glyphIconSvgProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="M16 16l5 5" />
    </svg>
  );
}
