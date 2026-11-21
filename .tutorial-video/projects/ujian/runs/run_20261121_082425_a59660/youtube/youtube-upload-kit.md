# YouTube Upload Kit — `ujian`
- **Tanggal Dibuat**: `2026-11-21 00:44:53 UTC`
- **Durasi Video**: `133.12 detik` (YouTube Shorts)
- **File Video**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_082425_a59660\final\final-tutorial-mobile.mp4`
- **Thumbnail**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_082425_a59660\youtube\thumbnail.png`

---

## 1. Judul Video (Title)
```text
Tutorial Pembuatan Soal Benar Salah — ZEXAM-CBT #Shorts
```
*(Karakter: 55/100)*

## 2. Deskripsi Video (Description with Timestamps)
```text
Tutorial Pembuatan Soal Benar Salah — ZEXAM-CBT

Video panduan resmi cara penggunaan fitur pada aplikasi UJIAN. Ikuti langkah-langkah mudah di bawah ini untuk memahami alur penggunaan secara lengkap.

🕒 DAFTAR ISI & TIMESTAMPS:
00:00 - Buka Bank Soal
00:21 - Pilih Tipe Soal
00:43 - Isi Soal Dan Pernyataan
01:35 - Simpan Soal
01:54 - Verifikasi Dan Penutup

📌 RINGKASAN LANGKAH-LANGKAH:
1. Buka Bank Soal: Halo Bapak dan Ibu Guru serta Rekan-Rekan Administrator Proktor, selamat datang di panduan aplikasi ZEXAM-CBT.
2. Pilih Tipe Soal: Sekarang kita berada di halaman detail bank soal.
3. Isi Soal Dan Pernyataan: Ketikkan stimulus atau petunjuk pertanyaan pada kolom utama.
4. Simpan Soal: Bagus, seluruh pernyataan dan kunci jawaban sudah terisi dengan lengkap.
5. Verifikasi Dan Penutup: Soal pernyataan benar dan salah telah berhasil tersimpan dengan rapi.

✨ FITUR UTAMA & KEUNGGULAN:
- Panduan interaktif visual beresolusi tinggi (60 FPS).
- Navigasi responsif dan ramah pengguna.
- Terintegrasi langsung dengan database sistem.

🌐 Akses Sistem: http://localhost:8000
Jangan lupa Like, Comment, dan Subscribe untuk mendapatkan panduan fitur terbaru lainnya!

#Shorts #UJIAN #TutorialAplikasi
```
*(Karakter: 1199/5000)*

## 3. Tag Video (Tags / Keywords)
```text
ujian, tutorial ujian, panduan ujian, tutorial aplikasi, panduan sistem, tutorial, pembuatan, soal, benar, salah, zexam-cbt, buka bank soal, pilih tipe soal, isi soal dan pernyataan, simpan soal, verifikasi dan penutup
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
python .agents/skills/app-tutorial-video/scripts/cli.py youtube-upload --run-dir "D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_082425_a59660" --privacy private --confirm-upload
```
