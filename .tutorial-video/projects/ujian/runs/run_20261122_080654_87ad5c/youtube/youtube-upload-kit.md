# YouTube Upload Kit — `ujian`
- **Tanggal Dibuat**: `2026-11-22 00:26:47 UTC`
- **Durasi Video**: `227.22 detik` (Standard Video)
- **File Video**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_080654_87ad5c\final\final-tutorial-desktop.mp4`
- **Thumbnail**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_080654_87ad5c\youtube\thumbnail.png`

---

## 1. Judul Video (Title)
```text
Tutorial Proktor ZEXAM-CBT: Manajemen Pengawas & Penetapan Ruang Ujian
```
*(Karakter: 70/100)*

## 2. Deskripsi Video (Description with Timestamps)
```text
Tutorial Proktor ZEXAM-CBT: Manajemen Pengawas & Penetapan Ruang Ujian

Video panduan resmi cara penggunaan fitur pada aplikasi UJIAN. Ikuti langkah-langkah mudah di bawah ini untuk memahami alur penggunaan secara lengkap.

🕒 DAFTAR ISI & TIMESTAMPS:
00:00 - Navigasi Pengawas
00:41 - Tambah Pengawas Baru
01:31 - Akses Qr Dan Cetak Barcode
02:14 - Penetapan Pengawas Ruang
03:05 - Integrasi Administrasi Selesai

📌 RINGKASAN LANGKAH-LANGKAH:
1. Navigasi Pengawas: Halo rekan administrator dan proktor ujian.
2. Tambah Pengawas Baru: Untuk mendaftarkan tenaga pengawas baru ke dalam sistem, klik tombol Tambah Pengawas di pojok kanan atas.
3. Akses Qr Dan Cetak Barcode: ZEXAM-CBT menyediakan fitur cetak kartu akses berbasis barcode.
4. Penetapan Pengawas Ruang: Langkah berikutnya adalah menugaskan pengawas ke ruang sesi ujian.
5. Integrasi Administrasi Selesai: Seluruh penetapan pengawas ini otomatis terintegrasi ke modul Administrasi Ujian.

✨ FITUR UTAMA & KEUNGGULAN:
- Panduan interaktif visual beresolusi tinggi (60 FPS).
- Navigasi responsif dan ramah pengguna.
- Terintegrasi langsung dengan database sistem.

🌐 Akses Sistem: http://localhost:8000
Jangan lupa Like, Comment, dan Subscribe untuk mendapatkan panduan fitur terbaru lainnya!

#UJIAN #TutorialAplikasi
```
*(Karakter: 1276/5000)*

## 3. Tag Video (Tags / Keywords)
```text
ujian, tutorial ujian, panduan ujian, tutorial aplikasi, panduan sistem, tutorial, proktor, zexam-cbt, manajemen, pengawas, penetapan, ruang, navigasi pengawas, tambah pengawas baru, akses qr dan cetak barcode, penetapan pengawas ruang, integrasi administrasi selesai
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
python .agents/skills/app-tutorial-video/scripts/cli.py youtube-upload --run-dir "D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_080654_87ad5c" --privacy private --confirm-upload
```
