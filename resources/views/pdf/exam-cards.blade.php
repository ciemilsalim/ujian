<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link rel="icon" href="/images/logo.png" type="image/png" />
    <title>Kartu Login Ujian</title>
    <style>
        @page {
            margin: 0;
            size: 216mm 356mm; /* Legal */
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #1a1a1a;
            margin: 0;
            padding: 10mm;
            background-color: #fff;
        }

        .main-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 5mm 8mm;
        }

        .card-cell {
            width: 50%;
            vertical-align: top;
        }

        .card {
            width: 100mm;
            height: 65mm;
            margin: 0 auto;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
            background: #ffffff;
            position: relative;
            box-sizing: border-box;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        /* Diagonal Accents */
        .accent-top-left {
            position: absolute;
            top: 0;
            left: 0;
            width: 40mm;
            height: 6mm;
            background-color: #0038a8;
            z-index: 1;
        }

        .accent-top-right {
            position: absolute;
            top: 0;
            right: 0;
            width: 30mm;
            height: 6mm;
            z-index: 1;
        }

        .stripe-light {
            float: right;
            width: 8mm;
            height: 6mm;
            background-color: #3abff8;
            margin-left: 2mm;
        }

        .accent-bottom-right {
            position: absolute;
            bottom: 0;
            right: 0;
            height: 6mm;
            z-index: 1;
        }

        .stripe-dark-bottom {
            float: right;
            width: 15mm;
            height: 6mm;
            background-color: #0038a8;
            margin-left: 2mm;
        }

        .stripe-light-bottom {
            float: right;
            width: 8mm;
            height: 6mm;
            background-color: #3abff8;
            margin-left: 2mm;
        }

        /* Header */
        .header-section {
            padding: 8mm 5mm 2mm 5mm;
            position: relative;
            z-index: 2;
        }

        .logo-box {
            float: left;
            width: 12mm;
            height: 12mm;
            margin-right: 3mm;
        }

        .logo-box img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .title-box {
            float: left;
        }

        .title-box h1 {
            margin: 0;
            font-size: 14pt;
            font-weight: 900;
            color: #000;
            text-transform: uppercase;
            line-height: 1;
        }

        .title-box p {
            margin: 2px 0 0 0;
            font-size: 10pt;
            font-weight: bold;
            color: #444;
            text-transform: uppercase;
        }

        /* Content */
        .content-section {
            padding: 2mm 5mm;
            clear: both;
            z-index: 2;
        }

        .info-table {
            width: 65%;
            float: left;
            border-collapse: collapse;
        }

        .info-table td {
            padding: 2px 0;
            vertical-align: top;
            font-size: 10pt;
        }

        .label {
            width: 22mm;
            color: #1a1a1a;
        }

        .colon {
            width: 3mm;
        }

        .value {
            font-weight: 500;
            color: #000;
        }

        .value-bold {
            font-weight: 900;
        }

        /* Right Side: Photo & QR */
        .media-section {
            width: 30%;
            float: right;
            text-align: center;
        }

        .photo-box {
            width: 20mm;
            height: 24mm;
            border: 2.5px solid #000;
            border-radius: 12px;
            margin: 0 auto 3mm auto;
            overflow: hidden;
            background-color: #f8fafc;
        }

        .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .photo-placeholder {
            line-height: 24mm;
            font-size: 18pt;
            font-weight: bold;
            color: #cbd5e1;
        }

        .qr-box {
            width: 16mm;
            height: 16mm;
            margin: 0 auto;
        }

        .qr-box img {
            width: 100%;
            height: 100%;
        }

        /* Footer */
        .footer-text {
            position: absolute;
            bottom: 2mm;
            left: 5mm;
            font-size: 8pt;
            color: #94a3b8;
            font-weight: bold;
            z-index: 2;
        }

        .page-break {
            page-break-after: always;
        }

        .clear {
            clear: both;
        }
    </style>
</head>
<body>
    @php
        $settings = \App\Models\Setting::pluck('value', 'key')->toArray();
        $logoPath = isset($settings['school_logo']) && $settings['school_logo'] 
            ? public_path($settings['school_logo']) 
            : public_path('images/logo.png');
    @endphp

    <table class="main-table">
        @foreach($students->chunk(2) as $rowGroupIndex => $row)
            <tr>
                @foreach($row as $student)
                    <td class="card-cell">
                        <div class="card">
                            <!-- Top Accents -->
                            <div class="accent-top-left"></div>
                            <div class="accent-top-right">
                                <div class="stripe-light"></div>
                                <div class="stripe-light" style="margin-right: 2mm;"></div>
                            </div>

                            <!-- Header -->
                            <div class="header-section">
                                <div class="logo-box">
                                    @if(file_exists($logoPath))
                                        <img src="{{ $logoPath }}">
                                    @endif
                                </div>
                                <div class="title-box">
                                    <h1>KARTU PESERTA UJIAN</h1>
                                    <p>{{ $schoolName }}</p>
                                </div>
                                <div class="clear"></div>
                            </div>

                            <!-- Content -->
                            <div class="content-section">
                                <div class="info-table">
                                    <table style="width: 100%;">
                                        <tr>
                                            <td class="label">Nama</td>
                                            <td class="colon">:</td>
                                            <td class="value">{{ $student->name }}</td>
                                        </tr>
                                        <tr>
                                            <td class="label">Kelas</td>
                                            <td class="colon">:</td>
                                            <td class="value">{{ $classroom->name }}</td>
                                        </tr>
                                        <tr>
                                            <td class="label">USERNAME</td>
                                            <td class="colon">:</td>
                                            <td class="value value-bold">{{ $student->username }}</td>
                                        </tr>
                                        <tr>
                                            <td class="label">Password</td>
                                            <td class="colon">:</td>
                                            <td class="value value-bold">{{ $student->password_plain ?? $student->username }}</td>
                                        </tr>
                                    </table>
                                </div>

                                <div class="media-section">
                                    <div class="photo-box">
                                        @if($student->photo)
                                            <img src="{{ public_path('storage/' . $student->photo) }}">
                                        @else
                                            <div class="photo-placeholder">{{ substr($student->name, 0, 1) }}</div>
                                        @endif
                                    </div>
                                    <div class="qr-box">
                                        <img src="data:image/svg+xml;base64, {!! base64_encode(QrCode::format('svg')->size(60)->margin(0)->generate($student->username)) !!}">
                                    </div>
                                </div>
                                <div class="clear"></div>
                            </div>

                            <!-- Bottom Accents -->
                            <div class="accent-bottom-right">
                                <div class="stripe-dark-bottom"></div>
                                <div class="stripe-light-bottom"></div>
                                <div class="stripe-light-bottom"></div>
                            </div>

                            <div class="footer-text">zexam-cbt v.1.0</div>
                        </div>
                    </td>
                @endforeach
                @if($row->count() == 1)
                    <td class="card-cell"></td>
                @endif
            </tr>
            @if (($rowGroupIndex + 1) % 4 == 0 && !$loop->last)
                </table>
                <div class="page-break"></div>
                <table class="main-table">
            @endif
        @endforeach
    </table>
</body>
</html>