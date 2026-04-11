# 🚀 Lutfi Ihsan — Professional Portfolio

Selamat datang di repositori portofolio profesional saya. Website ini dirancang sebagai platform pameran karya, blog teknis, dan dasbor administrasi pribadi. Dibangun dengan fokus pada performa tinggi, desain premium (Glassmorphism), dan arsitektur kode yang bersih.

**🌐 Live Demo:** [lutfiihsan.github.io](https://lutfiihsan.github.io)

---

## ✨ Fitur Utama

- **Modern Architecture**: Berbasis **Vite.js** untuk bundling aset yang super cepat.
- **Modular Design**: Menggunakan sistem **HTML Components (Partials)** untuk pemeliharaan kode yang mudah.
- **Clean URLs**: Navigasi tanpa ekstensi `.html` (terintegrasi dengan GitHub Pages).
- **Embedded Blog System**: CMS kustom menggunakan **Supabase** sebagai database dan **Quill.js** sebagai Rich Text Editor.
- **Advanced Statistics**: Pelacakan pengunjung kustom secara anonim yang divisualisasikan dengan **Highcharts**.
- **PDF Resume Generator**: Menghasilkan CV profesional secara dinamis langsung dari browser menggunakan **jsPDF**.
- **RBAC Admin Panel**: Manajemen konten dengan sistem kontrol akses berbasis peran (Admin & Editor).

---

## 🛠️ Stack Teknologi

- **Frontend**: HTML5, Vanilla CSS (Glassmorphism), JavaScript (ES Modules).
- **Build Tool**: [Vite.js](https://vitejs.dev/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS).
- **Libraries**:
  - `Highcharts`: Statistik visual.
  - `Quill.js`: Editor artikel blog.
  - `SweetAlert2`: Notifikasi & Modal UI.
  - `Leaflet`: Visualisasi peta pengunjung.
  - `Typed.js` & `ScrollReveal`: Animasi antarmuka.

---

## 🚀 Pengembangan Lokal

Ikuti langkah-langkah di bawah untuk menjalankan proyek ini di mesin lokal Anda:

### 1. Prasyarat
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) (versi 16+ disarankan).

### 2. Instalasi
```bash
# Clone repositori
git clone https://github.com/lutfiihsan/lutfiihsan.github.io.git

# Masuk ke direktori
cd lutfiihsan.github.io

# Instal dependensi
npm install
```

### 3. Konfigurasi Environment
Buat kode rahasia lokal Anda dengan membuat file `.env` di root direktori:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON=YOUR_SUPABASE_ANON_KEY
```

### 4. Jalankan Server Dev
```bash
npm run dev
```
Akses di `http://localhost:5173`. Perubahan kode akan otomatis diperbarui (*Hot Module Replacement*).

---

## 📂 Struktur Folder

```text
├── assets/             # Aset sumber (JS, CSS, Images, Data)
│   ├── js/             # Skrip ES Modules (supabase.js, admin.js, dll)
│   ├── css/            # File styling Vanilla CSS
│   └── data/           # Data statis (proyek, skill, dll)
├── partials/           # Komponen HTML modular (Nav, Footer, Sidebar)
├── public/             # File statis yang tidak diproses Vite
├── .github/workflows/  # Konfigurasi Otomatisasi CI/CD
├── index.html          # Halaman Utama (Landing Page)
├── admin.html          # Halaman Admin
├── blog.html           # Halaman List Blog
└── vite.config.js      # Konfigurasi utama Vite & HTML Inject
```

---

## 🚢 Deployment

Proyek ini dipublikasikan secara otomatis ke **GitHub Pages** menggunakan **GitHub Actions**.

- Setiap kali ada `push` ke branch `master`, workflow di `.github/workflows/deploy.yml` akan berjalan.
- Workflow tersebut melakukan build aplikasi, menyuntikkan rahasia (secrets) secara aman, dan mengunggah folder `dist/` ke GitHub Pages.

---

## 📄 Lisensi

Proyek ini bersifat terbuka untuk tujuan pembelajaran.  
Copyright © 2026 **Lutfi Ihsan**.

---

*Lakukan perbaikan, bangun sesuatu yang hebat, dan mari berkembang bersama!* 💻🔥
