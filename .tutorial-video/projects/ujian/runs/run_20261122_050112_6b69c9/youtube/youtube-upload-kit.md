# YouTube Upload Kit — `ujian`
- **Tanggal Dibuat**: `2026-11-21 21:19:31 UTC`
- **Durasi Video**: `171.43 detik` (Standard Video)
- **File Video**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_050112_6b69c9\final\final-tutorial-desktop.mp4`
- **Thumbnail**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_050112_6b69c9\youtube\thumbnail.png`

---

## 1. Judul Video (Title)
```text
Tutorial Guru ZEXAM-CBT: Cara Import Soal Pilihan Ganda via Template Excel
```
*(Karakter: 74/100)*

## 2. Deskripsi Video (Description with Timestamps)
```text
Tutorial Guru ZEXAM-CBT: Cara Import Soal Pilihan Ganda via Template Excel

Video panduan resmi cara penggunaan fitur pada aplikasi UJIAN. Ikuti langkah-langkah mudah di bawah ini untuk memahami alur penggunaan secara lengkap.

🕒 DAFTAR ISI & TIMESTAMPS:
00:00 - Navigasi Bank Soal
00:30 - Unduh Template Resmi Excel
00:59 - Panduan Struktur Kolom Excel
01:25 - Ketentuan Kolom Pertanyaan Dan Kunci
01:55 - Eksekusi Import Excel Dan Progress
02:18 - Tinjau Hasil Soal Pilihan Ganda

📌 RINGKASAN LANGKAH-LANGKAH:
1. Navigasi Bank Soal: Halo Bapak dan Ibu Guru serta Tim Pengajar ZEXAM-CBT.
2. Unduh Template Resmi Excel: Sebelum menyusun naskah soal, pastikan Anda menggunakan template resmi sistem.
3. Panduan Struktur Kolom Excel: Untuk memastikan naskah kita sesuai standar, kita dapat memeriksa panduan format yang disediakan di dalam aplikasi.
4. Ketentuan Kolom Pertanyaan Dan Kunci: Perhatikan kolom-kolom utama pada lembar kerja Excel: kolom Pertanyaan memuat teks stimulus soal; kolom Tipe diisi pilihan ganda atau pg; kolom Opsi A sampai Opsi E memuat pilihan ganda yang disajikan; kolom Kunci diisi dengan huruf jawaban benar dari A sampai E; dan kolom Skor menentukan bobot nilai masing-masing butir soal.
5. Eksekusi Import Excel Dan Progress: Sekarang kita jalankan proses import.
6. Tinjau Hasil Soal Pilihan Ganda: Luar biasa! Seluruh butir soal pilihan ganda telah berhasil diimpor ke dalam bank soal.

✨ FITUR UTAMA & KEUNGGULAN:
- Panduan interaktif visual beresolusi tinggi (60 FPS).
- Navigasi responsif dan ramah pengguna.
- Terintegrasi langsung dengan database sistem.

🌐 Akses Sistem: http://localhost:8000
Jangan lupa Like, Comment, dan Subscribe untuk mendapatkan panduan fitur terbaru lainnya!

#UJIAN #TutorialAplikasi
```
*(Karakter: 1746/5000)*

## 3. Tag Video (Tags / Keywords)
```text
ujian, tutorial ujian, panduan ujian, tutorial aplikasi, panduan sistem, tutorial, guru, zexam-cbt, import, soal, pilihan, ganda, via, template, excel, navigasi bank soal, unduh template resmi excel, panduan struktur kolom excel, ketentuan kolom pertanyaan dan kunci, eksekusi import excel dan progress, tinjau hasil soal pilihan ganda
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
python .agents/skills/app-tutorial-video/scripts/cli.py youtube-upload --run-dir "D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261122_050112_6b69c9" --privacy private --confirm-upload
```
