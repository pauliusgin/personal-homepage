import { glyphIconSvgProps } from "./glyphIconGeometry";

/** Leading glyph for the "portfolio" row. */
export function FolderGlyphIcon() {
  return (
    <svg {...glyphIconSvgProps}>
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.2l2 2.5h8.8A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5Z" />
      <path d="M3 11h18" />
    </svg>
  );
}
