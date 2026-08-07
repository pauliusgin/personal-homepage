import { glyphIconSvgProps } from "./glyphIconGeometry";

export function BackArrowGlyphIcon() {
  return (
    <svg {...glyphIconSvgProps}>
      <path d="M20 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </svg>
  );
}
