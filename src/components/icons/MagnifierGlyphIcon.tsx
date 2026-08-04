import { glyphIconSvgProps } from "./glyphIconGeometry";

/**
 * The search trigger's glyph. Leads the trigger at every width, and below 640px
 * it is the whole trigger — see `.search-trigger-icon` in
 * `app/styles/header/header-controls.css`.
 */
export function MagnifierGlyphIcon() {
  return (
    <svg {...glyphIconSvgProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="M16 16l5 5" />
    </svg>
  );
}
