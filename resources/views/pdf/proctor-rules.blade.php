<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Tata Tertib Pengawas Ujian</title>
    <style>
        @page { margin: 2cm; size: A4 portrait; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; line-height: 1.5; color: #333; font-size: 11pt; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .header h2 { margin: 0; text-transform: uppercase; font-size: 14pt; }
        .title { text-align: center; text-transform: uppercase; font-weight: bold; text-decoration: underline; margin-bottom: 20px; }
        ol { margin-left: 20px; }
        li { margin-bottom: 8px; text-align: justify; }
        .footer { margin-top: 50px; width: 100%; }
        .sig-container { text-align: center; width: 250px; float: right; }
        .sig-box { height: 70px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>{{ $settings['school_name'] ?? 'NAMA SEKOLAH' }}</h2>
        <p>{{ $settings['school_address'] ?? 'ALAMAT SEKOLAH' }}</p>
    </div>

    <div class="title">TATA TERTIB PENGAWAS UJIAN BERBASIS KOMPUTER (CBT)</div>

    <div class="content">
        <ol>
            <li>Pengawas ruang hadir di lokasi ujian 30 menit sebelum ujian dimulai.</li>
            <li>Pengawas dilarang membawa alat komunikasi elektronik ke dalam ruang ujian.</li>
            <li>Pengawas memeriksa kebersihan ruang ujian dan memastikan kesiapan perangkat komputer.</li>
            <li>Pengawas mencocokkan identitas peserta dengan kartu peserta ujian.</li>
            <li>Pengawas membagikan token ujian (jika diperlukan) kepada peserta.</li>
            <li>Pengawas dilarang memberikan bantuan dalam menjawab soal kepada peserta.</li>
            <li>Pengawas wajib memantau dashboard proktor untuk mendeteksi peringatan kecurangan sistem.</li>
            <li>Pengawas memberi peringatan kepada peserta yang melakukan pelanggaran tata tertib.</li>
            <li>Pengawas mengisi dan menandatangani Berita Acara Pelaksanaan Ujian.</li>
            <li>Pengawas menyerahkan berkas administrasi setelah seluruh peserta selesai mengerjakan ujian.</li>
        </ol>
    </div>

    <div class="footer">
        <div class="sig-container">
            Ditetapkan di: .......................<br>
            Tanggal: {{ date('d F Y') }}<br>
            Kepala Sekolah,
            <div class="sig-box"></div>
            <strong><u>{{ $settings['principal_name'] ?? '...........................' }}</u></strong><br>
            NIP. {{ $settings['principal_nip'] ?? '...........................' }}
        </div>
    </div>
    <div style="position: fixed; bottom: -0.5cm; left: 0; right: 0; text-align: center; font-size: 8pt; color: #999; border-top: 1px solid #eee; padding-top: 5px;">
        Printed by ZEXAM-CBT V.1.0. | {{ date('d/m/Y H:i') }}
    </div>
</body>
</html>
