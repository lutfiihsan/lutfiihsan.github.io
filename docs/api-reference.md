# API Reference

Base URL production: `https://myporto-api.lawlieth404.workers.dev`

Semua endpoint diawali `/api`. Response format JSON kecuali media file.

---

## Autentikasi

Endpoint terproteksi membutuhkan header:

```http
Authorization: Bearer <JWT_TOKEN>
```

Token didapat dari `POST /api/auth/login` atau `/api/auth/setup`.  
Disimpan client-side di `localStorage` (key: `auth_token`).  
Expiry: **30 hari**.

---

## Auth

### POST `/api/auth/setup`

Buat admin pertama. **Hanya sekali** — gagal jika sudah ada user.

**Auth:** Tidak perlu

**Body:**

```json
{
  "email": "admin@example.com",
  "password": "min8chars"
}
```

**Response 200:**

```json
{
  "token": "eyJ...",
  "user": { "id": "uuid", "email": "admin@example.com", "role": "admin" }
}
```

**Errors:** `403` setup sudah dilakukan, `400` validasi gagal

---

### POST `/api/auth/login`

**Auth:** Tidak perlu

**Body:**

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response 200:** Sama format dengan setup

**Errors:** `401` email/password salah

---

### GET `/api/auth/session`

Validasi token & ambil data user saat ini.

**Auth:** Bearer token

**Response 200:**

```json
{
  "user": { "id": "uuid", "email": "admin@example.com", "role": "admin" }
}
```

**Errors:** `401` token invalid/expired

---

### POST `/api/auth/change-password`

**Auth:** Bearer token

**Body:**

```json
{
  "current_password": "oldpass",
  "new_password": "newpass123"
}
```

**Response 200:** `{ "ok": true }`

**Errors:** `401` password lama salah, `400` validasi

---

## Posts (Blog)

### GET `/api/posts`

**Auth:** Opsional

| Kondisi | Hasil |
|---------|-------|
| Tanpa token / `?published=true` | Hanya post published (tanpa content) |
| Dengan token valid | Semua post (termasuk draft + content) |

**Response 200:** Array of posts

```json
[
  {
    "id": "uuid",
    "title": "Judul Artikel",
    "slug": "judul-artikel",
    "excerpt": "...",
    "content": "...",
    "cover_image": "https://.../api/media/covers/uuid.jpg",
    "tags": ["tech", "web"],
    "published": true,
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### GET `/api/posts/slug/:slug`

Artikel published by slug. **Publik, tidak perlu auth.**

**Errors:** `404` not found

---

### GET `/api/posts/:id`

Satu post by ID. **Auth required.**

---

### POST `/api/posts`

Buat artikel baru. **Auth required.**

**Body:**

```json
{
  "title": "Judul",
  "slug": "custom-slug",
  "excerpt": "Ringkasan",
  "content": "<p>HTML dari Quill</p>",
  "cover_image": "https://.../api/media/covers/xxx.jpg",
  "tags": ["tag1"],
  "published": false
}
```

**Response 201:** Post object

**Errors:** `409` slug sudah digunakan

---

### PUT `/api/posts/:id`

Update artikel. **Auth required.** Body sama dengan POST.

---

### DELETE `/api/posts/:id`

Hapus artikel. **Auth required.**

**Response 200:** `{ "ok": true }`

---

### PATCH `/api/posts/:id/publish`

Toggle publish/draft. **Auth required.**

**Response 200:** Post object dengan status terbaru

---

## Users

Semua endpoint users membutuhkan **Admin** role.

### GET `/api/users`

**Response 200:**

```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "role": "editor",
    "created_at": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### POST `/api/users`

Tambah user baru.

**Body:**

```json
{
  "email": "editor@example.com",
  "password": "min8chars",
  "role": "editor"
}
```

**Response 201:** User object

**Errors:** `409` email sudah terdaftar

---

### PATCH `/api/users/:id/role`

**Body:** `{ "role": "admin" | "editor" }`

**Errors:** `400` tidak bisa ubah role sendiri

---

### DELETE `/api/users/:id`

**Errors:** `400` tidak bisa hapus diri sendiri / admin terakhir

---

## Statistics

### GET `/api/stats`

Dashboard statistik. **Admin only.**

Auto-prune `page_views` > 90 hari saat dipanggil.

**Response 200:**

```json
{
  "summary": { "total": 1000, "today": 42, "unique": 350 },
  "daily": { "labels": ["01 Jan", "..."], "values": [10, 15, ...] },
  "topPages": [{ "page": "🏠 Home", "count": 500 }],
  "topPosts": [{ "page": "slug-artikel", "count": 100 }],
  "devices": { "Desktop": 600, "Mobile": 350, "Tablet": 50 },
  "referrers": [{ "source": "google.com", "count": 200 }],
  "countries": [["id", 300], ["us", 50]]
}
```

---

## Tracking

### POST `/api/track`

Catat page view. **Publik, tidak perlu auth.**

**Body:**

```json
{
  "page": "home",
  "title": "Portfolio Home",
  "referrer": "google.com",
  "device": "desktop",
  "country": "id",
  "session_id": "uuid-browser-session"
}
```

**Rate limit:** Max 1 track per `session_id` + `page` per **30 menit**.

**Response 201:** `{ "ok": true }`  
**Response 200 (skipped):** `{ "ok": true, "skipped": true }` (rate limited)

---

## Upload (Media)

### POST `/api/upload`

Upload image ke R2. **Auth required.**

**Content-Type:** `multipart/form-data`

| Field | Tipe | Keterangan |
|-------|------|------------|
| `file` | File | Image (jpeg, png, webp, gif), max 5MB |
| `folder` | string | `covers` (default) atau `content` |

**Response 200:**

```json
{
  "url": "https://myporto-api.../api/media/covers/uuid.jpg",
  "key": "covers/uuid.jpg"
}
```

---

### GET `/api/media/*`

Serve file dari R2. **Publik.**

Contoh: `GET /api/media/covers/abc-123.jpg`

Cache: `public, max-age=31536000, immutable`

---

## Portfolio

### GET `/api/portfolio`

Ambil data portfolio. **Publik.**

**Response 200:**

```json
{
  "skills": [...],
  "projects": [...],
  "experience": [...],
  "_meta": { "updated_at": "...", "source": "d1" }
}
```

**Errors:** `404` belum dikonfigurasi (client fallback ke `data.json`)

---

### PUT `/api/portfolio`

Simpan portfolio. **Admin only.**

**Body:** JSON object dengan field wajib: `skills`, `projects`, `experience`

**Response 200:** `{ "ok": true, "updated_at": "..." }`

---

## Health

### GET `/api/health`

**Response 200:** `{ "ok": true }`

---

## Error Format

Semua error mengembalikan JSON:

```json
{ "error": "Pesan error dalam Bahasa Indonesia" }
```

| Status | Arti |
|--------|------|
| 400 | Validasi input gagal |
| 401 | Unauthorized / token invalid |
| 403 | Forbidden (bukan admin / setup sudah dilakukan) |
| 404 | Resource tidak ditemukan |
| 409 | Konflik (email/slug duplikat) |
| 500 | Server error |
| 503 | R2 belum dikonfigurasi |

---

## Contoh cURL

```bash
# Login
TOKEN=$(curl -s -X POST https://myporto-api.lawlieth404.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"pass"}' \
  | jq -r .token)

# List posts (admin)
curl -H "Authorization: Bearer $TOKEN" \
  https://myporto-api.lawlieth404.workers.dev/api/posts

# Upload cover
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -F "file=@cover.jpg" -F "folder=covers" \
  https://myporto-api.lawlieth404.workers.dev/api/upload

# Track page view
curl -X POST https://myporto-api.lawlieth404.workers.dev/api/track \
  -H "Content-Type: application/json" \
  -d '{"page":"home","session_id":"abc123","device":"desktop","country":"id"}'
```

---

## Client SDK

Frontend menggunakan shared module `assets/js/api.js`:

```javascript
import { login, fetchStats, loadAllPosts, uploadCover } from './api.js';
```

Fungsi utama: `getToken`, `setToken`, `clearToken`, `getSession`, `login`, `logout`, `fetchStats`, `loadAllPosts`, `savePost`, `fetchAllUsers`, `fetchPortfolio`, `savePortfolio`, `uploadMedia`, `resolveMediaUrl`.

Class `AuthError` — thrown saat 401 pada request authenticated (token di-clear otomatis).
