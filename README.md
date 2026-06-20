# 🚀 Lutfi Ihsan — Professional Portfolio

Selamat datang di repositori portofolio profesional saya. Website ini dirancang sebagai platform pameran karya, blog teknis, dan dasbor administrasi pribadi. Dibangun dengan fokus pada performa tinggi, desain premium (Glassmorphism), dan arsitektur kode yang bersih.

---

## ✨ Fitur Utama

- **Modern Architecture**: Berbasis **Vite.js** untuk bundling aset yang super cepat.
- **Modular Design**: Menggunakan sistem **HTML Components (Partials)** untuk pemeliharaan kode yang mudah.
- **Clean URLs**: Navigasi tanpa ekstensi `.html`.
- **Embedded Blog System**: CMS kustom dengan **Cloudflare D1** + **Quill.js**.
- **Media Storage**: Upload cover blog ke **Cloudflare R2**.
- **Advanced Statistics**: Pelacakan pengunjung anonim divisualisasikan dengan **Highcharts**.
- **PDF Resume Generator**: CV profesional dinamis via **jsPDF**.
- **RBAC Admin Panel**: Kontrol akses Admin & Editor.

---

## 🛠️ Stack Teknologi

| Layer | Teknologi |
|-------|-----------|
| Frontend | HTML5, Vanilla CSS, JavaScript (ES Modules) |
| Build | Vite.js |
| API | Cloudflare Workers + Hono |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 |
| Hosting | Cloudflare Workers (static + API) |

---

## 🚀 Pengembangan Lokal

### 1. Prasyarat

- [Node.js](https://nodejs.org/) 18+
- [Cloudflare account](https://dash.cloudflare.com/) (gratis)
- Wrangler CLI (terpasang via `npm install`)

### 2. Instalasi

```bash
git clone https://github.com/lutfiihsan/lutfiihsan.github.io.git
cd lutfiihsan.github.io
npm install
```

### 3. Setup Cloudflare

```bash
# Buat database D1
npm run db:create
# Salin database_id ke wrangler.toml

# Buat bucket R2 (via dashboard Cloudflare atau CLI)
# Nama bucket: myporto-media

# Migrasi skema database (lokal)
npm run db:migrate

# Salin secrets lokal
cp .dev.vars.example .dev.vars
# Edit JWT_SECRET di .dev.vars

# Set secret production
wrangler secret put JWT_SECRET
```

### 4. Buat Admin Pertama

Setelah API berjalan, panggil endpoint setup (hanya sekali, saat belum ada user):

```bash
curl -X POST http://localhost:8787/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### 5. Jalankan Dev

Terminal 1 — API Worker:
```bash
npm run build
npm run dev:api
```

Terminal 2 — Frontend Vite:
```bash
npm run dev
```

- Frontend: `http://localhost:5173` (proxy `/api` → Worker)
- API langsung: `http://localhost:8787`

---

## 📂 Struktur Folder

```text
├── assets/js/          # Frontend modules (api.js, admin.js, blog.js, ...)
├── worker/src/         # Cloudflare Worker API (Hono routes)
├── worker/schema.sql   # Skema D1
├── partials/           # Komponen HTML modular
├── public/             # Aset statis (termasuk data.json)
├── wrangler.toml       # Konfigurasi Cloudflare
└── vite.config.js      # Build & dev proxy
```

---

## 🚢 Deployment (GitHub Pages + Cloudflare API)

Arsitektur **split hosting** — domain `lutfiihsan.github.io` tetap di GitHub Pages, API di Cloudflare Worker:

```text
lutfiihsan.github.io     →  GitHub Pages (static frontend)
myporto-api.*.workers.dev  →  Cloudflare Worker (API + D1 + R2)
```

### Setup sekali

1. Deploy API dulu:
   ```bash
   npm run deploy:api
   ```
   Catat URL worker, misalnya `https://myporto-api.account.workers.dev`

2. Set `API_BASE_URL` di `wrangler.toml` (vars) ke URL worker tersebut, lalu deploy ulang API.

3. Tambahkan GitHub Secrets:
   - `VITE_API_URL` = URL worker (sama dengan API_BASE_URL)
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

4. Push ke `main`/`master` → otomatis deploy:
   - **GitHub Pages** — frontend (workflow `deploy-pages.yml`)
   - **Cloudflare Worker** — API (workflow `deploy-api.yml`, hanya saat `worker/` berubah)

### Deploy manual

```bash
# Frontend (set env dulu)
$env:VITE_API_URL="https://myporto-api.account.workers.dev"
npm run build
# lalu push dist via GitHub Pages

# API
npm run deploy:api
```

---

## 📄 Lisensi

Proyek ini bersifat terbuka untuk tujuan pembelajaran.  
Copyright © 2026 **Lutfi Ihsan**.
