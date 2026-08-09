import { getTranslations } from "next-intl/server";

/** Body for a route that exists and is linkable but has no content yet. */
export async function ComingSoonNotice() {
  const translateRoot = await getTranslations();

  return (
    <div className="coming-soon-band">
      <p className="coming-soon-text">{translateRoot("comingSoon")}</p>
    </div>
  );
}
