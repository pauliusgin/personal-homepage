import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { routing } from "@/i18n/routing";
import "../globals.css";

// Terminus is a bitmap face traced to outlines, designed for exact pixel sizes
// — the page's 16px is one of them. Do not scale the type off that size:
// anything in between resamples the pixel grid and the face falls apart.
//
// The .woff2 files are subsets of the upstream 4.49.3 TTFs (latin, latin-ext,
// punctuation, arrows). Regenerate with `pyftsubset` if a glyph turns up
// missing; see LICENSE-Terminus-OFL.txt in the same folder.
const terminus = localFont({
  src: [
    {
      path: "../fonts/TerminusTTF-Regular-subset.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/TerminusTTF-Bold-subset.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-terminus",
  display: "swap",
});

// Colours the browser/OS chrome before the page paints, so a standalone launch
// never shows white behind a dark page. Values mirror `--background` in
// src/app/styles/variables.css — keep them in sync.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#282827" },
  ],
};

type LocaleRouteParams = Pick<LayoutProps<"/[locale]">, "params">;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleRouteParams): Promise<Metadata> {
  const { locale } = await params;
  const translate = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: translate("title"),
    description: translate("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Required for static rendering, and must run before any other next-intl
  // call in the tree.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${terminus.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <NextIntlClientProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
