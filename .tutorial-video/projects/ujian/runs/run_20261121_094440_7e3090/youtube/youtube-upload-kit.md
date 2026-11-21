# YouTube Upload Kit — `ujian`
- **Tanggal Dibuat**: `2026-11-21 01:57:28 UTC`
- **Durasi Video**: `150.43 detik` (Standard Video)
- **File Video**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_094440_7e3090\final\final-tutorial-desktop.mp4`
- **Thumbnail**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_094440_7e3090\youtube\thumbnail.png`

---

## 1. Judul Video (Title)
```text
Tutorial Import Soal Benar Salah — ZEXAM-CBT
```
*(Karakter: 44/100)*

## 2. Deskripsi Video (Description with Timestamps)
```text
Tutorial Import Soal Benar Salah — ZEXAM-CBT

Video panduan resmi cara penggunaan fitur pada aplikasi UJIAN. Ikuti langkah-langkah mudah di bawah ini untuk memahami alur penggunaan secara lengkap.

🕒 DAFTAR ISI & TIMESTAMPS:
00:00 - Buka Bank Soal
00:24 - Unduh Template
00:51 - Panduan Import
01:17 - Tutup Panduan Dan Eksekusi
01:40 - Pilih Menu Import
02:05 - Tinjau Hasil Soal

📌 RINGKASAN LANGKAH-LANGKAH:
1. Buka Bank Soal: Halo Bapak dan Ibu Guru serta Rekan-Rekan Administrator Proktor, selamat datang di panduan aplikasi ZEXAM-CBT.
2. Unduh Template: Langkah pertama sebelum menyusun soal, kita dapat mengunduh format template resmi yang telah disediakan oleh sistem.
3. Panduan Import: Untuk memastikan susunan naskah kita terbaca sempurna oleh mesin pengurai, kita dapat memeriksa panduan format import.
4. Tutup Panduan Dan Eksekusi: Perhatikan bahwa sistem sangat toleran terhadap format kunci jawaban.
5. Pilih Menu Import: Sekarang menu import telah terbuka kembali.
6. Tinjau Hasil Soal: Seluruh butir soal pernyataan benar salah yang diimpor akan langsung tersimpan rapi pada bank soal.

✨ FITUR UTAMA & KEUNGGULAN:
- Panduan interaktif visual beresolusi tinggi (60 FPS).
- Navigasi responsif dan ramah pengguna.
- Terintegrasi langsung dengan database sistem.

🌐 Akses Sistem: http://localhost:8000
Jangan lupa Like, Comment, dan Subscribe untuk mendapatkan panduan fitur terbaru lainnya!

#UJIAN #TutorialAplikasi
```
*(Karakter: 1432/5000)*

## 3. Tag Video (Tags / Keywords)
```text
ujian, tutorial ujian, panduan ujian, tutorial aplikasi, panduan sistem, tutorial, import, soal, benar, salah, zexam-cbt, buka bank soal, unduh template, panduan import, tutup panduan dan eksekusi, pilih menu import, tinjau hasil soal
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
python .agents/skills/app-tutorial-video/scripts/cli.py youtube-upload --run-dir "D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_094440_7e3090" --privacy private --confirm-upload
```
