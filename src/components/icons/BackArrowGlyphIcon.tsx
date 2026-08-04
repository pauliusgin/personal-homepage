import { glyphIconSvgProps } from "./glyphIconGeometry";

/**
 * The ← that returns to the homepage from every other page — see
 * BackToHomeArrowLink. Drawn on the shared 24-unit grid so it renders at the
 * same 20px box and 1px stem as the magnifier it sits across the header from.
 */
export function BackArrowGlyphIcon() {
  return (
    <svg {...glyphIconSvgProps}>
      <path d="M20 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </svg>
  );
}
