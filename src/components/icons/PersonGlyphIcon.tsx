import { glyphIconSvgProps } from "./glyphIconGeometry";

export function PersonGlyphIcon() {
  return (
    <svg {...glyphIconSvgProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1" />
    </svg>
  );
}
