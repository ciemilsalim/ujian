# YouTube Upload Kit — `ujian`
- **Tanggal Dibuat**: `2026-11-22 01:38:32 UTC`
- **Durasi Video**: `255.00 detik` (Standard Video)
- **File Video**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_090647_7751c0\final\final-tutorial-desktop.mp4`
- **Thumbnail**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_090647_7751c0\youtube\thumbnail.png`

---

## 1. Judul Video (Title)
```text
Tutorial Proktor ZEXAM-CBT: Pengaturan Sekolah, Anti-Curang & Tahun Ajaran
```
*(Karakter: 74/100)*

## 2. Deskripsi Video (Description with Timestamps)
```text
Tutorial Proktor ZEXAM-CBT: Pengaturan Sekolah, Anti-Curang & Tahun Ajaran

Video panduan resmi cara penggunaan fitur pada aplikasi UJIAN. Ikuti langkah-langkah mudah di bawah ini untuk memahami alur penggunaan secara lengkap.

🕒 DAFTAR ISI & TIMESTAMPS:
00:00 - Profil Sekolah Dan Kkm
01:02 - Sensor Anti Curang Dan Mode
01:54 - Area Berbahaya Clear Data
02:33 - Manajemen Tahun Ajaran
03:29 - Fitur Ta Switcher

📌 RINGKASAN LANGKAH-LANGKAH:
1. Profil Sekolah Dan Kkm: Halo rekan proktor dan pengelola sistem ZEXAM-CBT.
2. Sensor Anti Curang Dan Mode: ZEXAM-CBT dibekali sistem keamanan canggih dengan kontrol anti-kecurangan modular.
3. Area Berbahaya Clear Data: Di bagian bawah halaman pengaturan, ZEXAM-CBT menyediakan fitur Area Berbahaya untuk pembersihan data transaksional.
4. Manajemen Tahun Ajaran: Selanjutnya, mari kita masuk ke menu Tahun Ajaran pada kelompok Data Master.
5. Fitur Ta Switcher: Salah satu keunggulan ZEXAM-CBT adalah fitur TA Switcher cepat di bagian atas navigasi.

✨ FITUR UTAMA & KEUNGGULAN:
- Panduan interaktif visual beresolusi tinggi (60 FPS).
- Navigasi responsif dan ramah pengguna.
- Terintegrasi langsung dengan database sistem.

🌐 Akses Sistem: http://localhost:8000
Jangan lupa Like, Comment, dan Subscribe untuk mendapatkan panduan fitur terbaru lainnya!

#UJIAN #TutorialAplikasi
```
*(Karakter: 1325/5000)*

## 3. Tag Video (Tags / Keywords)
```text
ujian, tutorial ujian, panduan ujian, tutorial aplikasi, panduan sistem, tutorial, proktor, zexam-cbt, pengaturan, sekolah, anti-curang, tahun, ajaran, profil sekolah dan kkm, sensor anti curang dan mode, area berbahaya clear data, manajemen tahun ajaran, fitur ta switcher
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
python .agents/skills/app-tutorial-video/scripts/cli.py youtube-upload --run-dir "D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_090647_7751c0" --privacy private --confirm-upload
```
