import { getTranslations } from "next-intl/server";

/**
 * A tall empty band with its content pinned to the bottom edge — the void motif
 * repeated at the foot of every page.
 *
 * TODO(footer-copy): `footer.placeholder` in locales/*.json is literal filler
 * standing in until the real footer line is decided. Rename the key when the
 * copy arrives — "placeholder" should not outlive the placeholder.
 */
export async function SiteFooterBand() {
  const translateFooter = await getTranslations("footer");

  return (
    <footer className="footer-band">
      <p className="footer-text">{translateFooter("placeholder")}</p>
    </footer>
  );
}
