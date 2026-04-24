<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <link rel="icon" href="/images/logo.png" type="image/png" />
    <title>Hasil Ujian - {{ $session->name }}</title>
    <style>
        @page {
            margin: 2cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #1a1a1a;
            line-height: 1.5;
            font-size: 11pt;
        }



        .report-title {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 20px;
            text-transform: uppercase;
        }

        /* Info Section */
        .info-container {
            width: 100%;
            margin-bottom: 20px;
        }

        .info-table {
            width: 100%;
            border: none;
        }

        .info-table td {
            border: none;
            padding: 3px 0;
            vertical-align: top;
        }

        .info-label {
            width: 150px;
            font-weight: bold;
        }

        .info-colon {
            width: 15px;
        }

        /* Main Table */
        table.main-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        table.main-table th {
            background-color: #f2f2f2;
            color: #000;
            font-weight: bold;
            text-align: center;
            padding: 10px;
            border: 1px solid #000;
            text-transform: uppercase;
            font-size: 10pt;
        }

        table.main-table td {
            border: 1px solid #000;
            padding: 8px 10px;
            vertical-align: middle;
        }

        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }

        /* Badge-like styles for PDF */
        .status-finished { color: #059669; }
        .status-working { color: #d97706; }
        .status-disqualified { color: #dc2626; font-weight: bold; }

        /* Footer / Tanda Tangan */
        .footer-sign {
            margin-top: 50px;
            width: 100%;
        }

        .sign-box {
            float: right;
            width: 280px;
            text-align: center;
        }

        .sign-date {
            margin-bottom: 60px;
        }

        .sign-name {
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 2px;
        }

        .sign-nip {
            font-size: 10pt;
        }

        .clear { clear: both; }

        /* QR Code placeholder style */
        .qr-placeholder {
            float: left;
            width: 80px;
            height: 80px;
            border: 1px solid #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8pt;
            color: #999;
            margin-top: 10px;
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
                @else
                    <img src="{{ public_path('images/logo.png') }}" style="max-height: 80px; max-width: 100px; object-fit: contain;">
                @endif
            </td>
            <td style="width: 70%; text-align: center; vertical-align: middle;">
                <h1 style="font-size: 18pt; margin: 0; text-transform: uppercase;">{{ $settings['school_name'] ?? config('app.name') }}</h1>
                <p style="font-size: 10pt; margin: 5px 0;">{{ $settings['school_address'] ?? '-' }}</p>
            </td>
            <td style="width: 15%;"></td>
        </tr>
    </table>

    <div class="report-title">LAPORAN HASIL UJIAN SISWA</div>

    <div class="info-container">
        <table class="info-table">
            <tr>
                <td class="info-label">Nama Sesi</td>
                <td class="info-colon">:</td>
                <td class="font-bold">{{ $session->name }}</td>
            </tr>
            <tr>
                <td class="info-label">Mata Pelajaran</td>
                <td class="info-colon">:</td>
                <td>{{ $session->exam->title }}</td>
            </tr>
            <tr>
                <td class="info-label">Kelas</td>
                <td class="info-colon">:</td>
                <td>{{ $session->classroom->name ?? 'Semua Kelas' }}</td>
            </tr>
            <tr>
                <td class="info-label">Waktu Pelaksanaan</td>
                <td class="info-colon">:</td>
                <td>{{ date('d-m-Y H:i', strtotime($session->start_time)) }} s/d {{ date('H:i', strtotime($session->end_time)) }}</td>
            </tr>
        </table>
    </div>

    <table class="main-table">
        <thead>
            <tr>
                <th width="5%">NO</th>
                <th>NAMA PESERTA</th>
                <th width="15%">STATUS</th>
                <th width="15%">NILAI AKHIR</th>
                <th width="20%">KETERANGAN</th>
            </tr>
        </thead>
        <tbody>
            @php $passingGrade = (int) ($settings['passing_grade'] ?? 70); @endphp
            @foreach($session->examUsers as $index => $eu)
                @php 
                    $isDisqualified = $eu->cheat_warnings >= $maxCheatWarnings;
                    $score = $isDisqualified ? 0 : ($eu->score ?? 0);
                    $isPassed = $score >= $passingGrade && !$isDisqualified;
                @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $eu->user->name }}</td>
                    <td class="text-center">
                        @if($isDisqualified)
                            <span class="status-disqualified">DISKUALIFIKASI</span>
                        @else
                            <span class="status-{{ $eu->status }}">{{ strtoupper($eu->status) }}</span>
                        @endif
                    </td>
                    <td class="text-center font-bold" style="font-size: 13pt;">
                        @if($isDisqualified)
                            <span style="color: #dc2626;">0</span>
                        @else
                            {{ $eu->score ?? '0' }}
                        @endif
                    </td>
                    <td class="text-center font-bold">
                        @if($isDisqualified)
                            <span style="color: #dc2626;">TIDAK LULUS</span>
                        @elseif($eu->status === 'finished')
                            @if($isPassed)
                                <span style="color: #059669;">LULUS</span>
                            @else
                                <span style="color: #dc2626;">TIDAK LULUS</span>
                            @endif
                        @else
                            -
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer-sign">
        <div class="qr-placeholder">
            VALID DOCUMENT
        </div>
        <div class="sign-box">
            <div class="sign-date">
                {{ $settings['location'] ?? 'Dicetak' }}, {{ date('d F Y') }}
            </div>
            <p>Proktor / Panitia Ujian,</p>
            <div class="sign-name">( __________________________ )</div>
            <div class="sign-nip">NIP. ......................................</div>
        </div>
        <div class="clear"></div>
    </div>
    <div style="position: fixed; bottom: -0.5cm; left: 0; right: 0; text-align: center; font-size: 8pt; color: #999; border-top: 1px solid #eee; padding-top: 5px;">
        Printed by ZEXAM-CBT V.1.0. | {{ date('d/m/Y H:i') }}
    </div>
</body>

</html>