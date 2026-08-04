import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/ThemeProvider";
import { routing } from "@/i18n/routing";
import "../globals.css";

// The design is 100% monospace (design spec §0.1, §1) — Terminus (TTF) is the
// page font, self-hosted by `next/font` so there is no webfont flash on a page
// where every pixel of content is text. Terminus is a bitmap font traced to
// outlines: it ships only two weights (400 / 700, no italic in use here) and it
// is designed for exact pixel sizes, of which the page's 16px is one. Do not
// scale the type off that size — anything in between resamples the pixel grid
// and the whole point of the face is lost.
//
// The .woff2 files are subsets of the upstream 4.49.3 TTFs (latin, latin-ext,
// punctuation, arrows) — 500KB each down to ~8KB. See LICENSE-Terminus-OFL.txt
// in the same folder; regenerate with `pyftsubset` if a glyph turns up missing.
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

  // Required for static rendering: opts this segment out of dynamic rendering
  // and must run before any other next-intl call in the tree.
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
