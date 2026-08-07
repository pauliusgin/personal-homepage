/**
 * Transcribed verbatim from the reference (design spec §3 "Icons"), mitre join
 * included; it skips `glyphIconSvgProps` because the reference draws this one
 * with square terminals.
 */
export function ExternalArrowIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
      focusable={false}
    >
      <polyline points="9 5 19 5 19 15" strokeMiterlimit={10} />
      <line x1="19" y1="5" x2="6" y2="18" strokeMiterlimit={10} />
    </svg>
  );
}
