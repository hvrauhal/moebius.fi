// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import tables from './src/lib/tables-plugin.mjs';

export default defineConfig({
  site: 'https://www.moebius.fi',
  integrations: [mdx(), sitemap()],
  markdown: { processor: satteri({ hastPlugins: [tables] }) },
});
