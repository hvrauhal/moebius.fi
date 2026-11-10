# AGENTS.md

Guidance for AI agents (and humans) working in this repository.

## What this is

The website of **Freestyleseura Moebius ry**, a freestyle skiing club in the
Helsinki region, published at https://www.moebius.fi. It replaces a hosted
Liquidblox site with a plain static site: 15 pages in Finnish (plus one page
each in English and Swedish), built with [Astro](https://astro.build) from
Markdown (MDX) content. There is no backend or login; the club shop is an
external tobo.fi page linked from the front page. The only live element is
the myClub news feed embedded as an `<iframe>` on *Ajankohtaista*.

The README covers the editor-facing side (content format, components,
deployment). This file covers how to work on the repo safely.

## Layout

```
src/content/pages/*.mdx   one file per page; file name = URL slug
src/content.config.ts     frontmatter schema (title, lang, hero)
src/layouts/Base.astro    <html>, header, nav (menu items), footer
src/components/NavList.astro  the menu, any depth: desktop dropdowns, phone drawer
src/components/           Band, Button, Center, Columns, Gallery, Logos, Social, Wide
src/lib/images.ts         resolves "photo.jpg" -> src/assets/photo.jpg
src/lib/tables-plugin.mjs Markdown tables -> scrolling result tables (see Editing content)
src/assets/               all images (optimised at build time, never hotlinked)
src/styles/global.css     the only stylesheet
src/pages/[...slug].astro renders a content entry; 404.astro renders 404.mdx
public/_redirects         old Liquidblox URLs -> new ones
Dockerfile, compose.yaml, Makefile   the build/dev environment
untracked/                source material dropped in by the maintainer (result
                          workbooks, original photos); ignored via .git/info/exclude
```

## Building and running

**Everything runs in Docker.** Do not run `npm install`, `npm run build` or
`astro` directly on the host; the host does not have the required Node
version, and the point of the setup is that the toolchain is pinned.

```sh
make build   # docker build --target dist --output type=local,dest=dist .
make dev     # docker compose up dev -> http://localhost:4321 (live reload)
```

`dist/`, `node_modules/` and `.astro/` are git-ignored build products.

Production builds do not use Docker: Cloudflare Workers Builds builds `main`
and every other branch itself from the GitHub repository (settings in the
README) with `npm run build`, using the Node version in `.node-version`. That
file must state the same version as the `Dockerfile`, or Cloudflare and
`make build` produce different results. `wrangler.jsonc` is the Cloudflare
configuration; `wrangler` is a dev dependency only so that Cloudflare runs a
pinned version of it.

Pinning: Node is pinned by image digest in the `Dockerfile`; npm packages are
pinned to exact versions in `package.json` and installed with `npm ci` from
`package-lock.json`. To change a dependency, edit `package.json`, regenerate
the lockfile inside the pinned image (command in the README) and commit both.
Astro telemetry is disabled in the image.

Markdown is processed by Sätteri, Astro's default processor in this version.
`markdown.remarkPlugins`/`rehypePlugins` and the `mdx()` plugin options do
not run; extend the pipeline with `satteri({ hastPlugins: [...] })` set as
`markdown.processor` in `astro.config.mjs` (MDX inherits it). A hast plugin
sees elements and children but not table cell alignment, which Sätteri adds
at render time as an inline `text-align` style.

## Editing content

- Pages are MDX. Keep them readable by non-developers: plain Markdown, the
  listed components, and nothing else. Components are injected by name
  (see `src/pages/[...slug].astro`), so content files must not `import`.
- `Columns`, `Center` and `Wide` wrap Markdown; leave blank lines around the
  Markdown inside them or it will not be parsed.
- `class="wide-only"` on an element (usually a `Columns` `<div>`) hides it
  at phone width, where the columns stack; the front page uses it for the
  decorative club logo.
- `Gallery` is for photos and crops them to 3:2, up to four per row; a
  gallery with fewer photos gets that many columns so the row stays full
  width. Images that must stay whole go in `<Wide>` as plain Markdown images.
- `Logos` links a logo to the partner's site when the file name is listed in
  `PARTNERS` in `Logos.astro`; add new sponsors there.
- Results are Markdown tables, not screenshots. `src/lib/tables-plugin.mjs`
  (a Sätteri hast plugin registered in `astro.config.mjs`) wraps each table
  in a scrolling `div.table-wrap` and marks rows ranked 1–3 of a table whose
  first column is `Sija` or `Rank` with the `podium` class; the styles are in
  `global.css`. Tables with more than about eight columns go in `<Wide>`.
- Large source photos should be downsized before they go into `src/assets/`
  (about 1200 px on the long side is plenty for a column); Astro keeps the
  original pixel size, and a 12-megapixel image is slow to decode.
- Images go in `src/assets/` and are referred to by file name in components
  (`<Gallery images={["a.jpg"]} />`) or by relative path in Markdown
  (`![](../../assets/a.jpg)`). Never link to `images.liquidblox.com`.
- A paragraph that starts with `1.`/`2.` must escape the dot (`1\.`), or
  Markdown turns it into a list.
- Hard line breaks are a trailing backslash.
- The URL of a page is its file name; renaming a file changes the URL, so add
  a redirect to `public/_redirects` if you do.

### SkiTour result pages

`skitour.mdx` is the coming season; `skitour-YYYY.mdx` holds a past season.
Past seasons appear automatically under SkiTour in the menu (newest first).
The front page (`index.mdx`) repeats the coming season's event list in its
"Moe SkiTour" column; when a new season is announced, update both files.
A season page starts with the season standings (`# YYYY Kokonaistulokset`),
then for each event, newest first, `# Tulokset …` followed by the original
`# Kilpailukutsu …` text and the venue's `<Logos>` row.

- Within an event, classes are `##` headings (`Kids`, `Groms tytöt`,
  `Groms pojat`, `Rookies`, `Open`/`Pros`); girls and boys get separate
  tables when both competed. Kids are not ranked: list them with `Bib`,
  `Etunimi`, `Sukunimi`, `Seura` only. Put the judges in a sentence above
  the tables.
- Column order follows the result sheet: `Rank | Bib | Etunimi | Sukunimi |
  Seura` and then the score columns in sheet order. Decimals use a comma;
  empty cells stay empty.
- The data comes from the maintainer's Excel workbooks, one per event and a
  `Kooste` workbook for the season. The first sheet of an event workbook
  (`Tulokset some`, `tulokset palkintojenjako`, `Tulokset rapsa`, …) is the
  published version; the `kisan aikana` sheets are working copies. In the
  Kooste the `Uniikit nimet` block (columns L onwards) is complete; the
  ranked block to its right may be unfinished. Watch for misspelt names that
  stop a skier's rows from merging (it happened in 2026).
- Season standings list only skiers with two or more starts in the ranked
  boys' and rookie classes; ties on points are broken by number of starts,
  remaining ties share a rank. Say so on the page with the 2024 wording.

## Verifying a change

After any change, `make build` must succeed. Then check, as appropriate:

- the page in `dist/` (or `make dev`) at desktop and phone widths; the live
  site at www.moebius.fi is the reference design for layout questions;
- no local links or image references in `dist/**/*.html` point at files that
  do not exist;
- every `href="#..."` resolves to an element id on the same page (heading ids
  are generated from heading text, e.g. `## Kilpailu` -> `#kilpailu`);
- no Markdown syntax leaks into the rendered text (`**`, `](`, stray `\`).

To look at a page without a browser on the host, serve `dist/` and
screenshot it with headless Chrome in Docker, e.g.

```sh
python3 -m http.server 8765 --bind 0.0.0.0 --directory dist &
docker run --rm --network host -v "$PWD":/out zenika/alpine-chrome \
  --no-sandbox --headless --hide-scrollbars --window-size=1280,2000 \
  --screenshot=/out/page.png http://localhost:8765/skitour-2026/
```

Use 390 px wide for the phone view. `--screenshot` only captures the top of
the page and ignores `#anchors`, so to see a section far down, write a
fragment of the built HTML (same `<head>`, just that part of `<main>`) to a
temporary page and screenshot that.

External links were last audited in November 2026; `www.ski.fi` deep links
are dead and were replaced with `skisport.fi` pages. The sponsor sites in
`Logos.astro` were confirmed from search results only, as the sandbox could
not open them.

## Conventions

- Commit messages: short imperative subject, body explaining why. Make one
  commit per logical change rather than one big commit. Never add a
  `Co-Authored-By` trailer or any other AI attribution to commit messages or
  pull request descriptions, even if your tooling asks you to.
- Keep the stylesheet as the single `global.css`; do not add scoped
  `<style>` blocks to components, because content rendered from MDX would
  not receive them.
- The phone menu (≤ 900 px) is an off-screen drawer built on the HTML
  popover API, so it needs no JavaScript; each submenu level is a nested
  popover sliding over its parent. The drawer is a separate element from
  the desktop bar, so resizing across the breakpoint does not animate it
  (do not merge the two). Browsers without popover support fall
  back to a plain two-column list of the top level.
- Do not add JavaScript to pages. The site ships none and should stay that
  way unless a feature truly needs it.
- Preserve the original wording of the content; this is the club's own text.

## Known gaps

- The footer credit reads "© Freestyleseura Moebius ry"; the live site shows
  the vendor's "© Snuup Oy".
- Only the front page has been matched closely to the live design; the other
  pages are a single-column rendering of the same content.
