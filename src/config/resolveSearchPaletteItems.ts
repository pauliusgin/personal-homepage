import { getTranslations } from "next-intl/server";
import type { SearchPaletteItem } from "@/components/header/SearchPalette";
import { resolveSiteSectionRows } from "@/config/resolveSiteSectionRows";
import { sitePageContentMessageKeys } from "@/config/sitePageContent";

type RootTranslator = Awaited<ReturnType<typeof getTranslations>>;

/** next-intl's `raw` is typed `any`, so its return is narrowed rather than trusted. */
function flattenMessageValueToPassages(messageValue: unknown): string[] {
  if (typeof messageValue === "string") {
    return [messageValue];
  }
  if (Array.isArray(messageValue)) {
    return messageValue.filter(
      (entry): entry is string => typeof entry === "string",
    );
  }
  return [];
}

interface ResolvePageContentPassagesParams {
  translateRoot: RootTranslator;
  sectionTranslationKey: string;
}

function resolvePageContentPassages({
  translateRoot,
  sectionTranslationKey,
}: ResolvePageContentPassagesParams): string[] {
  const messageKeys = sitePageContentMessageKeys[sectionTranslationKey];
  if (!messageKeys) {
    return [];
  }

  return messageKeys.flatMap((messageKey) => {
    // An untranslated key drops out instead of throwing — a missing paragraph
    // should cost search recall, not the header.
    if (!translateRoot.has(messageKey)) {
      return [];
    }
    return flattenMessageValueToPassages(translateRoot.raw(messageKey));
  });
}

export async function resolveSearchPaletteItems(): Promise<
  SearchPaletteItem[]
> {
  const [sectionRows, translateRoot] = await Promise.all([
    resolveSiteSectionRows(),
    getTranslations(),
  ]);

  return sectionRows.map(({ section, label, descriptor }) => ({
    id: section.translationKey,
    label,
    descriptor,
    href: section.href,
    linkKind: section.linkKind,
    contentPassages: resolvePageContentPassages({
      translateRoot,
      sectionTranslationKey: section.translationKey,
    }),
  }));
}
