# YouTube Upload Kit — `ujian`
- **Tanggal Dibuat**: `2026-11-21 04:33:46 UTC`
- **Durasi Video**: `179.28 detik` (YouTube Shorts)
- **File Video**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_122327_f02969\final\final-tutorial-mobile.mp4`
- **Thumbnail**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_122327_f02969\youtube\thumbnail.png`

---

## 1. Judul Video (Title)
```text
Tutorial Ujian CBT Siswa: Login, Token, & Antarmuka Ujian — ZEXAM-CBT #Shorts
```
*(Karakter: 77/100)*

## 2. Deskripsi Video (Description with Timestamps)
```text
Tutorial Ujian CBT Siswa: Login, Token, & Antarmuka Ujian — ZEXAM-CBT

Video panduan resmi cara penggunaan fitur pada aplikasi UJIAN. Ikuti langkah-langkah mudah di bawah ini untuk memahami alur penggunaan secara lengkap.

🕒 DAFTAR ISI & TIMESTAMPS:
00:00 - Login Siswa
00:30 - Dashboard Dan Pilih Ujian
00:54 - Masukkan Token Ujian
01:17 - Konfirmasi Dan Mulai Soal
01:41 - Antarmuka Cbt Dan Font
02:08 - Menjawab Dan Navigasi
02:33 - Daftar Soal Dan Penutup

📌 RINGKASAN LANGKAH-LANGKAH:
1. Login Siswa: Halo Rekan-Rekan Siswa Peserta Ujian, selamat datang di panduan aplikasi ZEXAM-CBT versi mobile.
2. Dashboard Dan Pilih Ujian: Bagus, kita telah berhasil masuk ke dashboard siswa.
3. Masukkan Token Ujian: Sekarang kita berada di halaman verifikasi token ujian.
4. Konfirmasi Dan Mulai Soal: Sebelum lembar soal terbuka, sistem akan menampilkan ringkasan data peserta dan rincian ujian.
5. Antarmuka Cbt Dan Font: Luar biasa, lembar ujian CBT kini telah aktif di ponsel Anda.
6. Menjawab Dan Navigasi: Silakan baca pernyataan dan stimulus dengan cermat.
7. Daftar Soal Dan Penutup: Untuk melihat ringkasan seluruh nomor soal, ketuk tombol nomor soal di bagian tengah bawah.

✨ FITUR UTAMA & KEUNGGULAN:
- Panduan interaktif visual beresolusi tinggi (60 FPS).
- Navigasi responsif dan ramah pengguna.
- Terintegrasi langsung dengan database sistem.

🌐 Akses Sistem: http://localhost:8000
Jangan lupa Like, Comment, dan Subscribe untuk mendapatkan panduan fitur terbaru lainnya!

#Shorts #UJIAN #TutorialAplikasi
```
*(Karakter: 1515/5000)*

## 3. Tag Video (Tags / Keywords)
```text
ujian, tutorial ujian, panduan ujian, tutorial aplikasi, panduan sistem, tutorial, cbt, siswa, login, token, antarmuka, zexam-cbt, login siswa, dashboard dan pilih ujian, masukkan token ujian, konfirmasi dan mulai soal, antarmuka cbt dan font, menjawab dan navigasi, daftar soal dan penutup
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
python .agents/skills/app-tutorial-video/scripts/cli.py youtube-upload --run-dir "D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_122327_f02969" --privacy private --confirm-upload
```
