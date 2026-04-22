<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Daftar Hadir - {{ $session->name }}</title>
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

        /* Kop Surat */
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

        /* Metadata Table */
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

        /* Main Table */
        table.main-table {
            width: 100%;
            border-collapse: collapse;
        }

        table.main-table th,
        table.main-table td {
            border: 1px solid #000;
            padding: 8px 5px;
        }

        table.main-table th {
            background-color: #f2f2f2;
            text-transform: uppercase;
            font-size: 9pt;
        }

        .text-center {
            text-align: center;
        }

        /* Signature Columns */
        .sign-col {
            position: relative;
            height: 45px;
            font-size: 8pt;
            vertical-align: top;
            padding: 5px !important;
        }

        .sign-placeholder {
            position: absolute;
            bottom: 5px;
            left: 5px;
            border-bottom: 1px dotted #999;
            width: 80%;
        }

        /* Footer */
        .footer {
            margin-top: 30px;
            width: 100%;
        }

        .footer td {
            width: 50%;
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
    <!-- Kop Surat -->
    <table style="width: 100%; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px;">
        <tr>
            <td style="width: 15%; text-align: left; vertical-align: middle;">
                @if(isset($settings['school_logo']) && $settings['school_logo'])
                    <img src="{{ public_path($settings['school_logo']) }}" style="max-height: 80px; max-width: 100px; object-fit: contain;">
                @endif
            </td>
            <td style="width: 70%; text-align: center; vertical-align: middle;">
                <h1 style="font-size: 16pt; margin: 0; text-transform: uppercase;">{{ $settings['school_name'] ?? 'INSTANSI PENDIDIKAN' }}</h1>
                <p style="font-size: 10pt; margin: 5px 0;">{{ $settings['school_address'] ?? 'Alamat instansi belum dikonfigurasi di menu pengaturan proktor.' }}</p>
            </td>
            <td style="width: 15%;"></td>
        </tr>
    </table>

    <div class="title">DAFTAR HADIR PESERTA UJIAN</div>

    <!-- Info Sesi -->
    <table class="meta-table">
        <tr>
            <td class="label">Mata Pelajaran</td>
            <td class="separator">:</td>
            <td><strong>{{ $session->exam->title ?? '-' }}</strong></td>
            
            <td class="label" style="padding-left: 40px;">Sesi / Ruang</td>
            <td class="separator">:</td>
            <td>{{ $session->name }} / {{ $room->name ?? ($session->classroom->name ?? '-') }}</td>
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

    <!-- Tabel Utama -->
    <table class="main-table">
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="15%">NIS</th>
                <th>Nama Peserta</th>
                <th width="12%">Kelas</th>
                <th width="25%">Tanda Tangan</th>
                <th width="12%">Ket</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($session->examUsers as $index => $eu)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-center">{{ $eu->user->username ?? '-' }}</td>
                    <td>{{ $eu->user->name ?? '-' }}</td>
                    <td class="text-center">{{ $eu->user->classroom->name ?? ($session->classroom->name ?? '-') }}</td>
                    <td class="sign-col">
                        <span style="color: #ccc;">{{ $index + 1 }}.</span>
                        @if($index % 2 == 0)
                            <div style="margin-left: 10px; margin-top: 5px;">..........................</div>
                        @else
                            <div style="margin-left: 50px; margin-top: 5px;">..........................</div>
                        @endif
                    </td>
                    <td></td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Footer / Tanda Tangan -->
    <table class="footer">
        <tr>
            <td class="signature-box">
                <p>Mengetahui,</p>
                <p>Kepala Sekolah,</p>
                <div class="name-line">{{ $settings['principal_name'] ?? '...........................' }}</div>
                <p style="font-size: 9pt; margin-top: 5px;">NIP. {{ $settings['principal_nip'] ?? '...........................' }}</p>
            </td>
            <td class="signature-box">
                <p>Buol, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
                <p>Pengawas,</p>
                @if(isset($proctors) && count($proctors) > 0)
                    @foreach($proctors as $p)
                        <div class="name-line">{{ $p->proctor->name }}</div>
                        <p style="font-size: 8pt; margin-top: 2px;">NIS/NIP: {{ $p->proctor->nip ?? '-' }}</p>
                    @endforeach
                @else
                    <div class="name-line">( ___________________________ )</div>
                    <p style="font-size: 9pt; margin-top: 5px;">NIP. ...........................</p>
                @endif
            </td>
        </tr>
    </table>

    <div style="position: fixed; bottom: -0.5cm; left: 0; right: 0; text-align: center; font-size: 8pt; color: #999; border-top: 1px solid #eee; padding-top: 5px;">
        Printed by ZEXAM-CBT V.1.0. | {{ date('d/m/Y H:i') }}
    </div>
</body>

</html>