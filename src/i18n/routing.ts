import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "lt"],
  defaultLocale: "en",
});

export type SupportedLocale = (typeof routing.locales)[number];
