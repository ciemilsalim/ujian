<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Kartu Login Ujian</title>
    <style>
        @page {
            margin: 0.5cm;
            size: A4 portrait;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
            background-color: #fff;
        }

        .main-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .card-cell {
            width: 50%;
            height: 7.1cm; /* Total page height / 4 rows */
            vertical-align: top;
            padding: 3px;
            box-sizing: border-box;
        }

        .card {
            border: 1px solid #94a3b8;
            border-radius: 8px;
            height: 6.9cm; /* Slightly less than cell height */
            overflow: hidden;
            background-color: #fff;
            position: relative;
            box-sizing: border-box;
        }

        .header {
            background-color: #f1f5f9;
            padding: 6px 10px;
            text-align: center;
            border-bottom: 2px solid #4f46e5;
        }

        .header h3 {
            margin: 0;
            font-size: 11px;
            font-weight: 800;
            color: #4f46e5;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .header p {
            margin: 1px 0;
            font-size: 8px;
            color: #64748b;
            font-weight: bold;
        }

        .content-table {
            width: 100%;
            border-collapse: collapse;
        }

        .photo-cell {
            width: 1.8cm;
            padding: 8px;
            vertical-align: top;
        }

        .photo-box {
            width: 1.8cm;
            height: 2.4cm;
            border: 1px solid #cbd5e1;
            background-color: #f8fafc;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .photo-placeholder {
            font-size: 30px;
            color: #e2e8f0;
            line-height: 2.4cm;
            font-weight: bold;
        }

        .info-cell {
            padding: 8px 5px 8px 0;
            vertical-align: top;
        }

        .student-details {
            width: 100%;
            border-collapse: collapse;
        }

        .student-details td {
            font-size: 9px;
            padding: 3px 0;
            vertical-align: top;
        }

        .label {
            width: 50px;
            color: #64748b;
            font-weight: normal;
        }

        .value {
            color: #0f172a;
            font-weight: bold;
        }

        .qr-cell {
            width: 1.6cm;
            padding: 8px;
            vertical-align: middle;
            text-align: center;
        }

        .qr-box img {
            width: 1.4cm;
            height: 1.4cm;
        }

        .qr-label {
            font-size: 5px;
            color: #94a3b8;
            margin-top: 2px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .highlight-box {
            background-color: #f1f5f9;
            padding: 2px 4px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 10px;
            color: #1e293b;
        }

        .rules-section {
            padding: 5px 10px;
            background-color: #f8fafc;
            border-top: 1px dashed #e2e8f0;
            position: absolute;
            bottom: 15px;
            left: 0;
            right: 0;
        }

        .rules-title {
            font-size: 7px;
            font-weight: bold;
            color: #475569;
            display: block;
            margin-bottom: 1px;
        }

        .rules-list {
            margin: 0;
            padding: 0;
            list-style: none;
            font-size: 7px;
            color: #64748b;
        }

        .footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 15px;
            background-color: #4f46e5;
            color: #ffffff;
            font-size: 6px;
            text-align: center;
            line-height: 15px;
            font-weight: bold;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>

<body>

    <table class="main-table">
        @foreach($students->chunk(2) as $rowGroupIndex => $row)
            <tr>
                @foreach($row as $student)
                    <td class="card-cell">
                        <div class="card">
                            <div class="header">
                                <h3>KARTU LOGIN PESERTA</h3>
                                <p>{{ strtoupper($schoolName) }}</p>
                            </div>
                            
                            <table class="content-table">
                                <tr>
                                    <td class="photo-cell">
                                        <div class="photo-box">
                                            @if($student->photo)
                                                <img src="{{ public_path('storage/' . $student->photo) }}">
                                            @else
                                                <div class="photo-placeholder">{{ substr($student->name, 0, 1) }}</div>
                                            @endif
                                        </div>
                                    </td>
                                    <td class="info-cell">
                                        <table class="student-details">
                                            <tr>
                                                <td class="label">Nama</td>
                                                <td class="value">: {{ $student->name }}</td>
                                            </tr>
                                            <tr>
                                                <td class="label">Kelas</td>
                                                <td class="value">: {{ $classroom->name }}</td>
                                            </tr>
                                            <tr>
                                                <td class="label">Username</td>
                                                <td class="value">: <span class="highlight-box">{{ $student->username }}</span></td>
                                            </tr>
                                            <tr>
                                                <td class="label">Password</td>
                                                <td class="value">: <span class="highlight-box">{{ $student->password_plain ?? $student->username }}</span></td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td class="qr-cell">
                                        <div class="qr-box">
                                            <img src="data:image/svg+xml;base64, {!! base64_encode(QrCode::format('svg')->size(100)->errorCorrection('H')->generate($student->username)) !!}">
                                            <div class="qr-label">SCAN LOGIN</div>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <div class="rules-section">
                                <span class="rules-title">CATATAN:</span>
                                <ul class="rules-list">
                                    <li>• Login ke: <strong>{{ request()->getSchemeAndHttpHost() }}</strong></li>
                                    <li>• Dilarang membuka tab lain / aplikasi lain.</li>
                                </ul>
                            </div>
                            
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

    <div style="position: fixed; bottom: -0.5cm; left: 0; right: 0; text-align: center; font-size: 7pt; color: #999; text-transform: uppercase;">
        Printed by ZEXAM-CBT V.1.0. | {{ date('d/m/Y H:i') }}
    </div>
</body>
</html>