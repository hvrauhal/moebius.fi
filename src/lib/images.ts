import type { ImageMetadata } from 'astro';

// Lets content refer to images in src/assets/ by file name, e.g.
// <Gallery images={["kids.jpg", "rookies.jpg"]} />, while still going
// through Astro's image optimisation.
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/*.{png,jpg,jpeg,webp,svg}',
  { eager: true },
);

const byName = new Map(
  Object.entries(modules).map(([path, mod]) => [path.split('/').pop()!, mod.default]),
);

export function resolveImage(image: string | ImageMetadata): ImageMetadata {
  if (typeof image !== 'string') return image;
  const found = byName.get(image);
  if (!found) throw new Error(`Unknown image "${image}" – add it to src/assets/`);
  return found;
}
