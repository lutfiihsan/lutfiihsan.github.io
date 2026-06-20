# Arsitektur Sistem

## Overview

MyPorto menggunakan **split hosting**: frontend statis di GitHub Pages, backend API di Cloudflare Workers. Tidak ada server tradisional — semua backend berjalan serverless di edge Cloudflare.

---

## Diagram Komponen

```text
                         PRODUCTION
┌──────────────────────────────────────────────────────────────────┐
│                        GitHub Pages                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │ index.html │  │ blog.html  │  │ blog-post  │  │ admin.html │  │
│  │ (portfolio)│  │ (listing)  │  │ (detail)   │  │ (React)    │  │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  │
│        │               │               │               │          │
│        └───────────────┴───────────────┴───────────────┘          │
│                              │                                     │
│                    assets/js/api.js (shared client)                │
└──────────────────────────────┼─────────────────────────────────────┘
                               │ HTTPS + CORS
                               │ Authorization: Bearer <JWT>
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Cloudflare Worker (myporto-api)                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Hono Router                                                  │  │
│  │  /api/auth    → login, session, setup, change-password       │  │
│  │  /api/posts   → CRUD blog                                    │  │
│  │  /api/users   → manajemen user (admin)                       │  │
│  │  /api/stats   → dashboard statistik (admin)                  │  │
│  │  /api/track   → page view tracking (publik)                   │  │
│  │  /api/upload  → media ke R2 (auth)                           │  │
│  │  /api/portfolio → CMS data portfolio                         │  │
│  │  /api/media/* → serve file R2                                │  │
│  └─────────────────────────────────────────────────────────────┘  │
│         │                              │                           │
│         ▼                              ▼                           │
│  ┌─────────────┐                ┌─────────────┐                   │
│  │ D1 Database │                │ R2 Bucket   │                   │
│  │ myporto-db  │                │ myporto-media│                  │
│  └─────────────┘                └─────────────┘                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Frontend

### Halaman Publik

| Halaman | Entry | JS utama | Data source |
|---------|-------|----------|-------------|
| Portfolio | `index.html` | `script.js` | `GET /api/portfolio` → fallback `data.json` |
| Blog list | `blog.html` | `blog.js` | `GET /api/posts?published=true` |
| Blog post | `blog-post.html` | `blog.js` | `GET /api/posts/slug/:slug` |
| Project | `project.html` | `script.js` | Portfolio data |
| 404 | `404.html` | — | — |

### Admin Panel (React)

Admin di-rewrite ke React (`admin-src/`) dengan Vite multi-page build:

```text
admin.html
  └── admin-src/main.jsx
        └── App.jsx
              ├── AuthProvider (session restore)
              ├── LoginPage
              └── Dashboard
                    ├── Sidebar / Topbar
                    ├── StatsTab    (admin only)
                    ├── UsersTab    (admin only)
                    ├── PostsTab
                    └── PortfolioTab (admin only)
```

Legacy `assets/js/admin.js` **tidak lagi digunakan** — admin sepenuhnya React.

### HTML Partials

Komponen HTML reusable via `vite-plugin-html-inject`:

```html
<load src="./partials/head.html" />
```

Digunakan untuk head, navbar, footer — landing page tetap vanilla HTML/CSS.

---

## Backend (Cloudflare Worker)

### Framework

- **Hono 4** — routing, middleware, CORS
- **hono/jwt** — sign/verify dengan algoritma **HS256** (wajib eksplisit)
- **Web Crypto API** — hash password PBKDF2

### Middleware Chain

```text
Request
  → CORS (/api/*)
  → requireAuth (Bearer JWT)     [endpoint terproteksi]
  → requireAdmin (role=admin)    [endpoint admin-only]
  → Route handler
```

Modul JWT terpusat di `worker/src/jwt.ts`:

- `createToken()` — sign dengan HS256
- `parseToken()` — verify dengan HS256

### CORS

Origin diizinkan dikonfigurasi via `ALLOWED_ORIGINS` di `wrangler.toml`:

```toml
ALLOWED_ORIGINS = "https://lutfiihsan.github.io,http://localhost:5173,http://127.0.0.1:5173"
```

Header yang diizinkan: `Content-Type`, `Authorization`.

---

## Alur Data

### 1. Portfolio

```text
Browser → GET /api/portfolio
       → D1 (portfolio table, id='main')
       → JSON { skills, projects, experience, ... }
       
Jika 404 → fallback ke assets/data/data.json (client-side)
```

Admin menyimpan via `PUT /api/portfolio` (JSON editor di admin panel).

### 2. Blog

```text
Publik  → GET /api/posts?published=true
Admin   → GET /api/posts (Bearer token, semua post)
Editor  → POST/PUT/DELETE posts (auth required)
Cover   → POST /api/upload (folder=covers) → R2
Inline  → POST /api/upload (folder=content) → R2 (Quill editor)
```

### 3. Analytics

```text
Setiap halaman → POST /api/track { page, session_id, device, ... }
              → Rate limit: 1x per session+page per 30 menit
              → INSERT page_views

Admin buka stats → GET /api/stats
                 → Auto-prune data > 90 hari
                 → Aggregasi + chart data
```

### 4. Autentikasi

```text
Login → POST /api/auth/login
      → Verify password (PBKDF2)
      → JWT { sub, email, role, exp } signed HS256
      → Client simpan di localStorage (key: auth_token)

Request berikutnya → Authorization: Bearer <token>
                   → parseToken() → set user context

Logout → clear localStorage + event auth:logout
Refresh → GET /api/auth/session → restore user
```

Token expiry: **30 hari**.

---

## Build Pipeline

### Vite Multi-Page

`vite.config.js` mendefinisikan entry points:

- `index.html`, `admin.html`, `blog.html`, `blog-post.html`, `project.html`, `404.html`

Output: folder `dist/` siap deploy GitHub Pages.

### Dev Proxy

Saat `npm run dev`, request `/api/*` di-proxy ke `http://127.0.0.1:8787` (Wrangler dev).

Env `VITE_API_URL` di-inject saat build untuk production API URL.

---

## Keamanan

| Aspek | Implementasi |
|-------|-------------|
| Password | PBKDF2 + salt, min 8 karakter |
| JWT | HS256, secret via `wrangler secret`, expiry 30 hari |
| RBAC | Admin vs Editor di middleware |
| Upload | Auth required, max 5MB, tipe image only |
| Rate limit | Track endpoint: 30 menit per session+page |
| CORS | Whitelist origin |
| Admin | `noindex, nofollow` meta tag |

---

## Dependensi Eksternal (CDN)

Admin panel memuat dari CDN (tidak di-bundle):

- Quill 2 (rich editor)
- Highcharts (charts)
- Leaflet (map)
- SweetAlert2 (confirm dialogs)
- Font Awesome 5
- Simple DataTables (CSS)

Pastikan koneksi internet tersedia saat menggunakan admin panel.
