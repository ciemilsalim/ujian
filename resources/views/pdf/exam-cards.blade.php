<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Kartu Login Ujian</title>
    <style>
        @page {
            margin: 0;
            size: 210mm 297mm; /* A4 exactly */
        }

        body {
            font-family: 'Arial', sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 6mm 10mm; /* 6mm top/bot, 10mm left/right */
            background-color: #fff;
        }

        .main-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .card-cell {
            width: 50%;
            height: 57mm; /* 5 rows = 285mm (max A4 is 297) */
            vertical-align: middle;
            text-align: center;
        }

        .card {
            width: 92mm;
            height: 54mm;
            margin: 0 auto; /* Center horizontally in td */
            border: 1px solid #94a3b8;
            border-radius: 5px;
            overflow: hidden;
            background-color: #ffffff;
            position: relative;
            box-sizing: border-box;
            text-align: left;
        }

        .header {
            background-color: #1e1b4b;
            position: relative;
            padding: 4px 10px;
            border-bottom: 2px solid #3b82f6;
            height: 9mm;
            box-sizing: border-box;
        }

        .header::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 30mm;
            height: 2px;
            background-color: #facc15;
        }

        .header h3 {
            margin: 0;
            font-size: 8pt;
            font-weight: bold;
            color: #ffffff;
            text-transform: uppercase;
        }

        .header p {
            margin: 0;
            font-size: 5pt;
            color: #cbd5e1;
            font-weight: bold;
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
        }

        .content {
            padding: 6px 8px;
            width: 100%;
            box-sizing: border-box;
            height: 45mm;
        }

        .layout-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .photo-cell {
            width: 22mm;
            vertical-align: top;
        }

        .photo-box {
            width: 20mm;
            height: 25mm;
            border: 1px solid #cbd5e1;
            background-color: #f8fafc;
            border-radius: 4px;
            text-align: center;
            overflow: hidden;
        }

        .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .photo-placeholder {
            font-size: 16pt;
            color: #cbd5e1;
            line-height: 25mm;
            font-weight: bold;
        }

        .info-cell {
            vertical-align: top;
            padding-left: 6px;
        }

        .field {
            margin-bottom: 3px;
            line-height: 1;
        }

        .field-label {
            font-size: 5pt;
            color: #64748b;
            text-transform: uppercase;
            font-weight: bold;
            display: block;
            margin-bottom: 1px;
        }

        .field-value {
            font-size: 7.5pt;
            color: #334155;
            font-weight: bold;
            display: block;
        }

        .name-value {
            font-size: 8pt;
            font-weight: 900;
            text-transform: uppercase;
            color: #0f172a;
            white-space: nowrap;
            overflow: hidden;
        }

        .credentials-wrapper {
            margin-top: 4px;
            width: 82%; 
        }

        .credentials-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 3px;
        }

        .credentials-table td {
            padding: 3px 5px;
        }

        .credentials-table tr:first-child td {
            border-bottom: 1px dashed #cbd5e1;
        }

        .cred-label {
            font-size: 5pt;
            text-transform: uppercase;
            font-weight: bold;
            color: #64748b;
            width: 40%;
        }

        .cred-value {
            font-size: 8pt;
            font-weight: bold;
            font-family: 'Courier New', Courier, monospace;
            text-align: right;
            width: 60%;
        }

        .cred-username { color: #0284c7; }
        .cred-password { color: #e11d48; }

        .watermark {
            position: absolute;
            bottom: 4px;
            left: 8px;
            font-size: 5pt;
            color: #94a3b8;
            font-weight: bold;
            opacity: 0.8;
        }

        .qr-small {
            position: absolute;
            bottom: 6px;
            right: 6px;
            width: 14mm;
            height: 14mm;
            background-color: #ffffff;
            padding: 1mm;
            border-radius: 3px;
            border: 1px solid #e2e8f0;
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
                                <h3>KARTU PESERTA UJIAN</h3>
                                <p>{{ strtoupper($schoolName) }}</p>
                            </div>
                            <div class="content">
                                <table class="layout-table">
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
                                            <div class="field">
                                                <span class="field-label">Nama Lengkap</span>
                                                <span class="field-value name-value">{{ $student->name }}</span>
                                            </div>
                                            <div class="field">
                                                <span class="field-label">Kelas / Rombel</span>
                                                <span class="field-value">{{ $classroom->name }}</span>
                                            </div>

                                            <div class="credentials-wrapper">
                                                <table class="credentials-table">
                                                    <tr>
                                                        <td class="cred-label">Username</td>
                                                        <td class="cred-value cred-username">{{ $student->username }}</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="cred-label">Password</td>
                                                        <td class="cred-value cred-password">{{ $student->password_plain ?? $student->username }}</td>
                                                    </tr>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <div class="watermark">ZEXAM-CBT</div>
                            <div class="qr-small">
                                <img src="data:image/svg+xml;base64, {!! base64_encode(QrCode::format('svg')->size(60)->margin(0)->generate($student->username)) !!}" style="width: 100%; height: 100%;">
                            </div>
                        </div>
                    </td>
                @endforeach
                @if($row->count() == 1)
                    <td class="card-cell"></td>
                @endif
            </tr>
            @if (($rowGroupIndex + 1) % 5 == 0 && !$loop->last)
                </table>
                <div class="page-break"></div>
                <table class="main-table">
            @endif
        @endforeach
    </table>
</body>
</html>