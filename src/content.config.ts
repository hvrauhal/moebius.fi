import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One MDX file per page in src/content/pages/. The file name is the URL:
// jasenyys.mdx -> /jasenyys/, index.mdx -> /, 404.mdx -> the not-found page.
const pages = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      lang: z.enum(['fi', 'en', 'sv']).default('fi'),
      description: z.string().optional(),
      // Optional picture shown when the page is shared (og:image); defaults to
      // the hero image, else a club photo.
      image: image().optional(),
      // Optional full-width photo band with a heading at the top of the page.
      hero: z
        .object({
          image: image(),
          heading: z.string(),
          cta: z.object({ label: z.string(), href: z.string() }).optional(),
          // Where the middle of the heading sits, as a percentage of the band's
          // height from the top, to fit it into empty space in the photo.
          // Without it the heading is centred.
          headingAt: z.number().min(0).max(100).optional(),
          // On phones the band is taller than the photo, so its sides are
          // cropped. This is the point to keep in view, as a percentage of the
          // photo's width from the left; without it the middle is kept.
          focusX: z.number().min(0).max(100).optional(),
        })
        .optional(),
    }),
});

export const collections = { pages };
