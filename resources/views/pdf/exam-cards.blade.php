<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Kartu Login Ujian</title>
    <style>
        @page {
            margin: 0;
            size: A4 portrait;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 5mm;
            background-color: #fff;
        }

        .main-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .card-cell {
            width: 50%;
            height: 57.4mm; /* ~ 287mm / 5 rows */
            vertical-align: top;
            padding: 2mm; 
            box-sizing: border-box;
        }

        .card {
            width: 90mm;
            height: 55mm;
            border: 1px solid #cbd5e1;
            border-radius: 8px; /* sharp enough for ID, not too round */
            overflow: hidden;
            background-color: #ffffff;
            position: relative;
            box-sizing: border-box;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* very subtle box shadow */
        }

        .card-inner {
            padding: 0;
            height: 100%;
            position: relative;
        }

        /* Modern Corporate Header */
        .header {
            background-color: #1e1b4b; /* dark navy/indigo */
            position: relative;
            padding: 6px 12px;
            border-bottom: 2px solid #3b82f6; /* energetic blue accent */
        }

        .header::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 35%;
            height: 2px;
            background-color: #facc15; /* energetic yellow accent line */
        }

        .header h3 {
            margin: 0;
            font-size: 8.5pt;
            font-weight: 800;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .header p {
            margin: 1px 0 0 0;
            font-size: 5pt;
            color: #cbd5e1;
            font-weight: 600;
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            letter-spacing: 0.5px;
        }

        .content {
            padding: 8px 10px;
            display: block;
            width: 100%;
        }

        .layout-table {
            width: 100%;
            border-collapse: collapse;
        }

        .photo-cell {
            width: 22mm;
            vertical-align: top;
            padding-right: 10px;
        }

        .photo-box {
            width: 20mm;
            height: 26mm;
            border: 2px solid #f1f5f9;
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
            line-height: 26mm;
            font-weight: bold;
        }

        .info-cell {
            vertical-align: top;
        }

        .field {
            margin-bottom: 4px;
        }

        .field-label {
            font-size: 5pt;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 800;
            letter-spacing: 0.5px;
            display: block;
            margin-bottom: 2px;
        }

        .field-value {
            font-size: 7.5pt;
            color: #334155;
            font-weight: 700;
            display: block;
            line-height: 1.1;
        }

        .name-value {
            font-size: 8.5pt;
            font-weight: 900;
            text-transform: uppercase;
            color: #0f172a;
        }

        /* Credentials Section */
        .credentials-wrapper {
            margin-top: 6px;
            width: 85%; /* Make it not reach the QR code */
        }

        .credentials-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
        }

        .credentials-table td {
            padding: 3px 5px;
        }

        .credentials-table tr:first-child td {
            border-bottom: 1px dashed #cbd5e1; /* dashed separator */
        }

        .cred-label {
            font-size: 5pt;
            text-transform: uppercase;
            font-weight: 800;
            color: #64748b;
            width: 40%;
            vertical-align: middle;
        }

        .cred-value {
            font-size: 8pt;
            font-weight: 800;
            font-family: 'Courier New', Courier, monospace;
            text-align: right;
            width: 60%;
            vertical-align: middle;
        }

        .cred-username {
            color: #0284c7; /* deep sky blue */
        }

        .cred-password {
            color: #e11d48; /* rose */
        }

        .watermark {
            position: absolute;
            bottom: 6px;
            left: 10px;
            font-size: 5.5pt;
            color: #94a3b8;
            font-weight: 900;
            letter-spacing: 1px;
            opacity: 0.8;
        }

        .qr-small {
            position: absolute;
            bottom: 6px;
            right: 8px;
            width: 14mm;
            height: 14mm;
            background-color: #ffffff;
            padding: 1.5mm;
            border-radius: 4px;
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
                            <div class="card-inner">
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
                                                <div class="field" style="margin-bottom: 0;">
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
                                    <img src="data:image/svg+xml;base64, {!! base64_encode(QrCode::format('svg')->size(55)->margin(0)->generate($student->username)) !!}" style="width: 100%; height: 100%;">
                                </div>
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