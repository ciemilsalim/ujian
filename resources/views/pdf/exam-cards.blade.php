<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link rel="icon" href="/images/logo.png" type="image/png" />
    <title>Kartu Login Ujian</title>
    <style>
        @page {
            margin: 0;
            size: 216mm 356mm; /* Legal exactly */
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 8mm 12mm; /* Give enough margin */
            background-color: #fff;
        }

        .main-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 4mm 6mm; /* Space between cards */
            table-layout: fixed;
        }

        .card-cell {
            width: 50%;
            height: 60mm;
            vertical-align: top;
            text-align: center;
        }

        .card {
            width: 90mm;
            height: 56mm;
            margin: 0 auto;
            border: 2px solid #cbd5e1;
            border-radius: 12px;
            overflow: hidden;
            background: #ffffff;
            position: relative;
            box-sizing: border-box;
            text-align: left;
        }

        /* Top Header */
        .header-table {
            width: 100%;
            background-color: #1e1b4b;
            border-bottom: 3px solid #3b82f6;
            border-collapse: collapse;
        }
        
        .header-table td {
            padding: 5px 10px;
            vertical-align: middle;
        }

        .header h3 {
            margin: 0;
            font-size: 9pt;
            font-weight: 900;
            color: #ffffff;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .header p {
            margin: 1px 0 0 0;
            font-size: 5.5pt;
            color: #94a3b8;
            font-weight: bold;
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
        }

        /* Yellow Accent Line below blue */
        .accent-line {
            height: 2px;
            background-color: #facc15;
            width: 35mm;
        }

        /* Main Content */
        .content {
            padding: 8px 10px;
            width: 100%;
            box-sizing: border-box;
        }

        .layout-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .photo-cell {
            width: 20mm;
            vertical-align: top;
        }

        .photo-box {
            width: 18mm;
            height: 24mm;
            border: 2px solid #e2e8f0;
            background-color: #f8fafc;
            border-radius: 8px;
            text-align: center;
            overflow: hidden;
        }

        .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .photo-placeholder {
            font-size: 14pt;
            color: #cbd5e1;
            line-height: 24mm;
            font-weight: bold;
        }

        .info-cell {
            vertical-align: top;
            padding-left: 8px;
        }

        .field {
            margin-bottom: 4px;
            line-height: 1.1;
        }

        .field-label {
            font-size: 5pt;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 900;
            display: block;
            margin-bottom: 2px;
            letter-spacing: 0.5px;
        }

        .field-value {
            font-size: 7.5pt;
            color: #334155;
            font-weight: bold;
            display: block;
        }

        .name-value {
            font-size: 8.5pt;
            font-weight: 900;
            text-transform: uppercase;
            color: #0f172a;
            white-space: nowrap;
            overflow: hidden;
        }

        /* Credentials Section */
        .credentials-wrapper {
            margin-top: 6px;
            width: 85%;
        }

        .credentials-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            overflow: hidden;
        }

        .credentials-table td {
            padding: 4px 6px;
        }

        .credentials-table tr:first-child td {
            border-bottom: 1px dashed #cbd5e1;
        }

        .cred-label {
            font-size: 5pt;
            text-transform: uppercase;
            font-weight: 900;
            color: #475569;
            width: 35%;
            background-color: #f1f5f9;
            border-right: 1px solid #e2e8f0;
        }

        .cred-value {
            font-size: 8.5pt;
            font-weight: 900;
            font-family: 'Courier New', Courier, monospace;
            text-align: center;
            width: 65%;
            letter-spacing: 1px;
        }

        .cred-username { color: #0369a1; }
        .cred-password { color: #be123c; }

        /* Bottom Assets */
        .watermark {
            position: absolute;
            bottom: 5px;
            left: 10px;
            font-size: 5pt;
            color: #94a3b8;
            font-weight: 900;
            letter-spacing: 1px;
        }

        .qr-small {
            position: absolute;
            bottom: 5px;
            right: 5px;
            width: 14mm;
            height: 14mm;
            background-color: #ffffff;
            padding: 1.5mm;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }

        .page-break {
            page-break-after: always;
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
                            <table class="header-table">
                                <tr>
                                    <td style="width: 15%; text-align: center;">
                                        @if(file_exists($logoPath))
                                            <img src="{{ $logoPath }}" style="max-height: 24px; max-width: 40px; object-fit: contain;">
                                        @endif
                                    </td>
                                    <td class="header" style="width: 85%;">
                                        <h3>KARTU PESERTA UJIAN</h3>
                                        <p>{{ strtoupper($schoolName) }}</p>
                                    </td>
                                </tr>
                            </table>
                            <div class="accent-line"></div>
                            
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
                            <div class="watermark">ZEXAM-CBT VERSI 1.0</div>
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