# YouTube Upload Kit — `ujian`
- **Tanggal Dibuat**: `2026-11-21 12:15:08 UTC`
- **Durasi Video**: `184.37 detik` (Standard Video)
- **File Video**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_195453_738077\final\final-tutorial-desktop.mp4`
- **Thumbnail**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_195453_738077\youtube\thumbnail.png`

---

## 1. Judul Video (Title)
```text
Tutorial Admin Proktor ZEXAM-CBT: Berkas Administrasi, Kartu Ujian, & Rekap Nilai
```
*(Karakter: 81/100)*

## 2. Deskripsi Video (Description with Timestamps)
```text
Tutorial Admin Proktor ZEXAM-CBT: Berkas Administrasi, Kartu Ujian, & Rekap Nilai

Video panduan resmi cara penggunaan fitur pada aplikasi UJIAN. Ikuti langkah-langkah mudah di bawah ini untuk memahami alur penggunaan secara lengkap.

🕒 DAFTAR ISI & TIMESTAMPS:
00:00 - Administrasi Sesi Dan Dokumen
00:33 - Sinkronisasi Ruang Dan Pengawas
01:02 - Tata Tertib Peserta Dan Pengawas
01:29 - Cetak Kartu Peserta Ujian
01:57 - Rekapitulasi Hasil Dan Ekspor
02:29 - Analisis Hasil Dan Grafik Sebaran

📌 RINGKASAN LANGKAH-LANGKAH:
1. Administrasi Sesi Dan Dokumen: Halo Bapak dan Ibu Admin serta Proktor ZEXAM-CBT.
2. Sinkronisasi Ruang Dan Pengawas: Di dalam jendela sentral administrasi, proktor dapat memilih ruangan dan nama pengawas.
3. Tata Tertib Peserta Dan Pengawas: Selanjutnya, pilih tab Tata Tertib.
4. Cetak Kartu Peserta Ujian: Untuk mencetak kartu ujian seluruh peserta didik, buka tab Kartu Peserta.
5. Rekapitulasi Hasil Dan Ekspor: Setelah sesi ujian selesai dilaksanakan, buka menu Hasil Ujian.
6. Analisis Hasil Dan Grafik Sebaran: Untuk evaluasi mendalam, klik tombol Analisis.

✨ FITUR UTAMA & KEUNGGULAN:
- Panduan interaktif visual beresolusi tinggi (60 FPS).
- Navigasi responsif dan ramah pengguna.
- Terintegrasi langsung dengan database sistem.

🌐 Akses Sistem: http://localhost:8000
Jangan lupa Like, Comment, dan Subscribe untuk mendapatkan panduan fitur terbaru lainnya!

#UJIAN #TutorialAplikasi
```
*(Karakter: 1421/5000)*

## 3. Tag Video (Tags / Keywords)
```text
ujian, tutorial ujian, panduan ujian, tutorial aplikasi, panduan sistem, tutorial, admin, proktor, zexam-cbt, berkas, administrasi, kartu, rekap, nilai, administrasi sesi dan dokumen, sinkronisasi ruang dan pengawas, tata tertib peserta dan pengawas, cetak kartu peserta ujian, rekapitulasi hasil dan ekspor, analisis hasil dan grafik sebaran
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
python .agents/skills/app-tutorial-video/scripts/cli.py youtube-upload --run-dir "D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_195453_738077" --privacy private --confirm-upload
```
