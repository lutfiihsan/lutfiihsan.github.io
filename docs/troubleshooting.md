# Troubleshooting

Masalah umum dan solusinya.

---

## Autentikasi

### "Invalid token" setelah login

**Gejala:** Login berhasil, tapi Statistics/Users/Session gagal dengan "Invalid token".

**Penyebab:** JWT verify membutuhkan algoritma HS256 eksplisit (Hono JWT v4+).

**Solusi:**

1. Pastikan Worker terbaru sudah deploy (`worker/src/jwt.ts` dengan HS256)
2. Logout → login ulang (token lama invalid)
3. Clear localStorage: DevTools → Application → Local Storage → hapus `auth_token`
4. Verifikasi: `node scripts/test-auth.mjs email password`

---

### Session hilang setelah refresh

**Penyebab:** Versi lama pakai `sessionStorage` (hilang saat tab ditutup).

**Solusi:** Deploy frontend terbaru — token sekarang di `localStorage`.

---

### "Email atau password salah"

- Periksa caps lock
- Reset password: butuh akses D1 langsung atau buat user admin baru via D1
- Pastikan API URL benar (DevTools → Network)

---

### "Setup sudah dilakukan"

Endpoint `/api/auth/setup` hanya sekali. Gunakan `/api/auth/login`.

---

## Admin Panel

### Statistics: "Gagal memuat statistik"

1. Login ulang sebagai **admin** (bukan editor)
2. Cek API: `GET /api/stats` dengan Bearer token
3. Pastikan Worker deploy terbaru (JWT fix)
4. Cek console browser (F12) untuk error detail

---

### Users: error saat buka menu

- Harus role **admin**
- Token harus valid — login ulang
- Cek `GET /api/users` via script test-auth

---

### Quill editor / chart tidak muncul

Admin memuat library dari CDN. Pastikan:

- Koneksi internet aktif
- Tidak diblok adblocker (jsdelivr, highcharts, unpkg)
- Console tidak ada error 404 CDN

---

### Upload gambar gagal

| Error | Solusi |
|-------|--------|
| R2 belum dikonfigurasi | Enable R2 di Cloudflare, buat bucket `myporto-media` |
| Tipe file tidak didukung | Gunakan JPEG, PNG, WebP, atau GIF |
| Ukuran > 5MB | Kompres gambar |
| 401 Unauthorized | Login ulang |

---

## Frontend / Deploy

### API request ke URL salah

**Gejala:** Request ke `lutfiihsan.github.io/api/...` instead of Worker URL.

**Solusi:**

- Set GitHub Secret `VITE_API_URL`
- Rebuild & redeploy frontend
- Lokal: set `$env:VITE_API_URL` sebelum `npm run build`

---

### Tampilan admin masih tema lama (biru muda)

Frontend belum ter-deploy. Tunggu GitHub Actions selesai, hard refresh (`Ctrl+Shift+R`).

---

### CORS error

Update `ALLOWED_ORIGINS` di `wrangler.toml`:

```toml
ALLOWED_ORIGINS = "https://lutfiihsan.github.io,http://localhost:5173"
```

Deploy ulang API.

---

## Cloudflare Worker

### "Server auth misconfigured" (500)

`JWT_SECRET` belum diset:

```bash
npx wrangler secret put JWT_SECRET
```

---

### Worker deploy gagal di GitHub Actions

- Periksa `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID` di GitHub Secrets
- Token harus punya permission Workers + D1 + R2
- Cek log di Actions tab

---

### D1 "no such table"

```bash
npm run db:migrate:remote
```

---

## Portfolio

### Landing page masih pakai data.json lama

1. Admin → Portfolio → Import data.json → Simpan
2. Atau `GET /api/portfolio` harus return 200
3. Hard refresh landing page

---

### Portfolio JSON invalid

Validator di admin panel. Pastikan:

- JSON syntax valid (gunakan JSONLint)
- Field wajib ada: `skills`, `projects`, `experience`

---

## Analytics

### Stats semua nol

Normal jika website baru. Tracking butuh kunjungan di halaman publik:

1. Buka landing page / blog
2. Tracking otomatis via `POST /api/track`
3. Refresh Statistics di admin

---

### Data stats tiba-tiba berkurang

Retensi otomatis **90 hari**. Data lama dihapus saat admin buka Statistics.

---

## Development

### Port 8787 sudah dipakai

```bash
# Windows
netstat -ano | findstr :8787
taskkill /PID <pid> /F
```

Atau ubah port di `wrangler.toml` `[dev]`.

---

### Proxy /api tidak jalan (lokal)

Pastikan Worker dev jalan di terminal terpisah:

```bash
npm run dev:api   # Terminal 1
npm run dev       # Terminal 2
```

---

### npm run build gagal

```bash
rm -rf node_modules dist
npm install
npm run build
```

---

## Diagnostic Checklist

Jalankan berurutan:

```bash
# 1. API health
curl https://myporto-api.lawlieth404.workers.dev/api/health

# 2. Auth flow
node scripts/test-auth.mjs "your@email.com" "yourpassword"

# 3. D1 tables
npx wrangler d1 execute myporto-db --remote --command "SELECT name FROM sqlite_master WHERE type='table';"

# 4. Build frontend
npm run build
```

Semua harus sukses sebelum debug lebih lanjut.

---

## Reset Total (Last Resort)

> ⚠️ Hapus semua data. Backup dulu!

```bash
# Export backup
npx wrangler d1 export myporto-db --remote --output=backup.sql

# Hapus & recreate tables (manual via SQL)
# Atau buat database D1 baru + update wrangler.toml database_id

# Setup admin baru
curl -X POST https://myporto-api.../api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"email":"new@admin.com","password":"NewPass123!"}'
```

---

## Laporkan Bug

Saat melaporkan masalah, sertakan:

1. URL halaman yang bermasalah
2. Screenshot error
3. Console log (F12 → Console)
4. Network tab — status code request API yang gagal
5. Output `node scripts/test-auth.mjs`
