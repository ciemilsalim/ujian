# YouTube Upload Kit — `ujian`
- **Tanggal Dibuat**: `2026-11-21 22:44:43 UTC`
- **Durasi Video**: `143.65 detik` (Standard Video)
- **File Video**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_063414_ed4f52\final\final-tutorial-desktop.mp4`
- **Thumbnail**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_063414_ed4f52\youtube\thumbnail.png`

---

## 1. Judul Video (Title)
```text
Tutorial Admin Proktor ZEXAM-CBT: Manajemen Kelas, Anggota Siswa & Kenaikan Kelas
```
*(Karakter: 81/100)*

## 2. Deskripsi Video (Description with Timestamps)
```text
Tutorial Admin Proktor ZEXAM-CBT: Manajemen Kelas, Anggota Siswa & Kenaikan Kelas

Video panduan resmi cara penggunaan fitur pada aplikasi UJIAN. Ikuti langkah-langkah mudah di bawah ini untuk memahami alur penggunaan secara lengkap.

🕒 DAFTAR ISI & TIMESTAMPS:
00:00 - Navigasi Data Kelas
00:30 - Tambah Rombel Baru
00:59 - Kelola Anggota Siswa Kelas
01:25 - Modul Kenaikan Kelas Dan Mutasi
01:53 - Pemetaan Massal Wizard Dan Kelulusan

📌 RINGKASAN LANGKAH-LANGKAH:
1. Navigasi Data Kelas: Halo Bapak dan Ibu Admin serta Rekan-Rekan Proktor ZEXAM-CBT.
2. Tambah Rombel Baru: Pada modul Data Kelas, proktor dapat memantau seluruh rombel aktif beserta jumlah siswa di dalamnya.
3. Kelola Anggota Siswa Kelas: Untuk mengatur siswa yang tergabung di dalam suatu kelas, klik tombol Kelola Siswa pada baris rombel yang diinginkan.
4. Modul Kenaikan Kelas Dan Mutasi: Ketika memasuki tahun ajaran baru, sistem menyediakan modul Kenaikan Kelas terpadu.
5. Pemetaan Massal Wizard Dan Kelulusan: Bagi sekolah dengan banyak rombongan belajar, gunakan fitur Pemetaan Massal.

✨ FITUR UTAMA & KEUNGGULAN:
- Panduan interaktif visual beresolusi tinggi (60 FPS).
- Navigasi responsif dan ramah pengguna.
- Terintegrasi langsung dengan database sistem.

🌐 Akses Sistem: http://localhost:8000
Jangan lupa Like, Comment, dan Subscribe untuk mendapatkan panduan fitur terbaru lainnya!

#UJIAN #TutorialAplikasi
```
*(Karakter: 1392/5000)*

## 3. Tag Video (Tags / Keywords)
```text
ujian, tutorial ujian, panduan ujian, tutorial aplikasi, panduan sistem, tutorial, admin, proktor, zexam-cbt, manajemen, kelas, anggota, siswa, kenaikan, navigasi data kelas, tambah rombel baru, kelola anggota siswa kelas, modul kenaikan kelas dan mutasi, pemetaan massal wizard dan kelulusan
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
python .agents/skills/app-tutorial-video/scripts/cli.py youtube-upload --run-dir "D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_063414_ed4f52" --privacy private --confirm-upload
```
