# YouTube Upload Kit — `ujian`
- **Tanggal Dibuat**: `2026-11-21 07:21:10 UTC`
- **Durasi Video**: `171.62 detik` (YouTube Shorts)
- **File Video**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_145448_a6f29d\final\final-tutorial-mobile.mp4`
- **Thumbnail**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_145448_a6f29d\youtube\thumbnail.png`

---

## 1. Judul Video (Title)
```text
Tutorial Cara Menjawab Berbagai Tipe Soal CBT & Menyelesaikan Ujian — ZEXAM-CBT #Shorts
```
*(Karakter: 87/100)*

## 2. Deskripsi Video (Description with Timestamps)
```text
Tutorial Cara Menjawab Berbagai Tipe Soal CBT & Menyelesaikan Ujian — ZEXAM-CBT

Video panduan resmi cara penggunaan fitur pada aplikasi UJIAN. Ikuti langkah-langkah mudah di bawah ini untuk memahami alur penggunaan secara lengkap.

🕒 DAFTAR ISI & TIMESTAMPS:
00:00 - Menjawab Pilihan Ganda
00:28 - Menjawab Pilihan Ganda Kompleks
00:58 - Menjawab Benar Salah
01:22 - Menjawab Soal Essay
01:58 - Rekapitulasi Drawer Soal
02:24 - Konfirmasi Dan Selesai Ujian

📌 RINGKASAN LANGKAH-LANGKAH:
1. Menjawab Pilihan Ganda: Halo Rekan-Rekan Siswa Peserta Ujian, selamat datang di panduan cara menjawab berbagai jenis soal pada aplikasi ZEXAM-CBT versi mobile.
2. Menjawab Pilihan Ganda Kompleks: Tipe berikutnya adalah Pilihan Ganda Kompleks.
3. Menjawab Benar Salah: Tipe ketiga adalah soal Pernyataan Benar atau Salah.
4. Menjawab Soal Essay: Tipe keempat adalah soal Uraian atau Essay.
5. Rekapitulasi Drawer Soal: Sebelum menyelesaikan ujian, selalu pastikan seluruh soal telah terjawab.
6. Konfirmasi Dan Selesai Ujian: Pada jendela konfirmasi akhir, periksa kembali jumlah soal yang terselesaikan.

✨ FITUR UTAMA & KEUNGGULAN:
- Panduan interaktif visual beresolusi tinggi (60 FPS).
- Navigasi responsif dan ramah pengguna.
- Terintegrasi langsung dengan database sistem.

🌐 Akses Sistem: http://localhost:8000
Jangan lupa Like, Comment, dan Subscribe untuk mendapatkan panduan fitur terbaru lainnya!

#Shorts #UJIAN #TutorialAplikasi
```
*(Karakter: 1431/5000)*

## 3. Tag Video (Tags / Keywords)
```text
ujian, tutorial ujian, panduan ujian, tutorial aplikasi, panduan sistem, tutorial, menjawab, berbagai, tipe, soal, cbt, menyelesaikan, zexam-cbt, menjawab pilihan ganda, menjawab pilihan ganda kompleks, menjawab benar salah, menjawab soal essay, rekapitulasi drawer soal, konfirmasi dan selesai ujian
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
python .agents/skills/app-tutorial-video/scripts/cli.py youtube-upload --run-dir "D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_145448_a6f29d" --privacy private --confirm-upload
```
