import { getTranslations } from "next-intl/server";
import type { SearchPaletteItem } from "@/components/SearchPalette";
import { resolveSiteSectionRows } from "@/config/resolveSiteSectionRows";
import { sitePageContentMessageKeys } from "@/config/sitePageContent";

type RootTranslator = Awaited<ReturnType<typeof getTranslations>>;

/**
 * `raw` is the documented next-intl escape hatch for non-string messages and is
 * typed `any`, so every shape it can return is narrowed here rather than
 * trusted. A page body is one string or an array of them; anything else is a
 * catalogue mistake and contributes no searchable text.
 */
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
    // A key the active locale has not translated yet drops out instead of
    // throwing — a missing paragraph should cost search recall, not the header.
    if (!translateRoot.has(messageKey)) {
      return [];
    }
    return flattenMessageValueToPassages(translateRoot.raw(messageKey));
  });
}

/**
 * Builds the palette's index: every section row, plus the localized body copy of
 * the page behind it.
 *
 * Lives beside `resolveSiteSectionRows` because it is the same join one layer
 * further — configuration to content — and keeps the page shell free of it.
 */
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
