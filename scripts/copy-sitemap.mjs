/**
 * Copy Astro sitemap-0.xml to sitemap.xml for Google Search Console.
 * Avoids redirect HTML at /sitemap.xml/ which breaks crawlers.
 */
import { copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'dist', 'sitemap-0.xml');
const dest = join(root, 'dist', 'sitemap.xml');

if (!existsSync(src)) {
  console.warn('copy-sitemap: dist/sitemap-0.xml not found — run astro build first');
  process.exit(0);
}

copyFileSync(src, dest);
console.log('copy-sitemap: dist/sitemap.xml ready');
