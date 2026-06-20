# Deployment

Panduan deploy production — GitHub Pages (frontend) dan Cloudflare Workers (API).

---

## Arsitektur Deploy

```text
git push master/main
       │
       ├──► deploy-pages.yml  ──► GitHub Pages (dist/)
       │
       └──► deploy-api.yml     ──► Cloudflare Worker (jika worker/ berubah)
```

| Komponen | Platform | Trigger |
|----------|----------|---------|
| Frontend | GitHub Pages | Setiap push ke `master`/`main` |
| API Worker | Cloudflare | Push ke `master`/`main` jika path `worker/**`, `wrangler.toml`, atau `package.json` berubah |
| D1 Database | Cloudflare | Manual (`db:migrate:remote`) |
| R2 Storage | Cloudflare | Manual (dashboard) |

---

## Deploy Frontend (GitHub Pages)

### Otomatis (CI/CD)

Workflow: `.github/workflows/deploy-pages.yml`

```yaml
on:
  push:
    branches: ["master", "main"]
```

Langkah workflow:

1. Checkout code
2. `npm install`
3. `npm run build` dengan `VITE_API_URL` dari GitHub Secret
4. Upload `dist/` ke GitHub Pages
5. Deploy

**Pastikan** secret `VITE_API_URL` sudah diset sebelum push pertama.

### Manual

```powershell
# Windows PowerShell
$env:VITE_API_URL="https://myporto-api.lawlieth404.workers.dev"
npm run build
```

```bash
# Linux/macOS
VITE_API_URL=https://myporto-api.lawlieth404.workers.dev npm run build
```

Output ada di folder `dist/`. Push ke branch `gh-pages` atau gunakan GitHub Actions.

### Verifikasi

1. Buka https://lutfiihsan.github.io
2. DevTools → Network → pastikan request API ke `myporto-api.*.workers.dev`
3. Buka `/admin` → login → cek Statistics & Users

---

## Deploy API (Cloudflare Worker)

### Otomatis (CI/CD)

Workflow: `.github/workflows/deploy-api.yml`

```yaml
on:
  push:
    branches: ["master", "main"]
    paths:
      - "worker/**"
      - "wrangler.toml"
      - "package.json"
      - "package-lock.json"
```

Menggunakan `cloudflare/wrangler-action@v3` dengan secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Manual

```bash
npm run deploy:api
# atau
npx wrangler deploy
```

Output:

```text
Deployed myporto-api triggers
  https://myporto-api.lawlieth404.workers.dev
```

### Set Secret (sekali / saat rotasi)

```bash
npx wrangler secret put JWT_SECRET
```

> Setelah rotasi JWT_SECRET, **semua user harus login ulang** (token lama invalid).

---

## Konfigurasi wrangler.toml

```toml
name = "myporto-api"
main = "worker/src/index.ts"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[vars]
ALLOWED_ORIGINS = "https://lutfiihsan.github.io,http://localhost:5173,http://127.0.0.1:5173"
API_BASE_URL = "https://myporto-api.lawlieth404.workers.dev"

[[d1_databases]]
binding = "DB"
database_name = "myporto-db"
database_id = "f82bb04c-8cd7-4bea-bcee-57dbec9fab93"

[[r2_buckets]]
binding = "MEDIA"
bucket_name = "myporto-media"

[dev]
port = 8787
```

---

## Migrasi Database Production

### Skema awal

```bash
npm run db:migrate:remote
```

### Migrasi tambahan (portfolio)

```bash
npm run db:migrate:portfolio
```

### Migrasi custom

```bash
npx wrangler d1 execute myporto-db --remote --file=./worker/migrations/XXX.sql
```

---

## Checklist Deploy Pertama

- [ ] Buat D1 database + salin `database_id` ke `wrangler.toml`
- [ ] Buat R2 bucket `myporto-media`
- [ ] Set `JWT_SECRET` via `wrangler secret put`
- [ ] Deploy API: `npm run deploy:api`
- [ ] Update `API_BASE_URL` di `wrangler.toml` → deploy ulang
- [ ] Setup admin: `POST /api/auth/setup`
- [ ] Set GitHub Secrets (`VITE_API_URL`, `CLOUDFLARE_*`)
- [ ] Enable GitHub Pages (source: GitHub Actions)
- [ ] Push ke `master` → verifikasi frontend & admin
- [ ] Import portfolio: Admin → Portfolio → Import data.json → Simpan

---

## Rollback

### Frontend

GitHub Pages tidak otomatis rollback. Revert commit di GitHub dan push ulang, atau re-run workflow dari commit sebelumnya.

### API Worker

```bash
# Lihat riwayat deploy
npx wrangler deployments list

# Rollback ke versi sebelumnya (Cloudflare Dashboard)
# Workers → myporto-api → Deployments → Rollback
```

---

## Custom Domain (Opsional)

### GitHub Pages

Settings → Pages → Custom domain → `www.example.com`

### Cloudflare Worker

Workers → myporto-api → Settings → Triggers → Custom Domain

Jika pakai custom domain API, update:

- `VITE_API_URL` (GitHub Secret)
- `API_BASE_URL` (`wrangler.toml`)
- `ALLOWED_ORIGINS` (`wrangler.toml`)

---

## Monitoring

| Check | Cara |
|-------|------|
| API health | `GET /api/health` → `{"ok":true}` |
| Worker logs | Cloudflare Dashboard → Workers → Logs (Real-time) |
| GitHub Actions | Repo → Actions tab |
| Auth test | `node scripts/test-auth.mjs email password` |
