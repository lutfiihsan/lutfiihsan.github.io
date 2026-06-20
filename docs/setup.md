# Setup & Instalasi

Panduan setup dari nol — development lokal dan konfigurasi Cloudflare production.

---

## Prasyarat

| Tool | Versi | Keterangan |
|------|-------|------------|
| Node.js | 18+ | Runtime & npm |
| Git | — | Clone repository |
| Akun Cloudflare | Gratis | D1, R2, Workers |
| Akun GitHub | — | Pages hosting |

---

## 1. Clone & Install

```bash
git clone https://github.com/lutfiihsan/lutfiihsan.github.io.git
cd lutfiihsan.github.io
npm install
```

---

## 2. Konfigurasi Lokal

### JWT Secret

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars`:

```env
JWT_SECRET=gunakan-string-acak-panjang-minimal-32-karakter
```

> `.dev.vars` sudah di `.gitignore` — jangan commit file ini.

### Database Lokal

```bash
npm run db:migrate
```

Ini menjalankan `worker/schema.sql` ke D1 lokal Wrangler.

---

## 3. Setup Cloudflare (Production)

### Login Wrangler

```bash
npx wrangler login
```

### Buat D1 Database

```bash
npm run db:create
```

Salin `database_id` ke `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "myporto-db"
database_id = "<DATABASE_ID_ANDA>"
```

Migrasi ke production:

```bash
npm run db:migrate:remote
```

### Buat R2 Bucket

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/) → R2
2. Create bucket: **`myporto-media`**
3. Pastikan binding di `wrangler.toml` sudah benar:

```toml
[[r2_buckets]]
binding = "MEDIA"
bucket_name = "myporto-media"
```

### Set JWT Secret Production

```bash
npx wrangler secret put JWT_SECRET
# Masukkan string acak panjang (simpan di password manager!)
```

> Secret production **harus berbeda** dari `.dev.vars` lokal.

### Update URL Worker

Setelah deploy pertama, update `API_BASE_URL` di `wrangler.toml`:

```toml
[vars]
API_BASE_URL = "https://myporto-api.<account>.workers.dev"
ALLOWED_ORIGINS = "https://lutfiihsan.github.io,http://localhost:5173,http://127.0.0.1:5173"
```

Deploy ulang:

```bash
npm run deploy:api
```

---

## 4. Buat Admin Pertama

Endpoint `/api/auth/setup` hanya bisa dipanggil **sekali** (saat tabel `users` masih kosong).

### Lokal

```bash
curl -X POST http://localhost:8787/api/auth/setup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"Password123!\"}"
```

### Production

```bash
curl -X POST https://myporto-api.lawlieth404.workers.dev/api/auth/setup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"Password123!\"}"
```

Response sukses:

```json
{
  "token": "eyJ...",
  "user": { "id": "...", "email": "admin@example.com", "role": "admin" }
}
```

User pertama otomatis mendapat role **admin**.

---

## 5. Jalankan Development

Butuh **dua terminal**:

**Terminal 1 — API Worker:**

```bash
npm run dev:api
# Listening on http://localhost:8787
```

**Terminal 2 — Frontend Vite:**

```bash
npm run dev
# http://localhost:5173
```

| URL | Fungsi |
|-----|--------|
| http://localhost:5173 | Portfolio |
| http://localhost:5173/admin | Admin panel |
| http://localhost:5173/blog | Blog |
| http://localhost:8787/api/health | Health check API |

Vite otomatis proxy `/api/*` ke Worker lokal.

---

## 6. Setup GitHub (CI/CD)

### GitHub Secrets

Di repo → Settings → Secrets and variables → Actions:

| Secret | Nilai |
|--------|-------|
| `VITE_API_URL` | `https://myporto-api.<account>.workers.dev` |
| `CLOUDFLARE_API_TOKEN` | Token API Cloudflare (permission: Workers, D1, R2) |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID dari dashboard Cloudflare |

### Buat API Token Cloudflare

1. Dashboard → My Profile → API Tokens
2. Create Token → Edit Cloudflare Workers (template)
3. Permissions: Account / Workers Scripts / Edit, Account / D1 / Edit, Account / R2 / Edit
4. Account Resources: include account Anda

### Enable GitHub Pages

1. Settings → Pages → Source: **GitHub Actions**
2. Push ke `master`/`main` → workflow `deploy-pages.yml` otomatis jalan

---

## 7. Verifikasi Setup

### Health Check

```bash
curl https://myporto-api.lawlieth404.workers.dev/api/health
# {"ok":true}
```

### Test Auth (script bawaan)

```bash
node scripts/test-auth.mjs "email@example.com" "password"
```

Output yang diharapkan:

```text
login status: 200 admin
/auth/session: 200 ok
/stats: 200 ok
/users: 200 ok
/posts: 200 ok
```

### Test Frontend

1. Buka `http://localhost:5173/admin`
2. Login dengan akun admin
3. Cek Statistics, Posts, Users berfungsi

---

## 8. Setup Otomatis (Opsional)

Script helper tersedia:

```bash
npm run setup:cloudflare
```

Menjalankan `scripts/setup-cloudflare.mjs` — interaktif untuk konfigurasi awal Cloudflare.

---

## Environment Variables

| Variable | Lokasi | Wajib | Keterangan |
|----------|--------|:-----:|------------|
| `JWT_SECRET` | `.dev.vars` / Cloudflare secret | ✅ | Signing JWT |
| `VITE_API_URL` | GitHub Secret / build env | ✅ | URL API untuk frontend build |
| `API_BASE_URL` | `wrangler.toml` [vars] | ✅ | Base URL media R2 |
| `ALLOWED_ORIGINS` | `wrangler.toml` [vars] | ✅ | CORS whitelist |

---

## Next Steps

- [Deployment](deployment.md) — workflow CI/CD detail
- [Admin Panel](admin-panel.md) — panduan penggunaan dashboard
- [API Reference](api-reference.md) — dokumentasi endpoint
