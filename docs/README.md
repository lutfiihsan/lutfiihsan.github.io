# Dokumentasi MyPorto

Dokumentasi lengkap untuk proyek portofolio **Lutfi Ihsan** — frontend statis di GitHub Pages dengan backend serverless Cloudflare.

---

## Daftar Isi

| # | Dokumen | Untuk siapa |
|---|---------|-------------|
| 1 | [Arsitektur](architecture.md) | Developer — memahami alur sistem |
| 2 | [Setup](setup.md) | Developer — instalasi lokal & Cloudflare |
| 3 | [Deployment](deployment.md) | DevOps — CI/CD production |
| 4 | [API Reference](api-reference.md) | Developer — integrasi & testing API |
| 5 | [Admin Panel](admin-panel.md) | Admin/Editor — penggunaan dashboard |
| 6 | [Database](database.md) | Developer — skema D1 & migrasi |
| 7 | [Troubleshooting](troubleshooting.md) | Semua — masalah umum & solusi |

---

## URL Production

| Layanan | URL |
|---------|-----|
| Portfolio | https://lutfiihsan.github.io |
| Blog | https://lutfiihsan.github.io/blog |
| Admin | https://lutfiihsan.github.io/admin |
| API | https://myporto-api.lawlieth404.workers.dev |
| Health check | `GET /api/health` |

---

## Ringkasan Arsitektur

```text
┌─────────────────────┐         HTTPS          ┌──────────────────────────┐
│  GitHub Pages       │  ──────────────────►   │  Cloudflare Worker       │
│  (Static Frontend)  │   Bearer JWT + JSON    │  (Hono API)              │
│                     │  ◄──────────────────   │                          │
│  - index.html       │                        │  ┌────────┐ ┌────────┐  │
│  - blog.html        │                        │  │ D1 DB  │ │ R2     │  │
│  - admin.html       │                        │  └────────┘ └────────┘  │
│  (React admin)      │                        └──────────────────────────┘
└─────────────────────┘
```

---

## Role & Akses

| Fitur | Admin | Editor |
|-------|:-----:|:------:|
| Statistics | ✅ | ❌ |
| User Management | ✅ | ❌ |
| Portfolio CMS | ✅ | ❌ |
| Blog Posts (CRUD) | ✅ | ✅ |
| Publish/Unpublish | ✅ | ✅ |
| Ganti Password | ✅ | ✅ |

---

## Versi & Changelog Singkat

| Versi | Perubahan utama |
|-------|-----------------|
| **2.0** | Migrasi Supabase → Cloudflare (D1 + R2 + Workers) |
| **2.0 Phase B** | Portfolio CMS, Quill image upload, delete user |
| **2.0 Phase C** | Admin panel React, premium dark UI |
| **2.0.x** | Fix JWT HS256, session localStorage, auth error handling |

---

Mulai dari [Setup](setup.md) jika baru clone repo, atau [Admin Panel](admin-panel.md) jika ingin langsung mengelola konten.
