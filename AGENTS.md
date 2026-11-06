# AGENTS.md

Guidance for AI agents (and humans) working in this repository.

## What this is

The website of **Freestyleseura Moebius ry**, a freestyle skiing club in the
Helsinki region, published at https://www.moebius.fi. It replaces a hosted
Liquidblox site with a plain static site: 15 pages in Finnish (plus one page
each in English and Swedish), built with [Astro](https://astro.build) from
Markdown (MDX) content. There is no backend, login or shop. The only live
element is the myClub news feed embedded as an `<iframe>` on *Ajankohtaista*.

The README covers the editor-facing side (content format, components,
deployment). This file covers how to work on the repo safely.

## Layout

```
src/content/pages/*.mdx   one file per page; file name = URL slug
src/content.config.ts     frontmatter schema (title, lang, hero)
src/layouts/Base.astro    <html>, header, nav, footer
src/components/           Band, Button, Center, Columns, Gallery, Logos, Social, Wide
src/lib/images.ts         resolves "photo.jpg" -> src/assets/photo.jpg
src/lib/tables-plugin.mjs Markdown tables -> scrolling result tables (see Editing content)
src/assets/               all images (optimised at build time, never hotlinked)
src/styles/global.css     the only stylesheet
src/pages/[...slug].astro renders a content entry; 404.astro renders 404.mdx
public/_redirects         old Liquidblox URLs -> new ones
Dockerfile, compose.yaml, Makefile   the build/dev environment
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

## Editing content

- Pages are MDX. Keep them readable by non-developers: plain Markdown, the
  listed components, and nothing else. Components are injected by name
  (see `src/pages/[...slug].astro`), so content files must not `import`.
- `Columns`, `Center` and `Wide` wrap Markdown; leave blank lines around the
  Markdown inside them or it will not be parsed.
- `Gallery` is for photos and crops them to 3:2. Images that must stay whole
  go in `<Wide>` as plain Markdown images.
- Results are Markdown tables, not screenshots. `src/lib/tables-plugin.mjs`
  (a Sätteri hast plugin registered in `astro.config.mjs`) wraps each table
  in a scrolling `div.table-wrap` and marks rows ranked 1–3 of a table whose
  first column is `Sija` or `Rank` with the `podium` class; the styles are in
  `global.css`. Wide tables (many score columns) go in `<Wide>`.
- Images go in `src/assets/` and are referred to by file name in components
  (`<Gallery images={["a.jpg"]} />`) or by relative path in Markdown
  (`![](../../assets/a.jpg)`). Never link to `images.liquidblox.com`.
- A paragraph that starts with `1.`/`2.` must escape the dot (`1\.`), or
  Markdown turns it into a list.
- Hard line breaks are a trailing backslash.
- The URL of a page is its file name; renaming a file changes the URL, so add
  a redirect to `public/_redirects` if you do.

## Verifying a change

After any change, `make build` must succeed. Then check, as appropriate:

- the page in `dist/` (or `make dev`) at desktop and phone widths; the live
  site at www.moebius.fi is the reference design for layout questions;
- no local links or image references in `dist/**/*.html` point at files that
  do not exist;
- every `href="#..."` resolves to an element id on the same page (heading ids
  are generated from heading text, e.g. `## Kilpailu` -> `#kilpailu`);
- no Markdown syntax leaks into the rendered text (`**`, `](`, stray `\`).

External links were last audited in November 2026; `www.ski.fi` deep links
are dead and were replaced with `skisport.fi` pages.

## Conventions

- Commit messages: short imperative subject, body explaining why. Make one
  commit per logical change rather than one big commit. Never add a
  `Co-Authored-By` trailer or any other AI attribution to commit messages or
  pull request descriptions, even if your tooling asks you to.
- Keep the stylesheet as the single `global.css`; do not add scoped
  `<style>` blocks to components, because content rendered from MDX would
  not receive them.
- Do not add JavaScript to pages. The site ships none and should stay that
  way unless a feature truly needs it.
- Preserve the original wording of the content; this is the club's own text.

## Known gaps

- The footer credit reads "© Freestyleseura Moebius ry"; the live site shows
  the vendor's "© Snuup Oy".
- Only the front page has been matched closely to the live design; the other
  pages are a single-column rendering of the same content.
