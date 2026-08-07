import { glyphIconSvgProps } from "./glyphIconGeometry";

/**
 * Detail below ~4 grid units disappears at the 20px box, so ears, muzzle wedge
 * and neck tufts are sized to survive it. The tufts stay shallow because deeper
 * scallops bend the neck into an S at glyph size.
 */
export function LlamaGlyphIcon() {
  return (
    <svg {...glyphIconSvgProps}>
      <path d="M9.2 2.6C9.9 3.2 10.6 4.6 10.9 6C11.5 5.8 12.1 5.8 12.7 6C13 4.6 13.6 3.2 14.3 2.6C14.9 3.6 15 5.2 14.7 6.4C15.9 7.6 16.2 9.2 15.6 10.4C16.9 11.3 17.2 12.8 16.5 13.9C17.8 14.9 18.2 16.5 17.7 17.8C18.3 18.8 18.6 20 18.7 21L10 21C9.6 17.4 9.4 14.2 9.4 12.7C7.8 12.5 5.4 12.1 4.2 11.5C3 10.9 2.9 9.5 4 8.7C5.2 7.8 7.6 6.9 8.9 6.3C8.5 5 8.6 3.4 9.2 2.6Z" />
      <circle cx="7.1" cy="9.5" r="0.75" />
    </svg>
  );
}
