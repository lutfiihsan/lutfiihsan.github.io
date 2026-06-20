# Database (Cloudflare D1)

Database SQLite serverless di Cloudflare D1. Binding name: **`DB`**.

---

## Tabel

### `users`

Akun admin panel.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT PK | UUID |
| `email` | TEXT UNIQUE | Case-insensitive (NOCASE) |
| `password_hash` | TEXT | PBKDF2 hash |
| `role` | TEXT | `admin` atau `editor` |
| `created_at` | TEXT | ISO datetime, default `now()` |

---

### `posts`

Artikel blog.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT PK | UUID |
| `title` | TEXT | Judul artikel |
| `slug` | TEXT UNIQUE | URL slug (NOCASE) |
| `excerpt` | TEXT | Ringkasan |
| `content` | TEXT | HTML content (Quill) |
| `cover_image` | TEXT | URL cover (R2) |
| `tags` | TEXT | JSON array string, default `[]` |
| `published` | INTEGER | 0 = draft, 1 = published |
| `created_at` | TEXT | ISO datetime |
| `updated_at` | TEXT | ISO datetime |

**Index:** `idx_posts_published`, `idx_posts_slug`

---

### `page_views`

Analytics tracking.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT PK | UUID |
| `page` | TEXT | Identifier halaman (`home`, `blog:slug`, dll.) |
| `title` | TEXT | Judul halaman |
| `referrer` | TEXT | Sumber traffic |
| `device` | TEXT | `desktop`, `mobile`, `tablet` |
| `country` | TEXT | Kode negara ISO 2 huruf |
| `session_id` | TEXT | Browser session UUID |
| `created_at` | TEXT | ISO datetime |

**Index:** `idx_page_views_created`, `idx_page_views_page`, `idx_page_views_session`

**Retensi:** Data > 90 hari dihapus otomatis saat admin buka Statistics.

---

### `portfolio`

CMS data landing page.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT PK | Default `'main'` (single row) |
| `data` | TEXT | JSON string portfolio |
| `updated_at` | TEXT | ISO datetime |

---

## Diagram Relasi

```text
users          (standalone — auth)
posts          (standalone — blog)
page_views     (standalone — analytics)
portfolio      (standalone — CMS, id='main')
```

Tidak ada foreign key antar tabel — desain sederhana untuk D1.

---

## Migrasi

### File Skema

| File | Fungsi |
|------|--------|
| `worker/schema.sql` | Skema lengkap (semua tabel) |
| `worker/migrations/002_portfolio.sql` | Migrasi tambahan portfolio (jika upgrade dari versi lama) |

### Perintah

```bash
# Lokal (Wrangler dev)
npm run db:migrate

# Production
npm run db:migrate:remote

# Portfolio migration (production)
npm run db:migrate:portfolio
```

### Query Manual

```bash
# Lokal
npx wrangler d1 execute myporto-db --local --command "SELECT COUNT(*) FROM users;"

# Production
npx wrangler d1 execute myporto-db --remote --command "SELECT COUNT(*) FROM users;"
```

---

## Contoh Query

### List semua admin

```sql
SELECT id, email, role, created_at FROM users WHERE role = 'admin';
```

### Post published terbaru

```sql
SELECT title, slug, created_at FROM posts
WHERE published = 1 ORDER BY created_at DESC LIMIT 10;
```

### Kunjungan hari ini

```sql
SELECT COUNT(*) FROM page_views
WHERE created_at >= datetime('now', 'start of day');
```

### Top pages 30 hari

```sql
SELECT page, COUNT(*) as views FROM page_views
WHERE created_at >= datetime('now', '-30 days')
GROUP BY page ORDER BY views DESC LIMIT 10;
```

---

## Backup & Restore

### Export (production)

```bash
npx wrangler d1 export myporto-db --remote --output=backup.sql
```

### Import

```bash
npx wrangler d1 execute myporto-db --remote --file=backup.sql
```

### Backup Portfolio saja

Via admin panel → Portfolio tab → copy JSON, atau:

```bash
npx wrangler d1 execute myporto-db --remote \
  --command "SELECT data FROM portfolio WHERE id='main';"
```

---

## Storage R2 (Media)

Bukan D1, tapi terkait database content:

| Folder | Isi |
|--------|-----|
| `covers/` | Cover image blog posts |
| `content/` | Inline images dari Quill editor |

Bucket: `myporto-media`  
Di-serve via: `GET /api/media/{key}`

---

## Kapasitas & Limit

| Resource | Free tier (perkiraan) |
|----------|----------------------|
| D1 reads | 5 juta/hari |
| D1 writes | 100 ribu/hari |
| D1 storage | 5 GB |
| R2 storage | 10 GB |

Retensi 90 hari page_views menjaga ukuran database tetap kecil.

---

## Troubleshooting DB

| Masalah | Solusi |
|---------|--------|
| `no such table` | Jalankan `db:migrate:remote` |
| Setup sudah dilakukan | User sudah ada — gunakan login, bukan setup |
| Portfolio 404 | Import & simpan via admin, atau insert manual |
| Stats kosong | Normal jika belum ada traffic — buka halaman publik dulu |

Lihat juga [Troubleshooting](troubleshooting.md).
