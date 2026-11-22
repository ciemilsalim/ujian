# YouTube Upload Kit — `ujian`
- **Tanggal Dibuat**: `2026-11-21 22:02:17 UTC`
- **Durasi Video**: `157.23 detik` (Standard Video)
- **File Video**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_054541_13f6b7\final\final-tutorial-desktop.mp4`
- **Thumbnail**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_054541_13f6b7\youtube\thumbnail.png`

---

## 1. Judul Video (Title)
```text
Tutorial Admin Proktor ZEXAM-CBT: Manajemen Ruang Ujian, Distribusi Siswa & Denah Duduk
```
*(Karakter: 87/100)*

## 2. Deskripsi Video (Description with Timestamps)
```text
Tutorial Admin Proktor ZEXAM-CBT: Manajemen Ruang Ujian, Distribusi Siswa & Denah Duduk

Video panduan resmi cara penggunaan fitur pada aplikasi UJIAN. Ikuti langkah-langkah mudah di bawah ini untuk memahami alur penggunaan secara lengkap.

🕒 DAFTAR ISI & TIMESTAMPS:
00:00 - Navigasi Ruang Ujian
00:29 - Tambah Ruang Dan Kapasitas
01:02 - Modul Distribusi Siswa Global
01:30 - Filter Kelas Dan Pembagian Siswa
01:59 - Denah Duduk Interaktif Dan Cetak Pdf

📌 RINGKASAN LANGKAH-LANGKAH:
1. Navigasi Ruang Ujian: Halo Bapak dan Ibu Admin serta Rekan-Rekan Proktor ZEXAM-CBT.
2. Tambah Ruang Dan Kapasitas: Pada halaman ini, proktor dapat melihat seluruh ruang ujian aktif beserta statistik kapasitas kursi dan statusnya.
3. Modul Distribusi Siswa Global: Sekarang kita beralih ke pembagian ruang peserta ujian.
4. Filter Kelas Dan Pembagian Siswa: Proktor juga dapat memfilter siswa berdasarkan rombel kelas tertentu, mencari nama murid, atau mencentang seluruh siswa dalam satu rombel untuk dialokasikan sekaligus ke ruangan yang dituju.
5. Denah Duduk Interaktif Dan Cetak Pdf: Inilah kanvas denah duduk interaktif ZEXAM-CBT.

✨ FITUR UTAMA & KEUNGGULAN:
- Panduan interaktif visual beresolusi tinggi (60 FPS).
- Navigasi responsif dan ramah pengguna.
- Terintegrasi langsung dengan database sistem.

🌐 Akses Sistem: http://localhost:8000
Jangan lupa Like, Comment, dan Subscribe untuk mendapatkan panduan fitur terbaru lainnya!

#UJIAN #TutorialAplikasi
```
*(Karakter: 1454/5000)*

## 3. Tag Video (Tags / Keywords)
```text
ujian, tutorial ujian, panduan ujian, tutorial aplikasi, panduan sistem, tutorial, admin, proktor, zexam-cbt, manajemen, ruang, distribusi, siswa, denah, duduk, navigasi ruang ujian, tambah ruang dan kapasitas, modul distribusi siswa global, filter kelas dan pembagian siswa, denah duduk interaktif dan cetak pdf
```

## 4. Pengaturan Upload yang Disarankan
- **Kategori**: `27` (Pendidikan / Education) atau `28` (Sains & Teknologi)
- **Visibilitas Awal**: `private` (disarankan private/unlisted untuk review akhir)
- **Dibuat untuk Anak-Anak**: `Tidak` (`selfDeclaredMadeForKids: false`)
- **Bahasa Video**: `Indonesia (id)`

---

## 5. Perintah CLI Upload Otomatis (YouTube Data API v3)
```powershell
# Langkah A: Autentikasi OAuth Google YouTube (hanya sekali):
python .agents/skills/app-tutorial-video/scripts/cli.py youtube-auth --client-secrets .credentials/client_secret.json

# Langkah B: Upload video langsung ke channel YouTube:
python .agents/skills/app-tutorial-video/scripts/cli.py youtube-upload --run-dir "D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_054541_13f6b7" --privacy private --confirm-upload
```
