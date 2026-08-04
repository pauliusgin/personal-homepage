import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing, type SupportedLocale } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;

  let locale: SupportedLocale = routing.defaultLocale;
  if (hasLocale(routing.locales, requestedLocale)) {
    locale = requestedLocale;
  }

  return {
    locale,
    messages: (await import(`../../locales/${locale}.json`)).default,
  };
});
