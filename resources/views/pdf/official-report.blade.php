<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Berita Acara Ujian</title>
    <style>
        @page { margin: 2cm; size: A4 portrait; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; font-size: 11pt; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .header h2 { margin: 0; text-transform: uppercase; font-size: 14pt; }
        .header p { margin: 5px 0; font-size: 10pt; }
        .title { text-align: center; text-transform: uppercase; font-weight: bold; text-decoration: underline; margin-bottom: 20px; font-size: 12pt; }
        .content { margin-bottom: 30px; }
        .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .details-table td { padding: 5px; vertical-align: top; }
        .details-table .label { width: 180px; }
        .details-table .dots { border-bottom: 1px dotted #000; flex-grow: 1; }
        .signature-table { width: 100%; margin-top: 50px; }
        .signature-table td { width: 50%; text-align: center; vertical-align: top; }
        .sig-box { height: 80px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>{{ $settings['school_name'] ?? 'NAMA SEKOLAH' }}</h2>
        <p>{{ $settings['school_address'] ?? 'ALAMAT SEKOLAH' }}</p>
    </div>

    <div class="title">BERITA ACARA PELAKSANAAN UJIAN</div>

    <div class="content">
        <p>Pada hari ini <strong>{{ date('d-m-Y') }}</strong>, telah diselenggarakan ujian dengan rincian sebagai berikut:</p>
        
        <table class="details-table">
            <tr>
                <td class="label">Mata Pelajaran</td>
                <td>: {{ $session->exam->title ?? $session->name }}</td>
            </tr>
            <tr>
                <td class="label">Kelas</td>
                <td>: {{ $session->classroom->name ?? 'Semua Kelas' }}</td>
            </tr>
            @if(isset($room))
            <tr>
                <td class="label">Ruang</td>
                <td>: {{ $room->name }}</td>
            </tr>
            @endif
            <tr>
                <td class="label">Waktu Mulai</td>
                <td>: {{ $session->start_time->format('H:i') }} WIB</td>
            </tr>
            <tr>
                <td class="label">Waktu Selesai</td>
                <td>: {{ $session->end_time->format('H:i') }} WIB</td>
            </tr>
            <tr>
                <td class="label">Jumlah Peserta Seharusnya</td>
                <td>: {{ $session->examUsers->count() }} Orang</td>
            </tr>
            <tr>
                <td class="label">Jumlah Peserta Hadir</td>
                <td>: ........... Orang</td>
            </tr>
            <tr>
                <td class="label">Jumlah Peserta Tidak Hadir</td>
                <td>: ........... Orang</td>
            </tr>
            <tr>
                <td class="label">Catatan Pelaksanaan</td>
                <td>: ........................................................................................................</td>
            </tr>
        </table>

        <p>Demikian Berita Acara ini dibuat dengan sesungguhnya untuk dapat dipergunakan sebagaimana mestinya.</p>
    </div>

    <table class="signature-table">
        <tr>
            <td>
                Mengetahui,<br>
                Kepala Sekolah
                <div class="sig-box"></div>
                <strong>{{ $settings['principal_name'] ?? '...........................' }}</strong><br>
                NIP. {{ $settings['principal_nip'] ?? '...........................' }}
            </td>
            <td>
                <br>
                Pengawas Ujian
                <div class="sig-box"></div>
                <strong>{{ $proctor_name }}</strong><br>
                NIP. {{ $proctor_nip }}
            </td>
        </tr>
    </table>
    <div style="position: fixed; bottom: -0.5cm; left: 0; right: 0; text-align: center; font-size: 8pt; color: #999; border-top: 1px solid #eee; padding-top: 5px;">
        Printed by ZEXAM-CBT V.1.0. | {{ date('d/m/Y H:i') }}
    </div>
</body>
</html>
