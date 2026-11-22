# YouTube Upload Kit — `ujian`
- **Tanggal Dibuat**: `2026-11-21 23:08:27 UTC`
- **Durasi Video**: `171.02 detik` (Standard Video)
- **File Video**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_064854_d6e86b\final\final-tutorial-desktop.mp4`
- **Thumbnail**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_064854_d6e86b\youtube\thumbnail.png`

---

## 1. Judul Video (Title)
```text
Tutorial Guru ZEXAM-CBT: Pembuatan Soal Menjodohkan, Isian Singkat & Soal Essay
```
*(Karakter: 79/100)*

## 2. Deskripsi Video (Description with Timestamps)
```text
Tutorial Guru ZEXAM-CBT: Pembuatan Soal Menjodohkan, Isian Singkat & Soal Essay

Video panduan resmi cara penggunaan fitur pada aplikasi UJIAN. Ikuti langkah-langkah mudah di bawah ini untuk memahami alur penggunaan secara lengkap.

🕒 DAFTAR ISI & TIMESTAMPS:
00:00 - Navigasi Tambah Soal
00:34 - Konfigurasi Soal Menjodohkan
01:15 - Konfigurasi Soal Isian Singkat
01:48 - Konfigurasi Soal Essay Dan Rubrik
02:19 - Tinjau Daftar Soal Dan Penutup

📌 RINGKASAN LANGKAH-LANGKAH:
1. Navigasi Tambah Soal: Halo Bapak dan Ibu Guru serta Tim Pengajar ZEXAM-CBT.
2. Konfigurasi Soal Menjodohkan: Untuk membuat soal menjodohkan, ubah dropdown Tipe Soal menjadi Menjodohkan.
3. Konfigurasi Soal Isian Singkat: Selanjutnya, kita beralih ke tipe soal Isian Singkat.
4. Konfigurasi Soal Essay Dan Rubrik: Untuk soal uraian mendalam, pilih tipe Essay.
5. Tinjau Daftar Soal Dan Penutup: Seluruh butir soal menjodohkan, isian singkat, dan uraian esai akan tampil terstruktur pada daftar pertanyaan.

✨ FITUR UTAMA & KEUNGGULAN:
- Panduan interaktif visual beresolusi tinggi (60 FPS).
- Navigasi responsif dan ramah pengguna.
- Terintegrasi langsung dengan database sistem.

🌐 Akses Sistem: http://localhost:8000
Jangan lupa Like, Comment, dan Subscribe untuk mendapatkan panduan fitur terbaru lainnya!

#UJIAN #TutorialAplikasi
```
*(Karakter: 1312/5000)*

## 3. Tag Video (Tags / Keywords)
```text
ujian, tutorial ujian, panduan ujian, tutorial aplikasi, panduan sistem, tutorial, guru, zexam-cbt, pembuatan, soal, menjodohkan, isian, singkat, essay, navigasi tambah soal, konfigurasi soal menjodohkan, konfigurasi soal isian singkat, konfigurasi soal essay dan rubrik, tinjau daftar soal dan penutup
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
python .agents/skills/app-tutorial-video/scripts/cli.py youtube-upload --run-dir "D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_064854_d6e86b" --privacy private --confirm-upload
```
