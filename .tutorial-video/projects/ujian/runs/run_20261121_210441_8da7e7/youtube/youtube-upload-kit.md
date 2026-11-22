# YouTube Upload Kit — `ujian`
- **Tanggal Dibuat**: `2026-11-21 13:35:38 UTC`
- **Durasi Video**: `166.70 detik` (Standard Video)
- **File Video**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_210441_8da7e7\final\final-tutorial-desktop.mp4`
- **Thumbnail**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_210441_8da7e7\youtube\thumbnail.png`

---

## 1. Judul Video (Title)
```text
Tutorial Admin Proktor ZEXAM-CBT: Manajemen Akun & Import Siswa Excel Word
```
*(Karakter: 74/100)*

## 2. Deskripsi Video (Description with Timestamps)
```text
Tutorial Admin Proktor ZEXAM-CBT: Manajemen Akun & Import Siswa Excel Word

Video panduan resmi cara penggunaan fitur pada aplikasi UJIAN. Ikuti langkah-langkah mudah di bawah ini untuk memahami alur penggunaan secara lengkap.

🕒 DAFTAR ISI & TIMESTAMPS:
00:00 - Navigasi Manajemen Akun
00:31 - Filter Dan Pencarian Pengguna
00:59 - Tambah User Manual
01:29 - Import Siswa Excel Dan Word
02:07 - Kontrol Keamanan Password Dan Aksi Masal

📌 RINGKASAN LANGKAH-LANGKAH:
1. Navigasi Manajemen Akun: Halo Bapak dan Ibu Admin serta Proktor ZEXAM-CBT.
2. Filter Dan Pencarian Pengguna: Sistem ZEXAM-CBT memudahkan proktor mencari akun berdasarkan nama, username, maupun NIS siswa.
3. Tambah User Manual: Untuk menambahkan akun pengguna satu per satu, klik tombol User Baru di pojok kanan atas.
4. Import Siswa Excel Dan Word: Untuk mengunggah ratusan akun siswa sekaligus dalam hitungan detik, klik tombol Import Siswa.
5. Kontrol Keamanan Password Dan Aksi Masal: Tabel pengguna dilengkapi kontrol interaktif: klik ikon mata untuk menampilkan password siswa secara transparan saat ada kendala lupa sandi, atau gunakan kotak centang untuk menghapus beberapa akun sekaligus secara massal.

✨ FITUR UTAMA & KEUNGGULAN:
- Panduan interaktif visual beresolusi tinggi (60 FPS).
- Navigasi responsif dan ramah pengguna.
- Terintegrasi langsung dengan database sistem.

🌐 Akses Sistem: http://localhost:8000
Jangan lupa Like, Comment, dan Subscribe untuk mendapatkan panduan fitur terbaru lainnya!

#UJIAN #TutorialAplikasi
```
*(Karakter: 1509/5000)*

## 3. Tag Video (Tags / Keywords)
```text
ujian, tutorial ujian, panduan ujian, tutorial aplikasi, panduan sistem, tutorial, admin, proktor, zexam-cbt, manajemen, akun, import, siswa, excel, word, navigasi manajemen akun, filter dan pencarian pengguna, tambah user manual, import siswa excel dan word, kontrol keamanan password dan aksi masal
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
python .agents/skills/app-tutorial-video/scripts/cli.py youtube-upload --run-dir "D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_210441_8da7e7" --privacy private --confirm-upload
```
