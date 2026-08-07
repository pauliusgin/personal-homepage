/**
 * A 12px box rather than the 20px `glyphIconSvgProps` one, because it sits in
 * the filter bar's 12px run: 2 × 12/24 = exactly 1px, the stem width of the
 * face beside it. Any change to the box has to keep that product at 1.
 */
export function DisclosureChevronIcon() {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
    >
      <polyline points="6 9 12 16 18 9" />
    </svg>
  );
}
