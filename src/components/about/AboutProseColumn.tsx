import { getTranslations } from "next-intl/server";

/**
 * One <p> per entry in `aboutPage.paragraphs`, so rewriting the bio is a
 * locales-only change.
 */
export async function AboutProseColumn() {
  const translateAbout = await getTranslations("aboutPage");

  // next-intl's `raw` is typed `any`, so the shape is asserted here rather than
  // trusted downstream.
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
