import Image from "next/image";
import { getTranslations } from "next-intl/server";

/** The file's own pixels, so the srcset is built from the full frame. */
const ABOUT_PORTRAIT_WIDTH = 2048;
const ABOUT_PORTRAIT_HEIGHT = 1152;

/**
 * 528px is `.prose-column`'s 66ch measure at the body's 16px monospace — stated
 * in px because `sizes` is read before any font loads, so `ch` there would be
 * measured against a fallback face.
 */
const ABOUT_PORTRAIT_SIZES = "(width < 40rem) 100vw, 528px";

/** Sits above `AboutProseColumn`, on the same measure. */
export async function AboutPortraitImage() {
  const translateAbout = await getTranslations("aboutPage");

  return (
    <div className="about-portrait">
      <Image
        className="about-portrait-image"
        src="/about/about-me-monsul.jpeg"
        alt={translateAbout("portraitAltText")}
        width={ABOUT_PORTRAIT_WIDTH}
        height={ABOUT_PORTRAIT_HEIGHT}
        sizes={ABOUT_PORTRAIT_SIZES}
        priority
      />
    </div>
  );
}
