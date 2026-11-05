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
Deploy the contents of `dist/` to any static host (Cloudflare Pages, Netlify,
GitHub Pages, …). `public/_redirects` maps the old Liquidblox URLs to the new
ones in the Cloudflare Pages / Netlify format.

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
| `<Band image="photo.jpg" heading="Haluatko mukaan?" />` | Full-width photo band with a heading; optional `cta={{ label, href }}` |
| `<Gallery images={["a.jpg", "b.jpg"]} />` | Grid of photos |
| `<Logos images={["sponsor.png"]} />` | Row of sponsor logos |
| `<Button href="/jasenyys/">Liity jäseneksi</Button>` | Gold button |
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
