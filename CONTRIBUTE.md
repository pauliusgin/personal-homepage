# Contributing (manual edits)

A cookbook for changing this site by hand. Every recipe below lists the exact
files to touch, in order. If a recipe says three files, touching three files is
enough — nothing else in the app needs to know.

Written for the current state of the site: homepage row list, `/about`,
placeholder `/portfolio` and `/news`, two locales (`en`, `lt`), light/dark theme,
⌘K search.

---

## 0. Running it

```bash
npm install
npm run dev      # http://localhost:3000 → redirects to /en
npm run build    # what Vercel/production runs; catches type errors
npm run lint
```

After editing any `.ts`/`.tsx`/`.css`/`.json`, format it:

```bash
npx prettier --write <file>
```

Locales live at `/en` and `/lt`. `/` redirects to the default locale (`en`).

---

## 1. Repo map

```
locales/
  en.json                     all English copy
  lt.json                     all Lithuanian copy — same key shape as en.json
src/
  config/
    siteSections.ts           THE list of rows. Order here = order on screen.
    sitePageContent.ts        which copy the search palette indexes per section
    resolveSiteSectionRows.ts joins siteSections + locales → rows
    resolveSearchPaletteItems.ts  same join, one layer deeper, for ⌘K
  app/
    [locale]/page.tsx         homepage
    [locale]/about/page.tsx   /about
    [locale]/portfolio/page.tsx, [locale]/news/page.tsx   placeholder routes
    [locale]/layout.tsx       <html>, font, theme + intl providers, metadata
    globals.css               the import list = the CSS cascade order
    styles/                   all CSS (see §7)
    fonts/                    Terminus woff2 subsets
  components/                 one component per file, named after what it exports
  components/icons/           one glyph per file, all 20px / 24-unit grid
  i18n/                       routing, navigation helpers, message loading
  proxy.ts                    locale middleware (Next 16 name for middleware.ts)
```

Two rules that explain most of the structure:

- **Configuration lives in `src/config`, copy lives in `locales/*.json`.** A row's
  URL and icon are config; its label and descriptor are copy.
- **The homepage list and the search palette are built from the same join**, so a
  row can never appear in one and be missing from the other. You never edit the
  palette directly.

---

## 2. Add a new section row

### 2a. Row that points at an external site (or mailto)

Three files.

**1. `src/config/siteSections.ts`** — add an entry to the `siteSections` array.
Position in the array is position on the page.

```ts
{
  translationKey: "bluesky",          // must be unique; used as message key + React key
  href: "https://bsky.app/profile/…",
  linkKind: "external",               // "external" | "mailto" | "internal"
  LeadingIcon: ButterflyGlyphIcon,    // see §5 to make a new glyph
},
```

Don't forget the `import` at the top of the file.

`linkKind` decides behaviour, not just styling:

| kind       | anchor                          | new tab                     | trailing ↗ | locale prefix |
| ---------- | ------------------------------- | --------------------------- | ----------- | ------------- |
| `internal` | `Link` from `@/i18n/navigation` | no                          | no          | yes           |
| `external` | plain `<a>`                     | yes (`_blank` + `noopener`) | yes         | no            |
| `mailto`   | plain `<a>`                     | no                          | yes         | no            |

If you don't have the real URL yet, use `PLACEHOLDER_HREF` (`"#"`) exported from
the same file and leave a `TODO(real-url)` comment. Rows on it render but
deliberately go nowhere, and ⌘K refuses to navigate to them.

**2. `locales/en.json`** — under `sections`, add:

```json
"bluesky": { "title": "Bluesky", "description": "Short posts" }
```

`description` is optional. Omitting it is the whole opt-out — the row then
renders as label only, and the orange `|` separator drops with it (LinkedIn and
GitHub work this way today). Do not add `"description": ""`; omit the key.

**3. `locales/lt.json`** — same key, translated. If you skip this the page throws
on `/lt` for the missing `title`, so always do both files.

That's it. The row appears on the homepage and in ⌘K.

### 2b. Row that points at a new page on this site

Five files. Do 2a first with `linkKind: "internal"` and `href: "/uses"`, then:

**4. Create `src/app/[locale]/uses/page.tsx`.** Copy
`src/app/[locale]/portfolio/page.tsx` and change three things — the two
`PageProps<"/[locale]/portfolio">` type arguments, the
`sectionTranslationKey: "portfolio"`, and the body component:

```tsx
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ComingSoonNotice } from "@/components/ComingSoonNotice";
import { SitePageShell } from "@/components/SitePageShell";
import { buildLocalizedPageTitle } from "@/i18n/buildLocalizedPageTitle";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/uses">): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: await buildLocalizedPageTitle({
      locale,
      sectionTranslationKey: "uses",
    }),
  };
}

export default async function UsesPage({
  params,
}: PageProps<"/[locale]/uses">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <SitePageShell>
      <ComingSoonNotice />
    </SitePageShell>
  );
}
```

Always wrap the body in `SitePageShell` — it supplies the header void, wordmark,
controls and footer, and feeds ⌘K on every page. `setRequestLocale` must run
before anything else that reads translations, or the page opts out of static
rendering.

The `PageProps<"…">` type is generated by Next from the route folder name. If TS
complains it doesn't exist, run `npm run dev` once to regenerate types.

**5. `src/config/sitePageContent.ts`** — register which message keys hold that
page's body copy, so ⌘K matches on what the page _says_, not only its label:

```ts
uses: ["usesPage.paragraphs"],
```

Values may be a string message or an array of strings; both are flattened. A
section with no entry here is searched on label + descriptor alone, which is
correct for external links. A key an active locale hasn't translated yet is
skipped rather than throwing.

---

## 3. Reorder, rename or remove a row

- **Reorder** — move the object inside the `siteSections` array. Nothing else.
- **Rename the visible text** — `locales/*.json` only, under `sections.<key>`.
  The `translationKey` is an internal id; it never appears on screen and does not
  need to change.
- **Change where a row points** — the `href` line in `siteSections.ts`. If the
  link now leaves the site, change `linkKind` too.
- **Remove a row** — delete the object from `siteSections.ts`. Then delete its
  `sections.<key>` block from both locale files, its entry in
  `sitePageContent.ts` if it had one, and its route folder under
  `src/app/[locale]/` if it had one.
- **Hide a row temporarily** — comment out the object in `siteSections.ts`. It
  disappears from both the list and ⌘K in one edit.

---

## 4. Edit page copy

Almost all copy is in `locales/en.json` + `locales/lt.json`. **Keep both files
the same shape** — same keys, same nesting, arrays the same length is not
required but is a good idea.

| What you want to change               | Key                                                                                                            |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| /about bio                            | `aboutPage.paragraphs` — array, one entry per `<p>`                                                            |
| Wordmark (top left)                   | `wordmark`, and `wordmarkShort` (shown under 640px)                                                            |
| Placeholder body on /portfolio, /news | `comingSoon`                                                                                                   |
| Footer line                           | `footer.placeholder` (empty today — see the TODO in `SiteFooterBand.tsx`; rename the key when real copy lands) |
| Browser tab title / meta description  | `metadata.title`, `metadata.description`                                                                       |
| Header control + a11y labels          | `nav.*`                                                                                                        |
| Theme toggle words                    | `theme.light`, `theme.dark`                                                                                    |
| ⌘K placeholder + empty state          | `nav.searchPlaceholder`, `search.empty`                                                                        |

**/about specifically:** add, remove or rewrite entries in
`aboutPage.paragraphs` in both locale files. Each entry becomes one paragraph;
no component change is needed, and ⌘K picks the new text up automatically
because `sitePageContent.ts` already points at that key.

Per-page tab titles are built as `<section label> — <site name>` by
`src/i18n/buildLocalizedPageTitle.ts`, so a page title follows its row's label —
there is one place to change it.

---

## 5. Add an icon glyph

One file in `src/components/icons/`, named after the shape it draws
(`FolderGlyphIcon.tsx`, not `Icon2.tsx`).

```tsx
import { glyphIconSvgProps } from "./glyphIconGeometry";

/** Leading glyph for the "uses" row. */
export function ToolboxGlyphIcon() {
  return (
    <svg {...glyphIconSvgProps}>
      <path d="…" />
    </svg>
  );
}
```

Rules:

- Author the path on a **24-unit grid** (`viewBox="0 0 24 24"`) — it renders into
  a 20px box.
- **Always spread `glyphIconSvgProps`.** Never set `strokeWidth` yourself: 1.2 ×
  20/24 = exactly 1px, which is the stem width of Terminus at 16px. That product
  is what makes the glyph read as another character in the line instead of
  artwork sitting next to it.
- Strokes only, `fill="none"`, `stroke="currentColor"` — colour comes from the
  row, including the hover tint.

---

## 6. Add a locale

1. `src/i18n/routing.ts` — add the code to `locales`.
2. `locales/<code>.json` — copy `en.json` and translate every key.
3. `locales/*.json` — update `nav.toggleLanguage` in all files.
4. `src/components/LocaleSwitcher.tsx` — it toggles between two locales today; a
   third means turning that toggle into a picker.

Messages are loaded by filename in `src/i18n/request.ts`; nothing else to wire.

---

## 7. Change styles

All CSS is plain CSS with custom properties, under `src/app/styles/`. Tailwind v4
is installed and used for a handful of layout utilities in `layout.tsx`, but the
design lives in these files.

**`src/app/globals.css` is the cascade.** Tailwind v4 inlines each `@import` at
the point it is named, so the order in that file _is_ the order in the
stylesheet. `tailwindcss` first, `variables.css` before anything that overrides a
token. Don't put a rule above the imports — per the CSS spec that silently drops
every import below it.

### Which file

| File                                | Owns                                                      |
| ----------------------------------- | --------------------------------------------------------- |
| `styles/variables.css`              | every colour + size + timing token, light and dark        |
| `styles/theme.css`                  | Tailwind's `dark:` variant wiring and `--color-*` aliases |
| `styles/typography.css`             | `body` type foundation, `/about` prose column             |
| `styles/page-layout.css`            | page shell, coming-soon band, footer band                 |
| `styles/section-rows.css`           | the homepage rows: grid, hover, focus, arrow              |
| `styles/header/header-band.css`     | header void geometry + the <640px breakpoint              |
| `styles/header/wordmark.css`        | wordmark and its cursor                                   |
| `styles/header/header-controls.css` | search trigger, theme toggle, locale switch               |
| `styles/header/search-palette.css`  | ⌘K dialog                                                 |
| `styles/motion.css`                 | reduced-motion (collapses both duration tokens)           |

### The knobs worth knowing

All in `styles/variables.css` — `:root` is light, `.dark` is dark. Change a
colour in **both** blocks unless you mean it to differ.

| Token                           | Today                           | What it does                                                                    |
| ------------------------------- | ------------------------------- | ------------------------------------------------------------------------------- |
| `--background` / `--foreground` | cream `#fff5e6` / `#282827`     | page ground and ink                                                             |
| `--surface`                     | white / `#32322f`               | raised panels (⌘K dialog)                                                       |
| `--border`                      | derived from `--foreground`     | hairlines                                                                       |
| `--accent-primary`              | blue / orange                   | row `\|` separator, hover tint, ↗                                              |
| `--accent-bright`               | brighter twin                   | fills — light mode darkens `primary` for text contrast, so the two differ there |
| `--accent-fill`                 | `accent-bright` at 16% / 7%     | tinted backgrounds                                                              |
| `--accent-secondary`            | brown / light blue              | focus rings, meta                                                               |
| `--ink-secondary-opacity`       | `0.55` → `0.8` on hover         | how much dimmer descriptors are than labels                                     |
| `--page-gutter`                 | `20px`                          | every horizontal edge inset                                                     |
| `--row-height`                  | `60px`                          | section row height                                                              |
| `--header-height`               | `200px`                         | the header void                                                                 |
| `--header-control-height`       | `32px`                          | search field box; both header children are floored to it so baselines line up   |
| `--duration-tint`               | `220ms`                         | anything that recolours or fades                                                |
| `--duration-travel`             | `320ms`                         | anything that moves                                                             |
| `--ease-out-expo`               | `cubic-bezier(0.16, 1, 0.3, 1)` | the site's only easing                                                          |

Common tweaks:

- **Row taller/shorter** → `--row-height`.
- **More/less empty space at the top** → `--header-height`. It is a flat 200px at
  every width today; the old <640px override was removed, so the stale comment in
  `variables.css` mentioning a 100px small-screen value no longer matches the
  code. To bring it back, re-add `:root { --header-height: 100px; }` inside the
  media query in `header/header-band.css` (imported after `variables.css`, which
  is what lets it win).
- **Different accent colour** → `--accent-primary` in both blocks. Check contrast:
  the current values are 5.4:1 (light) and 7.6:1 (dark). If the light value is
  bright, darken it for text and keep the bright one as `--accent-bright`.
- **Wider/narrower /about text** → `max-width` on `.prose-column` in
  `typography.css`. It is in `ch` because the face is monospace, so `66ch` is
  exactly 66 characters at any zoom. Stay inside 45–75.
- **Row hover distance** → `translateX` on `.section-row:hover .section-row-text`
  in `section-rows.css`.

### Four invariants — breaking these breaks the design

1. **16px type, everywhere.** Terminus is a bitmap face traced to outlines,
   designed for exact pixel sizes; 16px is one of them. Scaling off it resamples
   the pixel grid and the whole point of the font is lost. When space runs out,
   elements are _dropped_, never shrunk — that is what the <640px rules do.
2. **320px is the floor.** The header measures 308px at its tightest (see the
   arithmetic in `header/header-band.css`), leaving 12px of slack, and that slack
   is what pays for the 20px gutters. Anything you add must hold at 320px on its
   own. Below 320px the page scrolls sideways on purpose.
3. **Every transition uses `--duration-tint` or `--duration-travel`.** A literal
   `250ms` anywhere escapes the reduced-motion block in `motion.css` and nothing
   will flag it. A third duration means a new kind of motion, not a tweak.
4. **Two font weights only** — 400 and 700, no italic. Only those two are
   subsetted and shipped.

If you add a glyph the subsetted font doesn't cover, you'll see a fallback
character. Regenerate the woff2 with `pyftsubset` from upstream Terminus 4.49.3;
see `src/app/fonts/LICENSE-Terminus-OFL.txt`.

---

## 8. Before committing

```bash
npx prettier --write <files you touched>
npm run lint
npm run build
```

Then eyeball:

- `/en` and `/lt` — both locales render, no missing-message errors.
- Light and dark — toggle in the header.
- 320px wide — the header stays one line; descriptors and the `|` drop out.
- ⌘K — your new row appears and navigates.

`AGENTS.md` at the repo root is regenerated by `next dev`; if it shows up as an
uncommitted change, commit it along with your work rather than reverting it.

---

## 9. House style (if you write code, not just copy)

From `~/.claude/CLAUDE.md`, and what the existing code follows:

- Curly braces on every `if`/`for`, even one-liners.
- Expressive names, 2–4 words with a domain word — `resolveSiteSectionRows`, not
  `resolve`. Files are named after the thing they export, one concept per file.
- Object shapes are `interface`, not `type`.
- Three or more parameters, two of the same type, a boolean, or anything
  optional → take a single named params object.
- Prefer early returns over `else if` chains; initialize a variable then assign
  rather than reaching for a ternary.
- Comments explain _why_ a number or a decision is what it is. The existing
  comments are load-bearing documentation — read them before changing the thing
  they sit above.
