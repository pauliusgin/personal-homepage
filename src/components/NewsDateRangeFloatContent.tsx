"use client";

import { useTranslations } from "next-intl";

/**
 * `<input type="date">` accepts only a bare date, but the filter state can hold
 * a full RFC3339 instant from a shared link — anything else leaves the field
 * empty rather than being silently rejected by the picker.
 */
const BARE_DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function toNewsDateInputValue(dateBound: string | undefined): string {
  if (dateBound && BARE_DATE_INPUT_PATTERN.test(dateBound)) {
    return dateBound;
  }
  return "";
}

interface NewsDateRangeFloatContentProps {
  since: string | undefined;
  until: string | undefined;
  onSinceChange: (nextSince: string | undefined) => void;
  onUntilChange: (nextUntil: string | undefined) => void;
}

/** Each bound bounds the other through `min`/`max`: that pair is a `400`. */
export function NewsDateRangeFloatContent({
  since,
  until,
  onSinceChange,
  onUntilChange,
}: NewsDateRangeFloatContentProps) {
  const translateNews = useTranslations("newsPage");

  const sinceInputValue = toNewsDateInputValue(since);
  const untilInputValue = toNewsDateInputValue(until);

  let sinceMaxAttribute: string | undefined = undefined;
  if (untilInputValue) {
    sinceMaxAttribute = untilInputValue;
  }
  let untilMinAttribute: string | undefined = undefined;
  if (sinceInputValue) {
    untilMinAttribute = sinceInputValue;
  }

  return (
    <div className="news-date-panel">
      <label className="news-filter-label" htmlFor="news-since-input">
        {translateNews("sinceLabel")}
      </label>
      <input
        id="news-since-input"
        type="date"
        className="news-filter-date-input"
        value={sinceInputValue}
        max={sinceMaxAttribute}
        onChange={(event) => onSinceChange(event.target.value || undefined)}
      />

      <label className="news-filter-label" htmlFor="news-until-input">
        {translateNews("untilLabel")}
      </label>
      <input
        id="news-until-input"
        type="date"
        className="news-filter-date-input"
        value={untilInputValue}
        min={untilMinAttribute}
        onChange={(event) => onUntilChange(event.target.value || undefined)}
      />
    </div>
  );
}
