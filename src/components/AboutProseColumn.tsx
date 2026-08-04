import { getTranslations } from "next-intl/server";

/**
 * The /about body: the bio, one <p> per entry in `aboutPage.paragraphs`.
 *
 * The whole page is that array, so rewriting the bio is a locales-only change.
 * This is the one place on the site that sets prose leading — everything else
 * is single-line rows at the body's 1em (design spec §0).
 */
export async function AboutProseColumn() {
  const translateAbout = await getTranslations("aboutPage");

  // `raw` is the documented next-intl escape hatch for array values; it is
  // typed `any`, so the shape is asserted here rather than trusted downstream.
  const paragraphs = translateAbout.raw("paragraphs") as string[];

  return (
    <div className="prose-column">
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="prose-paragraph">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
