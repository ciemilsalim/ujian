<!DOCTYPE html>
<html>

<head>
    <title>Hasil Ujian - {{ $session->name }}</title>
    <style>
        body {
            font-family: sans-serif;
            color: #333;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #444;
            padding-bottom: 10px;
        }

        .school-name {
            font-size: 24px;
            font-bold: bold;
            text-transform: uppercase;
        }

        .session-info {
            margin-bottom: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }

        th {
            bg-color: #f5f5f5;
        }

        .footer {
            margin-top: 50px;
            text-align: right;
        }

        .status-finished {
            color: green;
            font-weight: bold;
        }

        .status-working {
            color: orange;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="header">
        <div class="school-name">{{ config('app.name', 'EXXAM.IO') }}</div>
        <div>LAPORAN HASIL UJIAN</div>
    </div>

    <div class="session-info">
        <p><strong>Nama Sesi:</strong> {{ $session->name }}</p>
        <p><strong>Mata Pelajaran:</strong> {{ $session->exam->title }}</p>
        <p><strong>Kelas:</strong> {{ $session->classroom->name ?? '-' }}</p>
        <p><strong>Waktu:</strong> {{ $session->start_time }} - {{ $session->end_time }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Siswa</th>
                <th>Status</th>
                <th>Nilai</th>
            </tr>
        </thead>
        <tbody>
            @foreach($session->examUsers as $index => $eu)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $eu->user->name }}</td>
                    <td>
                        <span class="status-{{ $eu->status }}">
                            {{ strtoupper($eu->status) }}
                        </span>
                    </td>
                    <td style="font-weight: bold; font-size: 16px;">
                        {{ $eu->score ?? '0' }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Dicetak pada: {{ date('d/m/Y H:i:s') }}</p>
        <br><br><br>
        <p>( __________________________ )</p>
        <p>Proktor / Panitia</p>
    </div>
</body>

</html>