"use client";

import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { MagnifierGlyphIcon } from "@/components/icons/MagnifierGlyphIcon";
import { PLACEHOLDER_HREF, type SectionLinkKind } from "@/config/siteSections";
import { useRouter } from "@/i18n/navigation";

/**
 * One searchable destination. The palette is deliberately fed these from the
 * outside so a future content-wide index (posts, projects, notes) can replace
 * the section rows without this component changing at all.
 */
export interface SearchPaletteItem {
  id: string;
  label: string;
  /** Absent for rows that are only a label — see `sections` in `locales/*.json`. */
  descriptor?: string;
  href: string;
  linkKind: SectionLinkKind;
  /**
   * The body copy of the page this row points at, one entry per paragraph, so a
   * query matches what the page says and not just its name. Assembled by
   * src/config/resolveSearchPaletteItems.ts; empty for rows with no page of
   * their own, such as the external links.
   */
  contentPassages?: string[];
}

/**
 * A row that survived filtering, carrying the excerpt that explains why. Never
 * built by callers — `contentExcerpt` is the palette's own answer to "where in
 * this page did my query hit?".
 */
interface MatchedSearchPaletteItem extends SearchPaletteItem {
  /** Set only when the query missed the label and descriptor and hit the body. */
  contentExcerpt?: string;
}

interface SearchPaletteProps {
  items: SearchPaletteItem[];
}

const FOCUSABLE_SELECTOR =
  'input, button, [href], [tabindex]:not([tabindex="-1"])';

/** Characters of surrounding sentence kept on each side of a body-copy hit. */
const CONTENT_EXCERPT_RADIUS = 40;

interface BuildContentExcerptParams {
  passage: string;
  /** Already lowercased and trimmed by the caller. */
  query: string;
}

/**
 * A window of `passage` centred on the query, elided on whichever side was cut.
 * Shown in place of the row's descriptor so a content hit says what it hit.
 */
function buildContentExcerpt({
  passage,
  query,
}: BuildContentExcerptParams): string {
  const matchIndex = passage.toLocaleLowerCase().indexOf(query);
  const excerptStart = Math.max(0, matchIndex - CONTENT_EXCERPT_RADIUS);
  const excerptEnd = Math.min(
    passage.length,
    matchIndex + query.length + CONTENT_EXCERPT_RADIUS,
  );

  let leadingEllipsis = "";
  if (excerptStart > 0) {
    leadingEllipsis = "…";
  }
  let trailingEllipsis = "";
  if (excerptEnd < passage.length) {
    trailingEllipsis = "…";
  }

  return `${leadingEllipsis}${passage.slice(excerptStart, excerptEnd)}${trailingEllipsis}`;
}

interface MatchPaletteItemToQueryParams {
  item: SearchPaletteItem;
  /** Already lowercased and trimmed by the caller. */
  query: string;
}

/**
 * The whole matching rule: label and descriptor first, page body second.
 * Returns `null` for a miss, so filtering and excerpt building are one pass.
 *
 * Order matters — a row whose name already matches keeps showing its descriptor
 * rather than a body excerpt that would repeat the same word back.
 */
function matchPaletteItemToQuery({
  item,
  query,
}: MatchPaletteItemToQueryParams): MatchedSearchPaletteItem | null {
  const nameHaystack =
    `${item.label} ${item.descriptor ?? ""}`.toLocaleLowerCase();
  if (nameHaystack.includes(query)) {
    return item;
  }

  const matchingPassage = item.contentPassages?.find((passage) =>
    passage.toLocaleLowerCase().includes(query),
  );
  if (!matchingPassage) {
    return null;
  }

  return {
    ...item,
    contentExcerpt: buildContentExcerpt({ passage: matchingPassage, query }),
  };
}

function buildOptionElementId(itemId: string): string {
  return `search-palette-option-${itemId}`;
}

/**
 * A UI-only command palette: trigger plus modal listbox. There is no backend and
 * no ranking — filtering is a substring match over the localized label,
 * descriptor and page body of whatever `items` it was handed.
 */
export function SearchPalette({ items }: SearchPaletteProps) {
  const translateNav = useTranslations("nav");
  const translateSearch = useTranslations("search");
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null,
  );

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo<MatchedSearchPaletteItem[]>(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    if (normalizedQuery.length === 0) {
      return items;
    }
    return items.flatMap((item) => {
      const match = matchPaletteItemToQuery({ item, query: normalizedQuery });
      if (!match) {
        return [];
      }
      return [match];
    });
  }, [items, searchQuery]);

  // Derived rather than stored, so a query that filters the highlighted item
  // away falls back to the first result without a state reset effect.
  const highlightedItem =
    filteredItems.find((item) => item.id === highlightedItemId) ??
    filteredItems[0];

  const openPalette = useCallback(() => {
    setSearchQuery("");
    setHighlightedItemId(null);
    setIsOpen(true);
  }, []);

  const closePalette = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  // ⌘K / Ctrl+K opens and closes; Escape closes. Both are bound to the window
  // rather than to the panel: Escape on the panel's own `onKeyDown` only fires
  // while focus sits inside the panel, which leaves the palette unclosable by
  // keyboard the moment focus is anywhere else.
  useEffect(() => {
    function handlePaletteHotkey(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        closePalette();
        return;
      }
      if (!event.metaKey && !event.ctrlKey) {
        return;
      }
      if (event.key.toLowerCase() !== "k") {
        return;
      }
      event.preventDefault();
      if (isOpen) {
        closePalette();
        return;
      }
      openPalette();
    }

    window.addEventListener("keydown", handlePaletteHotkey);
    return () => window.removeEventListener("keydown", handlePaletteHotkey);
  }, [closePalette, isOpen, openPalette]);

  // Focus moves into the input on open; `closePalette` returns it to the
  // trigger, so both directions are covered without a second effect.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    searchInputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !highlightedItem) {
      return;
    }
    const optionElement = document.getElementById(
      buildOptionElementId(highlightedItem.id),
    );
    optionElement?.scrollIntoView({ block: "nearest" });
  }, [highlightedItem, isOpen]);

  function navigateToPaletteItem(item: SearchPaletteItem) {
    closePalette();

    // Placeholder destinations are wired but not addressable yet — see
    // src/config/siteSections.ts. Opening them would just yield a blank tab.
    if (item.href === PLACEHOLDER_HREF) {
      return;
    }
    if (item.linkKind === "external") {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }
    if (item.linkKind === "mailto") {
      window.location.assign(item.href);
      return;
    }
    router.push(item.href);
  }

  function moveHighlightBy(offset: number) {
    if (filteredItems.length === 0) {
      return;
    }
    const currentIndex = filteredItems.findIndex(
      (item) => item.id === highlightedItem?.id,
    );
    const nextIndex =
      (currentIndex + offset + filteredItems.length) % filteredItems.length;
    setHighlightedItemId(filteredItems[nextIndex].id);
  }

  function trapFocusWithinPanel(event: ReactKeyboardEvent<HTMLDivElement>) {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }
    const focusableElements =
      panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusableElements.length === 0) {
      return;
    }
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const boundaryElement = event.shiftKey ? firstElement : lastElement;
    if (document.activeElement !== boundaryElement) {
      return;
    }
    event.preventDefault();
    const wrapTarget = event.shiftKey ? lastElement : firstElement;
    wrapTarget.focus();
  }

  // Escape is deliberately absent here — it lives on the window listener above
  // so it works regardless of where focus is. The keys below genuinely need
  // focus context, so they stay scoped to the panel.
  function handlePanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Tab") {
      trapFocusWithinPanel(event);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveHighlightBy(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveHighlightBy(-1);
      return;
    }
    if (event.key === "Enter" && highlightedItem) {
      event.preventDefault();
      navigateToPaletteItem(highlightedItem);
    }
  }

  let activeDescendantId: string | undefined = undefined;
  if (highlightedItem) {
    activeDescendantId = buildOptionElementId(highlightedItem.id);
  }

  return (
    <>
      {/* Dressed as a text field, but it is a button: clicking it opens the
          modal below rather than accepting input in place, and the real input
          lives inside that modal. A disabled `<input>` would look the part and
          then lie to a screen reader about what activating it does.

          Both faces of the trigger are always in the markup and CSS picks one:
          the label + ⌘K hint above 640px, the glyph below it. `aria-label` is
          therefore not optional — whichever face is hidden is `display: none`
          and out of the accessibility tree, so the button would otherwise lose
          its name on small screens. */}
      <button
        ref={triggerRef}
        type="button"
        className="search-trigger"
        aria-label={translateNav("search")}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={openPalette}
      >
        <span className="search-trigger-icon">
          <MagnifierGlyphIcon />
        </span>
        <span className="search-trigger-label">{translateNav("search")}</span>
        <span className="search-trigger-hint">
          {translateNav("searchHint")}
        </span>
      </button>

      {isOpen ? (
        <div
          className="search-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePalette();
            }
          }}
        >
          <div
            ref={panelRef}
            className="search-panel"
            role="dialog"
            aria-modal="true"
            aria-label={translateSearch("dialogLabel")}
            onKeyDown={handlePanelKeyDown}
          >
            <input
              ref={searchInputRef}
              className="search-input"
              type="text"
              role="combobox"
              autoComplete="off"
              spellCheck={false}
              aria-label={translateSearch("dialogLabel")}
              aria-expanded
              aria-controls="search-palette-results"
              aria-activedescendant={activeDescendantId}
              placeholder={translateNav("searchPlaceholder")}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />

            {filteredItems.length === 0 ? (
              <p className="search-empty">{translateSearch("empty")}</p>
            ) : (
              <ul
                id="search-palette-results"
                className="search-results"
                role="listbox"
                aria-label={translateSearch("dialogLabel")}
              >
                {filteredItems.map((item) => {
                  // A body-copy hit shows where it landed instead of the row's
                  // stock descriptor; both occupy the same slot, so the row
                  // stays one line either way (design spec §5.1).
                  let secondaryText = item.descriptor;
                  let secondaryClassName = "search-result-descriptor";
                  if (item.contentExcerpt) {
                    secondaryText = item.contentExcerpt;
                    secondaryClassName = "search-result-excerpt";
                  }

                  return (
                    <li
                      key={item.id}
                      id={buildOptionElementId(item.id)}
                      className="search-result"
                      role="option"
                      aria-selected={item.id === highlightedItem?.id}
                      onMouseEnter={() => setHighlightedItemId(item.id)}
                      onClick={() => navigateToPaletteItem(item)}
                    >
                      <span className="search-result-label">{item.label}</span>
                      {secondaryText ? (
                        <>
                          <span className="search-result-separator" aria-hidden>
                            |
                          </span>
                          <span className={secondaryClassName}>
                            {secondaryText}
                          </span>
                        </>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
