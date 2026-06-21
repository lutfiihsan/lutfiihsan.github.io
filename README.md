# Lutfi Ihsan — Professional Portfolio

Website portofolio profesional dengan blog terintegrasi, CMS admin, statistik pengunjung, dan backend serverless di Cloudflare.

**Live:** [lutfiihsan.github.io](https://lutfiihsan.github.io)  
**Admin:** [lutfiihsan.github.io/admin](https://lutfiihsan.github.io/admin)  
**API:** `https://myporto-api.lawlieth404.workers.dev`

### Akun Admin (production)

| | |
|---|---|
| **URL** | [lutfiihsan.github.io/admin](https://lutfiihsan.github.io/admin) |
| **Email** | `lawlieth404@gmail.com` |
| **Password** | `PortoAdmin2026!` |
| **Role** | Admin |

> Ganti password setelah login pertama lewat menu **Ganti Password** di dashboard.

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
| Frontend | Astro 6 (site) + React (admin) |
| Build | Astro (site) + Vite (admin panel) |
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

# Terminal 2 — site (Astro)
npm run dev

# Terminal 3 — admin (opsional, port 5173)
npm run dev:admin
```

- Site: `http://localhost:4321` (proxy `/api` → Worker, `/admin` → admin dev)
- Admin langsung: `http://localhost:5173/admin/`
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
| `npm run dev` | Astro dev server (site publik) |
| `npm run dev:admin` | Vite dev server (admin panel) |
| `npm run dev:api` | Wrangler dev (Worker API) |
| `npm run build` | Build Astro → `dist/` + admin → `dist/admin/` |
| `npm run deploy:api` | Deploy Worker ke Cloudflare |
| `npm run db:migrate` | Migrasi D1 lokal |
| `npm run db:migrate:remote` | Migrasi D1 production |
| `npm run db:migrate:portfolio` | Migrasi tabel portfolio (remote) |
| `node scripts/test-auth.mjs <email> <password>` | Tes login + endpoint auth |

---

## Struktur Proyek

```text
myporto/
├── src/                          # Site publik (Astro)
│   ├── pages/                    # Route: /, /blog/, /project/, /404
│   ├── layouts/BaseLayout.astro
│   ├── components/layout/        # Head, Nav, Footer, Scripts
│   └── content/home.html         # Konten landing (HTML mentah)
├── admin/                        # Admin panel (React + Vite)
│   ├── index.html                # Entry build admin
│   ├── partials/                 # HTML inject (head, dll.)
│   └── src/                      # React components & context
├── public/assets/                # Static files (satu sumber kebenaran)
│   ├── css/                      # style, blog, admin, 404
│   ├── js/                       # api, script, blog, stats, tracker
│   ├── images/
│   └── data/data.json            # Fallback portfolio
├── worker/                       # Cloudflare Worker API (Hono)
├── database/                     # Skema SQL referensi
├── scripts/                      # sync-portfolio, setup-cloudflare, ...
├── legacy/vite-site/             # HTML lama (pre-Astro, arsip)
├── docs/                         # Dokumentasi lengkap
├── astro.config.mjs
├── vite.admin.config.js
└── wrangler.toml
```

---

## Deployment

Arsitektur **split hosting**:

```text
lutfiihsan.github.io          →  GitHub Pages (static)
myporto-api.*.workers.dev     →  Cloudflare Worker (API + D1 + R2)
```

Push ke `master`/`main` memicu:

- **GitHub Pages** — build Astro + admin Vite (`deploy-pages.yml`)
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
