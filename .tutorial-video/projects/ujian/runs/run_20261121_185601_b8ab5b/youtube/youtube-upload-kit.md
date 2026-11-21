# YouTube Upload Kit — `ujian`
- **Tanggal Dibuat**: `2026-11-21 11:15:17 UTC`
- **Durasi Video**: `179.38 detik` (Standard Video)
- **File Video**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_185601_b8ab5b\final\final-tutorial-desktop.mp4`
- **Thumbnail**: `D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_185601_b8ab5b\youtube\thumbnail.png`

---

## 1. Judul Video (Title)
```text
Tutorial Proktor ZEXAM-CBT: Monitoring Ujian Real-Time & Kontrol Darurat
```
*(Karakter: 72/100)*

## 2. Deskripsi Video (Description with Timestamps)
```text
Tutorial Proktor ZEXAM-CBT: Monitoring Ujian Real-Time & Kontrol Darurat

Video panduan resmi cara penggunaan fitur pada aplikasi UJIAN. Ikuti langkah-langkah mudah di bawah ini untuk memahami alur penggunaan secara lengkap.

🕒 DAFTAR ISI & TIMESTAMPS:
00:00 - Navigasi Live Monitoring
00:29 - Metrik Statistik Dan Perpanjang Waktu
01:04 - Proktor Broadcast System
01:42 - Tampilan Denah Visual Dan Tabel
02:18 - Kontrol Darurat Proktor

📌 RINGKASAN LANGKAH-LANGKAH:
1. Navigasi Live Monitoring: Halo Bapak dan Ibu Admin serta Proktor ZEXAM-CBT.
2. Metrik Statistik Dan Perpanjang Waktu: Di bagian atas halaman, Anda dapat melihat empat kartu metrik utama: total peserta yang hadir, jumlah siswa yang sedang aktif mengerjakan soal, jumlah peserta yang telah selesai, serta estimasi waktu berakhir ujian.
3. Proktor Broadcast System: Fitur Proktor Broadcast System memungkinkan Anda mengirimkan pesan penting atau peringatan langsung ke layar gawai seluruh siswa secara bersamaan.
4. Tampilan Denah Visual Dan Tabel: ZEXAM-CBT menyediakan dua mode tampilan pemantauan peserta.
5. Kontrol Darurat Proktor: Pada kolom aksi tabel peserta, proktor memiliki tiga kontrol darurat utama: tombol Reset Login untuk mengizinkan siswa masuk kembali saat terjadi ganti perangkat, tombol Reset Progress untuk mengulang ujian dari nol jika terjadi kendala fatal, serta tombol Force Logout untuk mengeluarkan siswa tertentu.

✨ FITUR UTAMA & KEUNGGULAN:
- Panduan interaktif visual beresolusi tinggi (60 FPS).
- Navigasi responsif dan ramah pengguna.
- Terintegrasi langsung dengan database sistem.

🌐 Akses Sistem: http://localhost:8000
Jangan lupa Like, Comment, dan Subscribe untuk mendapatkan panduan fitur terbaru lainnya!

#UJIAN #TutorialAplikasi
```
*(Karakter: 1737/5000)*

## 3. Tag Video (Tags / Keywords)
```text
ujian, tutorial ujian, panduan ujian, tutorial aplikasi, panduan sistem, tutorial, proktor, zexam-cbt, monitoring, real-time, kontrol, darurat, navigasi live monitoring, metrik statistik dan perpanjang waktu, proktor broadcast system, tampilan denah visual dan tabel, kontrol darurat proktor
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
python .agents/skills/app-tutorial-video/scripts/cli.py youtube-upload --run-dir "D:\laragon\www\ujian\.tutorial-video\projects\ujian\runs\run_20261121_185601_b8ab5b" --privacy private --confirm-upload
```
