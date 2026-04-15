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
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            background-color: #fff;
            position: relative;
            box-sizing: border-box;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .card-inner {
            padding: 0;
            height: 100%;
            position: relative;
        }

        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
            padding: 8px 12px;
            color: white;
            text-align: center;
            border-bottom: 3px solid #facc15;
        }

        .header h3 {
            margin: 0;
            font-size: 10pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .header p {
            margin: 2px 0 0 0;
            font-size: 7pt;
            opacity: 0.9;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .content {
            padding: 10px;
            display: block;
            width: 100%;
        }

        .layout-table {
            width: 100%;
            border-collapse: collapse;
        }

        .photo-cell {
            width: 20mm;
            vertical-align: top;
            padding-top: 2px;
        }

        .photo-box {
            width: 18mm;
            height: 24mm;
            border: 1.5px solid #e2e8f0;
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
            font-size: 24pt;
            color: #cbd5e1;
            line-height: 24mm;
            font-weight: bold;
        }

        .info-cell {
            padding-left: 10px;
            vertical-align: top;
        }

        .field {
            margin-bottom: 5px;
        }

        .label {
            font-size: 6pt;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 800;
            display: block;
            margin-bottom: 1px;
        }

        .value {
            font-size: 9pt;
            color: #0f172a;
            font-weight: 700;
            display: block;
        }

        .login-box {
            margin-top: 8px;
            background-color: #f1f5f9;
            padding: 6px;
            border-radius: 8px;
            border: 1px dashed #cbd5e1;
        }

        .login-field {
            margin-bottom: 4px;
        }

        .login-label {
            font-size: 5pt;
            color: #475569;
            font-weight: 800;
            text-transform: uppercase;
        }

        .login-value {
            font-size: 10pt;
            color: #4f46e5;
            font-weight: 800;
            font-family: 'Courier New', Courier, monospace;
        }

        .password-value {
            color: #e11d48;
        }

        .watermark {
            position: absolute;
            bottom: 4px;
            right: 8px;
            font-size: 5pt;
            color: #e2e8f0;
            font-weight: 900;
            text-transform: uppercase;
        }

        .qr-small {
            position: absolute;
            bottom: 8px;
            right: 8px;
            width: 12mm;
            height: 12mm;
            opacity: 0.8;
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
                                                    <span class="label">Nama Lengkap</span>
                                                    <span class="value">{{ $student->name }}</span>
                                                </div>
                                                <div class="field">
                                                    <span class="label">Kelas / Rombel</span>
                                                    <span class="value">{{ $classroom->name }}</span>
                                                </div>

                                                <div class="login-box">
                                                    <div class="login-field">
                                                        <span class="login-label">Username</span><br>
                                                        <span class="login-value">{{ $student->username }}</span>
                                                    </div>
                                                    <div class="login-field" style="margin-bottom: 0;">
                                                        <span class="login-label">Password</span><br>
                                                        <span class="login-value password-value">{{ $student->password_plain ?? $student->username }}</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </div>

                                <div class="watermark">ZEXAM-CBT</div>
                                
                                <div class="qr-small">
                                    <img src="data:image/svg+xml;base64, {!! base64_encode(QrCode::format('svg')->size(50)->margin(0)->generate($student->username)) !!}" style="width: 100%; height: 100%;">
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