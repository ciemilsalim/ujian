# YouTube Upload Kit — `ujian`
- **Tanggal Dibuat**: `2026-11-21 08:52:29 UTC`
- **Durasi Video**: `130.95 detik` (YouTube Shorts)
- **File Video**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_163808_bef388\final\final-tutorial-mobile.mp4`
- **Thumbnail**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_163808_bef388\youtube\thumbnail.png`

---

## 1. Judul Video (Title)
```text
Tutorial Fitur Anti-Curang ZEXAM-CBT: Sensor Pelanggaran & Diskualifikasi — ZEXAM-CBT #Shorts
```
*(Karakter: 93/100)*

## 2. Deskripsi Video (Description with Timestamps)
```text
Tutorial Fitur Anti-Curang ZEXAM-CBT: Sensor Pelanggaran & Diskualifikasi — ZEXAM-CBT

Video panduan resmi cara penggunaan fitur pada aplikasi UJIAN. Ikuti langkah-langkah mudah di bawah ini untuk memahami alur penggunaan secara lengkap.

🕒 DAFTAR ISI & TIMESTAMPS:
00:00 - Pengenalan Keamanan
00:22 - Deteksi Salin Soal Peringatan 1
00:48 - Akumulasi Pelanggaran Realtime
01:09 - Batas Toleransi Dan Diskualifikasi
01:38 - Lembar Selesai Dan Integritas

📌 RINGKASAN LANGKAH-LANGKAH:
1. Pengenalan Keamanan: Halo Rekan-Rekan Siswa Peserta Ujian, selamat datang di panduan sistem keamanan anti-curang pada aplikasi ZEXAM-CBT versi mobile.
2. Deteksi Salin Soal Peringatan 1: Sistem secara otomatis memblokir segala bentuk penyalinan naskah ujian.
3. Akumulasi Pelanggaran Realtime: Setiap peringatan yang Anda terima dicatat secara permanen di server dan disiarkan secara langsung ke layar pemantauan pengawas atau proktor ruangan.
4. Batas Toleransi Dan Diskualifikasi: Perlu diingat bahwa sistem memiliki batas toleransi maksimal peringatan, yaitu tiga kali pelanggaran.
5. Lembar Selesai Dan Integritas: Pada halaman akhir, status ujian akan tercatat sebagai Sesi Terhenti dengan nilai akhir diskualifikasi, disertai rekam jejak pelanggaran yang tidak dapat diubah.

✨ FITUR UTAMA & KEUNGGULAN:
- Panduan interaktif visual beresolusi tinggi (60 FPS).
- Navigasi responsif dan ramah pengguna.
- Terintegrasi langsung dengan database sistem.

🌐 Akses Sistem: http://localhost:8000
Jangan lupa Like, Comment, dan Subscribe untuk mendapatkan panduan fitur terbaru lainnya!

#Shorts #UJIAN #TutorialAplikasi
```
*(Karakter: 1604/5000)*

## 3. Tag Video (Tags / Keywords)
```text
ujian, tutorial ujian, panduan ujian, tutorial aplikasi, panduan sistem, tutorial, fitur, anti-curang, zexam-cbt, sensor, pelanggaran, diskualifikasi, pengenalan keamanan, deteksi salin soal peringatan 1, akumulasi pelanggaran realtime, batas toleransi dan diskualifikasi, lembar selesai dan integritas
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
python .agents/skills/app-tutorial-video/scripts/cli.py youtube-upload --run-dir "D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_163808_bef388" --privacy private --confirm-upload
```
