<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Tata Tertib Peserta Ujian</title>
    <style>
        @page { margin: 2cm; size: A4 portrait; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; line-height: 1.5; color: #333; font-size: 11pt; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .header h2 { margin: 0; text-transform: uppercase; font-size: 14pt; }
        .title { text-align: center; text-transform: uppercase; font-weight: bold; text-decoration: underline; margin-bottom: 20px; }
        ol { margin-left: 20px; }
        li { margin-bottom: 8px; text-align: justify; }
        .footer { margin-top: 50px; width: 100%; }
        .footer td { width: 60%; }
        .sig-container { text-align: center; width: 250px; float: right; }
        .sig-box { height: 70px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>{{ $settings['school_name'] ?? 'NAMA SEKOLAH' }}</h2>
        <p>{{ $settings['school_address'] ?? 'ALAMAT SEKOLAH' }}</p>
    </div>

    <div class="title">TATA TERTIB PESERTA UJIAN BERBASIS KOMPUTER (CBT)</div>

    <div class="content">
        <ol>
            <li>Peserta ujian memasuki ruangan setelah tanda masuk dibunyikan, yakni 15 (lima belas) menit sebelum ujian dimulai.</li>
            <li>Peserta ujian dilarang membawa alat komunikasi elektronik dan alat bantu lainnya ke dalam ruangan ujian.</li>
            <li>Peserta ujian wajib membawa kartu peserta ujian dan menempati tempat duduk yang telah ditentukan.</li>
            <li>Peserta ujian dilarang membuka tab baru, jendela lain, atau aplikasi selain browser ujian.</li>
            <li>Peserta ujian dilarang bekerja sama, menyontek, atau memberikan bantuan kepada peserta lain.</li>
            <li>Setiap kecurangan yang terdeteksi oleh sistem akan dicatat dan dapat mengakibatkan diskualifikasi otomatis.</li>
            <li>Peserta yang terlambat hanya boleh mengikuti ujian setelah mendapat izin dari Ketua Panitia/Pengawas.</li>
            <li>Peserta dilarang meninggalkan ruangan ujian sebelum waktu ujian berakhir tanpa izin pengawas.</li>
            <li>Selama ujian berlangsung, peserta wajib menjaga ketenangan dan ketertiban.</li>
            <li>Setelah selesai, peserta wajib melakukan logout dan meninggalkan ruangan dengan tenang.</li>
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
