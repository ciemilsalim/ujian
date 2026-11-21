# YouTube Upload Kit — `ujian`
- **Tanggal Dibuat**: `2026-11-21 09:24:00 UTC`
- **Durasi Video**: `164.87 detik` (Standard Video)
- **File Video**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_170734_150234\final\final-tutorial-desktop.mp4`
- **Thumbnail**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_170734_150234\youtube\thumbnail.png`

---

## 1. Judul Video (Title)
```text
Tutorial Admin Proktor ZEXAM-CBT: Pembuatan Paket Ujian, Penjadwalan Sesi, & Rilis Token Ujian
```
*(Karakter: 94/100)*

## 2. Deskripsi Video (Description with Timestamps)
```text
Tutorial Admin Proktor ZEXAM-CBT: Pembuatan Paket Ujian, Penjadwalan Sesi, & Rilis Token Ujian

Video panduan resmi cara penggunaan fitur pada aplikasi UJIAN. Ikuti langkah-langkah mudah di bawah ini untuk memahami alur penggunaan secara lengkap.

🕒 DAFTAR ISI & TIMESTAMPS:
00:00 - Navigasi Manajemen Ujian
00:28 - Pembuatan Paket Ujian Dan Parameter
01:07 - Menu Sesi Aktif Dan Statistik
01:37 - Pembuatan Sesi Dan Jadwal Kelas
02:08 - Sinkronisasi Peserta Token Dan Monitoring

📌 RINGKASAN LANGKAH-LANGKAH:
1. Navigasi Manajemen Ujian: Halo Bapak dan Ibu Admin serta Proktor ZEXAM-CBT.
2. Pembuatan Paket Ujian Dan Parameter: Untuk membuat paket ujian baru, klik tombol Buat Ujian Baru di pojok kanan atas.
3. Menu Sesi Aktif Dan Statistik: Setelah paket ujian siap, langkah berikutnya adalah menjadwalkan sesi pelaksanaan.
4. Pembuatan Sesi Dan Jadwal Kelas: Klik tombol Buat Sesi Baru untuk mengalokasikan ujian ke rombongan belajar.
5. Sinkronisasi Peserta Token Dan Monitoring: Pada tabel sesi, klik tombol sinkronisasi peserta agar seluruh siswa pada kelas tersebut terdaftar ke dalam sesi ujian.

✨ FITUR UTAMA & KEUNGGULAN:
- Panduan interaktif visual beresolusi tinggi (60 FPS).
- Navigasi responsif dan ramah pengguna.
- Terintegrasi langsung dengan database sistem.

🌐 Akses Sistem: http://localhost:8000
Jangan lupa Like, Comment, dan Subscribe untuk mendapatkan panduan fitur terbaru lainnya!

#UJIAN #TutorialAplikasi
```
*(Karakter: 1433/5000)*

## 3. Tag Video (Tags / Keywords)
```text
ujian, tutorial ujian, panduan ujian, tutorial aplikasi, panduan sistem, tutorial, admin, proktor, zexam-cbt, pembuatan, paket, penjadwalan, sesi, rilis, token, navigasi manajemen ujian, pembuatan paket ujian dan parameter, menu sesi aktif dan statistik, pembuatan sesi dan jadwal kelas, sinkronisasi peserta token dan monitoring
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
python .agents/skills/app-tutorial-video/scripts/cli.py youtube-upload --run-dir "D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_170734_150234" --privacy private --confirm-upload
```
