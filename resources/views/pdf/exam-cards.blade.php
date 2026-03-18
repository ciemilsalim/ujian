<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Kartu Login Ujian</title>
    <style>
        @page {
            margin: 0.5cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #334155;
            margin: 0;
            padding: 0;
            background-color: #fff;
        }

        .grid-container {
            width: 100%;
        }

        .card-wrapper {
            width: 50%;
            display: inline-block;
            box-sizing: border-box;
            padding: 5px;
            vertical-align: top;
        }

        .card {
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            overflow: hidden;
            background-color: #fff;
        }

        .card-accent {
            height: 4px;
            background-color: #4f46e5;
        }

        .header {
            padding: 10px;
            text-align: center;
            border-bottom: 1px dashed #e2e8f0;
            background-color: #f8fafc;
        }

        .header h3 {
            margin: 0;
            font-size: 13px;
            font-weight: bold;
            color: #1e293b;
            text-transform: uppercase;
        }

        .header p {
            margin: 1px 0;
            font-size: 9px;
            color: #64748b;
        }

        .content-table {
            width: 100%;
            border-collapse: collapse;
        }

        .photo-cell {
            width: 65px;
            padding: 10px;
            vertical-align: top;
        }

        .photo-box {
            width: 60px;
            height: 75px;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            background-color: #f8fafc;
            text-align: center;
            line-height: 75px;
            color: #cbd5e1;
            font-size: 20px;
            font-weight: bold;
            overflow: hidden;
        }

        .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .info-cell {
            padding: 10px 10px 10px 0;
            vertical-align: top;
        }

        .student-details {
            width: 100%;
            border-collapse: collapse;
        }

        .student-details td {
            font-size: 10px;
            padding: 2px 0;
            vertical-align: top;
        }

        .label {
            width: 55px;
            color: #64748b;
            font-weight: normal;
        }

        .value {
            color: #1e293b;
            font-weight: bold;
        }

        .highlight {
            font-family: monospace;
            font-size: 11px;
            color: #4f46e5;
            font-weight: bold;
        }

        .qr-cell {
            width: 55px;
            padding: 10px;
            vertical-align: middle;
            text-align: center;
        }

        .qr-box img {
            width: 45px;
            height: 45px;
        }

        .rules-section {
            background-color: #f8fafc;
            padding: 8px 12px;
            border-top: 1px solid #e2e8f0;
        }

        .rules-title {
            font-size: 8px;
            font-weight: bold;
            color: #475569;
            text-transform: uppercase;
            display: block;
            margin-bottom: 2px;
        }

        .rules-list {
            margin: 0;
            padding: 0;
            list-style: none;
            font-size: 7px;
            color: #64748b;
        }

        .rules-list li {
            margin-bottom: 1px;
        }

        .footer-tag {
            text-align: center;
            font-size: 7px;
            color: #94a3b8;
            padding: 4px 0;
            background-color: #fff;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>

<body>

    <div class="grid-container">
        @foreach($students as $index => $student)
            <div class="card-wrapper">
                <div class="card">
                    <div class="card-accent"></div>
                    <div class="header">
                        <h3>KARTU PESERTA UJIAN</h3>
                        <p><strong>{{ strtoupper($schoolName) }}</strong></p>
                        <p>{{ $schoolAddress }}</p>
                    </div>
                    
                    <table class="content-table">
                        <tr>
                            <td class="photo-cell">
                                <div class="photo-box">
                                    @if($student->photo)
                                        <img src="{{ public_path('storage/' . $student->photo) }}">
                                    @else
                                        {{ substr($student->name, 0, 1) }}
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
                                        <td class="value">: <span class="highlight">{{ $student->username }}</span></td>
                                    </tr>
                                    <tr>
                                        <td class="label">Password</td>
                                        <td class="value">: <span class="highlight text-black" style="color: #000;">{{ $student->password_plain ?? $student->username }}</span></td>
                                    </tr>
                                </table>
                            </td>
                            <td class="qr-cell">
                                <div class="qr-box">
                                    <img src="data:image/svg+xml;base64, {!! base64_encode(QrCode::format('svg')->size(100)->generate($student->username)) !!}">
                                    <div style="font-size: 5px; color: #94a3b8; margin-top: 2px;">SCAN LOGIN</div>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <div class="rules-section">
                        <span class="rules-title">Tata Tertib Peserta:</span>
                        <ul class="rules-list">
                            <li>1. Dilarang membuka tab lain selama ujian berlangsung.</li>
                            <li>2. Jaga kerahasiaan username dan password Anda.</li>
                            <li>3. Laporkan kendala teknis segera kepada pengawas.</li>
                        </ul>
                    </div>
                    
                    <div class="footer-tag">
                        CBT SYSTEM V2.0 • {{ date('d/m/Y H:i') }}
                    </div>
                </div>
            </div>

            @if (($index + 1) % 8 == 0 && !$loop->last)
                <div class="page-break"></div>
            @endif
        @endforeach
    </div>

</body>

</html>