# Lutfi Ihsan — Professional Portfolio

Website portofolio profesional dengan blog terintegrasi, CMS admin, statistik pengunjung, dan backend serverless di Cloudflare.

**Live:** [lutfiihsan.github.io](https://lutfiihsan.github.io)  
**Admin:** [lutfiihsan.github.io/admin](https://lutfiihsan.github.io/admin)  
**API:** `https://myporto-api.lawlieth404.workers.dev`

---

## Fitur

| Modul | Deskripsi |
|-------|-----------|
| **Portfolio** | Landing page glassmorphism, CV PDF (jsPDF), data dari D1 atau fallback `data.json` |
| **Blog** | Artikel publik dengan Quill rich text, cover image via R2 |
| **Admin Panel** | React app — posts, users, stats, portfolio CMS, ganti password |
| **Statistics** | Highcharts + Leaflet, retensi data 90 hari |
| **Auth** | JWT (HS256), role Admin & Editor, session `localStorage` |
| **Media** | Upload ke Cloudflare R2 (`covers/`, `content/`) |

---

## Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript (ES Modules), React (admin only) |
| Build | Vite 8 + `@vitejs/plugin-react` |
| API | Cloudflare Workers + Hono 4 |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 |
| Hosting | GitHub Pages (frontend) + Cloudflare Workers (API) |

---

## Quick Start

```bash
git clone https://github.com/lutfiihsan/lutfiihsan.github.io.git
cd lutfiihsan.github.io
npm install

cp .dev.vars.example .dev.vars   # isi JWT_SECRET
npm run db:migrate               # skema D1 lokal

# Terminal 1
npm run dev:api

# Terminal 2
npm run dev
```

- Frontend: `http://localhost:5173` (proxy `/api` → Worker)
- API: `http://localhost:8787`

Buat admin pertama (hanya sekali, saat belum ada user):

```bash
curl -X POST http://localhost:8787/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

---

## Scripts

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Vite dev server (frontend) |
| `npm run dev:api` | Wrangler dev (Worker API) |
| `npm run build` | Build production → `dist/` |
| `npm run deploy:api` | Deploy Worker ke Cloudflare |
| `npm run db:migrate` | Migrasi D1 lokal |
| `npm run db:migrate:remote` | Migrasi D1 production |
| `npm run db:migrate:portfolio` | Migrasi tabel portfolio (remote) |
| `node scripts/test-auth.mjs <email> <password>` | Tes login + endpoint auth |

---

## Struktur Proyek

```text
myporto/
├── index.html, blog.html, admin.html   # Entry pages
├── partials/                           # HTML components (vite-plugin-html-inject)
├── assets/
│   ├── css/                            # Styles (style.css, admin.css, admin-premium.css)
│   ├── js/                             # api.js, script.js, blog.js, stats.js
│   └── data/data.json                  # Fallback portfolio data
├── admin-src/                          # React admin panel
│   ├── components/                     # Dashboard, PostsTab, UsersTab, ...
│   ├── context/AuthContext.jsx
│   └── lib/                            # toast, format, apiError
├── worker/
│   ├── src/                            # Hono API routes
│   │   ├── index.ts
│   │   ├── jwt.ts                      # Sign/verify JWT (HS256)
│   │   ├── middleware.ts
│   │   └── routes/                     # auth, posts, users, stats, ...
│   └── schema.sql                      # Skema D1
├── wrangler.toml                       # Konfigurasi Cloudflare Worker
├── .github/workflows/                  # CI/CD GitHub Pages + Worker
└── docs/                               # Dokumentasi lengkap
```

---

## Deployment

Arsitektur **split hosting**:

```text
lutfiihsan.github.io          →  GitHub Pages (static)
myporto-api.*.workers.dev     →  Cloudflare Worker (API + D1 + R2)
```

Push ke `master`/`main` memicu:

- **GitHub Pages** — build Vite + deploy frontend (`deploy-pages.yml`)
- **Cloudflare Worker** — deploy API jika `worker/` berubah (`deploy-api.yml`)

GitHub Secrets yang diperlukan:

| Secret | Keterangan |
|--------|------------|
| `VITE_API_URL` | URL Worker API |
| `CLOUDFLARE_API_TOKEN` | Token deploy Worker |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID Cloudflare |

Cloudflare secret (via `wrangler secret put`):

| Secret | Keterangan |
|--------|------------|
| `JWT_SECRET` | String acak panjang untuk JWT |

Detail lengkap: [docs/deployment.md](docs/deployment.md)

---

## Dokumentasi

| Dokumen | Isi |
|---------|-----|
| [docs/README.md](docs/README.md) | Indeks dokumentasi |
| [docs/architecture.md](docs/architecture.md) | Arsitektur sistem & alur data |
| [docs/setup.md](docs/setup.md) | Setup lokal & Cloudflare dari nol |
| [docs/deployment.md](docs/deployment.md) | CI/CD, GitHub Pages, Worker |
| [docs/api-reference.md](docs/api-reference.md) | Referensi REST API |
| [docs/admin-panel.md](docs/admin-panel.md) | Panduan admin panel |
| [docs/database.md](docs/database.md) | Skema D1 & migrasi |
| [docs/troubleshooting.md](docs/troubleshooting.md) | FAQ & debugging |

---

## Lisensi

Proyek terbuka untuk tujuan pembelajaran.  
Copyright © 2026 **Lutfi Ihsan**.
