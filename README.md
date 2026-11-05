# moebius.fi

Static website of Freestyleseura Moebius ry, built with [Astro](https://astro.build).
Content is Markdown (MDX), one file per page, in `src/content/pages/`.

## Build and run

Everything runs inside Docker, with Node pinned by image digest and npm
dependencies pinned by `package-lock.json`. Only Docker is needed on the host.

```sh
make build   # builds the site into ./dist
make dev     # dev server with live reload at http://localhost:4321
```

`make build` runs `docker build --target dist --output type=local,dest=dist .`.

## Deployment

The site is hosted on [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/)
as static assets, and Cloudflare's Workers Builds is connected to this GitHub
repository. Every push to `main` is built by Cloudflare and published to
production; every other branch gets a preview at
`<branch>-moebius-fi.hvrauhal.workers.dev`, and pull requests get the preview
URL as a comment. Nothing needs to be built or uploaded by hand.

Cloudflare builds outside Docker, with the Node version from `.node-version`
(keep it equal to the version in the `Dockerfile`) and the dependencies from
`package-lock.json`. `wrangler.jsonc` names the Worker, points it at `dist/`
and makes it serve `404.html` for unknown URLs; the name in it must match the
Worker's name in the Cloudflare dashboard. The build settings in the dashboard
(Worker > Settings > Build) are:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Preview command | `npx wrangler preview` |
| Build variables | `ASTRO_TELEMETRY_DISABLED=1`, `WRANGLER_SEND_METRICS=false` |

`public/_redirects` maps the old Liquidblox URLs to the new ones in the
Cloudflare format and is copied into `dist/` by the build.

## Editing content

Each page is `src/content/pages/<slug>.mdx` and is served at `/<slug>/`
(`index.mdx` is the front page, `404.mdx` the not-found page). The frontmatter
holds the page title, language and an optional hero band:

```yaml
---
title: "Moebius Freestyle | Harraste"
lang: fi
hero:
  image: ../../assets/harraste.jpg
  heading: "Harraste"
  cta:                       # optional button
    label: "Liity jäseneksi"
    href: "/jasenyys/"
---
```

Below the frontmatter is ordinary Markdown. A few components are available
without imports:

| Component | Use |
| --- | --- |
| `<Band image="photo.jpg" heading="Haluatko mukaan?" />` | Full-width duotoned photo band with a poster heading; optional `cta={{ label, href }}` |
| `<Gallery images={["a.jpg", "b.jpg"]} />` | Grid of photos as taped-on postcards; click opens the original |
| `<Logos images={["sponsor.png"]} />` | Row of sponsor logos; add `large` for the big front-page row |
| `<Columns><div>…</div><div>…</div></Columns>` | Two side-by-side columns (stacked on phones); leave blank lines around the Markdown inside each `<div>` |
| `<Center>…</Center>` | Centres the wrapped Markdown, e.g. a heading |
| `<Wide>…</Wide>` | Full content width for the wrapped Markdown; images inside are shown whole and fitted to the width (use for result tables) |
| `<Button href="/jasenyys/">Liity jäseneksi</Button>` | Mustard poster button |
| `<Social />` | Facebook / Instagram / YouTube icons |

Images referenced by file name live in `src/assets/`. Drop new photos there and
refer to them by name; Astro resizes and converts them at build time. Inline
images in Markdown use a relative path: `![](../../assets/photo.jpg)`.

Shared parts live in `src/layouts/Base.astro` (header, navigation, footer) and
`src/styles/global.css`.

## Updating dependencies

Versions are pinned exactly in `package.json`. To upgrade, change the version,
regenerate the lockfile inside the pinned image, and commit both files:

```sh
docker run --rm -v "$PWD":/app -w /app node:22.23.4-bookworm-slim npm install --package-lock-only
```

To move to a newer Node, pull the new tag, and copy its `RepoDigest` into the
`FROM` line of the `Dockerfile`.
