<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Daftar Hadir Pengawas - {{ $session->name }}</title>
    <style>
        @page {
            margin: 1cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11pt;
            color: #333;
            line-height: 1.4;
        }

        .kop-surat {
            border-bottom: 3px double #000;
            padding-bottom: 5px;
            margin-bottom: 20px;
            text-align: center;
        }

        .kop-surat h1 {
            font-size: 16pt;
            margin: 0;
            text-transform: uppercase;
        }

        .kop-surat p {
            font-size: 10pt;
            margin: 2px 0;
        }

        .title {
            text-align: center;
            font-weight: bold;
            font-size: 14pt;
            margin-bottom: 20px;
            text-decoration: underline;
        }

        .meta-table {
            width: 100%;
            margin-bottom: 20px;
        }

        .meta-table td {
            vertical-align: top;
            padding: 2px 0;
        }

        .label {
            width: 120px;
        }

        .separator {
            width: 15px;
            text-align: center;
        }

        table.main-table {
            width: 100%;
            border-collapse: collapse;
        }

        table.main-table th,
        table.main-table td {
            border: 1px solid #000;
            padding: 10px 5px;
        }

        table.main-table th {
            background-color: #f2f2f2;
            text-transform: uppercase;
            font-size: 9pt;
        }

        .text-center {
            text-align: center;
        }

        .footer {
            margin-top: 30px;
            width: 100%;
        }

        .signature-box {
            text-align: center;
            padding-top: 10px;
        }

        .name-line {
            margin-top: 70px;
            font-weight: bold;
            text-decoration: underline;
        }
    </style>
</head>

<body>
    <table style="width: 100%; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px;">
        <tr>
            <td style="width: 15%; text-align: left; vertical-align: middle;">
                @if(isset($settings['school_logo']) && $settings['school_logo'])
                    <img src="{{ public_path($settings['school_logo']) }}" style="max-height: 80px; max-width: 100px; object-fit: contain;">
                @endif
            </td>
            <td style="width: 70%; text-align: center; vertical-align: middle;">
                <h1 style="font-size: 16pt; margin: 0; text-transform: uppercase;">{{ $settings['school_name'] ?? 'INSTANSI PENDIDIKAN' }}</h1>
                <p style="font-size: 10pt; margin: 5px 0;">{{ $settings['school_address'] ?? '-' }}</p>
            </td>
            <td style="width: 15%;"></td>
        </tr>
    </table>

    <div class="title">DAFTAR HADIR PENGAWAS UJIAN</div>

    <table class="meta-table">
        <tr>
            <td class="label">Mata Pelajaran</td>
            <td class="separator">:</td>
            <td><strong>{{ $session->exam->title ?? '-' }}</strong></td>
            
            <td class="label" style="padding-left: 40px;">Sesi</td>
            <td class="separator">:</td>
            <td>{{ $session->name }}</td>
        </tr>
        <tr>
            <td class="label">Hari, Tanggal</td>
            <td class="separator">:</td>
            <td>{{ \Carbon\Carbon::parse($session->start_time)->translatedFormat('l, d F Y') }}</td>
            
            <td class="label" style="padding-left: 40px;">Waktu</td>
            <td class="separator">:</td>
            <td>{{ \Carbon\Carbon::parse($session->start_time)->format('H:i') }} - {{ \Carbon\Carbon::parse($session->end_time)->format('H:i') }} WIB</td>
        </tr>
    </table>

    <table class="main-table">
        <thead>
            <tr>
                <th width="5%">No</th>
                <th>Nama Pengawas</th>
                <th width="20%">Ruang</th>
                <th width="25%">Tanda Tangan</th>
                <th width="15%">Ket</th>
            </tr>
        </thead>
        <tbody>
            @php $no = 1; @endphp
            @foreach ($roomProctors as $roomId => $proctors)
                @foreach ($proctors as $p)
                    <tr>
                        <td class="text-center">{{ $no++ }}</td>
                        <td>{{ $p->proctor->name }}</td>
                        <td class="text-center">{{ $p->room->name ?? 'Semua Ruang' }}</td>
                        <td style="height: 40px;">
                             <span style="color: #ccc; font-size: 8pt;">{{ $no - 1 }}. ......................</span>
                        </td>
                        <td></td>
                    </tr>
                @endforeach
            @endforeach
        </tbody>
    </table>

    <table class="footer">
        <tr>
            <td class="signature-box" style="width: 60%"></td>
            <td class="signature-box">
                <p>Buol, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
                <p>Ketua Panitia,</p>
                <div class="name-line">( ___________________________ )</div>
            </td>
        </tr>
    </table>

    <div style="position: fixed; bottom: -0.5cm; left: 0; right: 0; text-align: center; font-size: 8pt; color: #999; border-top: 1px solid #eee; padding-top: 5px;">
        Printed by ZEXAM-CBT V.1.0. | {{ date('d/m/Y H:i') }}
    </div>
</body>

</html>
