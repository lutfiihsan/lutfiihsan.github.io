# Admin Panel

Panduan penggunaan dashboard admin di `/admin`.

**URL:** https://lutfiihsan.github.io/admin

---

## Login

1. Buka `/admin`
2. Masukkan kredensial admin (production):

| | |
|---|---|
| **Email** | `lawlieth404@gmail.com` |
| **Password** | `PortoAdmin2026!` |

3. Klik **Masuk ke Dashboard**

Session disimpan di browser (`localStorage`) — tetap login setelah refresh atau tutup tab.  
Token berlaku **30 hari**, setelah itu login ulang.

Tombol **Kembali ke Portfolio** mengarah ke halaman utama.

---

## Navigasi

| Menu | Akses | Fungsi |
|------|-------|--------|
| **Statistics** | Admin | Dashboard kunjungan & analytics |
| **Users** | Admin | Kelola akun admin/editor |
| **Posts** | Admin + Editor | CRUD artikel blog |
| **Portfolio** | Admin | Edit data portfolio (JSON) |
| **View Blog** | Semua | Buka blog di tab baru |
| **Portfolio** (link) | Semua | Buka landing page |
| **Logout** | Semua | Keluar dari admin |

---

## Statistics (Admin)

Menampilkan data dari `page_views` (tracking otomatis di halaman publik).

### Kartu Ringkasan

- **Total Kunjungan** — semua page views
- **Hari Ini** — kunjungan sejak 00:00 UTC
- **Unique Visitors** — session unik (30 hari terakhir)

### Grafik

| Grafik | Keterangan |
|--------|------------|
| Kunjungan 30 Hari | Area chart tren harian |
| Halaman Terpopuler | Bar chart top 7 halaman |
| Device Breakdown | Pie chart desktop/mobile/tablet |
| Artikel Terpopuler | Bar chart top 7 blog post |
| Traffic Sources | Column chart referrer |
| Pengunjung per Negara | Peta Leaflet dengan marker |

Klik **Refresh** untuk muat ulang data.

> Data otomatis di-prune setelah **90 hari** saat admin membuka stats.

---

## Users (Admin)

### Daftar User

Tabel menampilkan email, role, tanggal bergabung.

### Tambah User

1. Klik **Tambah User**
2. Isi email, password (min. 8 karakter), role
3. **Simpan**

Role:

- **Admin** — akses penuh
- **Editor** — hanya Posts

### Ubah Role

Klik **Ubah Role** → pilih Admin atau Editor.

> Tidak bisa mengubah role akun sendiri.

### Hapus User

Klik ikon trash → konfirmasi.

> Tidak bisa hapus diri sendiri atau admin terakhir.

---

## Posts (Admin + Editor)

### Daftar Artikel

Tabel: judul, slug, status (Published/Draft), tanggal, aksi.

### Buat Artikel

1. Klik **Tulis Artikel Baru**
2. Isi form:
   - **Judul** — wajib
   - **Slug** — auto-generate dari judul (bisa edit)
   - **Excerpt** — ringkasan singkat
   - **Cover Image** — upload atau URL
   - **Tags** — comma-separated
   - **Content** — Quill rich text editor
3. **Simpan Draft** atau **Publish**

### Quill Editor

Toolbar: heading, bold, italic, list, blockquote, code, link, image.

**Upload gambar inline:**

- Klik ikon image di toolbar
- Pilih file → otomatis upload ke R2 (`content/` folder)
- URL disisipkan ke editor

### Aksi per Artikel

| Tombol | Fungsi |
|--------|--------|
| Edit | Buka modal editor |
| Publish / Unpublish | Toggle status |
| Delete | Hapus permanen |

---

## Portfolio CMS (Admin)

Edit konten landing page via JSON editor.

### Workflow

1. Buka tab **Portfolio**
2. Edit JSON (skills, projects, experience, dll.)
3. Klik **Simpan** → data ke D1
4. Landing page otomatis fetch dari API

### Import data.json

Klik **Import data.json** untuk muat template default dari `assets/data/data.json`, lalu **Simpan** untuk publish.

### Struktur JSON Wajib

```json
{
  "skills": [...],
  "projects": [...],
  "experience": [...]
}
```

Field lain (personal info, social links, dll.) ikut tersimpan selama field wajib ada.

---

## Ganti Password

1. Klik tombol **Password** di topbar (ikon kunci)
2. Isi password lama dan password baru (min. 8 karakter)
3. **Simpan**

---

## UI & Tema

Admin panel menggunakan tema **Golden Admin**:

- Dark glass background
- Gold accent color
- Sidebar fixed kiri
- Responsive (mobile: sidebar tersembunyi)

CSS: `assets/css/admin.css` + `assets/css/admin-premium.css`

---

## Role Matrix

| Aksi | Admin | Editor |
|------|:-----:|:------:|
| Lihat Statistics | ✅ | ❌ |
| Kelola Users | ✅ | ❌ |
| Portfolio CMS | ✅ | ❌ |
| Buat/Edit Post | ✅ | ✅ |
| Publish Post | ✅ | ✅ |
| Hapus Post | ✅ | ✅ |
| Upload Media | ✅ | ✅ |
| Ganti Password | ✅ | ✅ |

---

## Tips

1. **Selalu logout** di perangkat publik
2. **Ganti password default** setelah setup pertama
3. **Backup portfolio** — export JSON sebelum edit besar
4. **Cover image** — gunakan format WebP/JPEG, max 5MB
5. **Slug unik** — hindari duplikat saat buat artikel

---

## Keyboard & UX

- Modal editor: klik overlay untuk tutup
- Toast notification muncul kanan bawah (sukses/error)
- Loading spinner saat fetch data
- Konfirmasi SweetAlert2 untuk aksi destruktif (hapus, logout)
