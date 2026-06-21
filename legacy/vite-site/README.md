# Legacy Vite multi-page site

File HTML dan partial portfolio dari setup **Vite + vite-plugin-html-inject** sebelum migrasi Astro.

Tidak dipakai untuk build production. Referensi saja — halaman aktif ada di `src/pages/` (Astro).

| File lama | Pengganti Astro |
|-----------|-----------------|
| `index.html` | `src/pages/index.astro` |
| `blog.html` | `src/pages/blog/index.astro` |
| `blog-post.html` | `src/pages/blog/post/index.astro` |
| `project.html` | `src/pages/project/index.astro` |
| `404.html` | `src/pages/404.astro` |
| `partials/portfolio-*.html` | `src/components/layout/Portfolio*.astro` |
| `vite.config.js` | `astro.config.mjs` + `vite.admin.config.js` |
