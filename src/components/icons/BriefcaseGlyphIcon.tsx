import { glyphIconSvgProps } from "./glyphIconGeometry";

export function BriefcaseGlyphIcon() {
  return (
    <svg {...glyphIconSvgProps}>
      <rect x="3" y="7" width="18" height="13" />
      <path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" />
      <path d="M3 12h18" />
    </svg>
  );
}
