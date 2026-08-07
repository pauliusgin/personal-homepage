import { getTranslations } from "next-intl/server";

/**
 * TODO(footer-copy): `footer.placeholder` in locales/*.json is literal filler
 * standing in until the real footer line is decided. Rename the key when the
 * copy arrives.
 */
export async function SiteFooterBand() {
  const translateFooter = await getTranslations("footer");

  return (
    <footer className="footer-band">
      <p className="footer-text">{translateFooter("placeholder")}</p>
    </footer>
  );
}
