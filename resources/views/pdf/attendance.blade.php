<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Daftar Hadir - {{ $session->name }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h2 {
            margin: 0;
        }

        .header p {
            margin: 5px 0;
            color: #555;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        th,
        td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f0f0f0;
            font-size: 11px;
        }

        .signature-area {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }

        .sign-box {
            width: 45%;
            text-align: center;
        }

        .sign-line {
            margin-top: 60px;
            border-bottom: 1px solid #333;
        }
    </style>
</head>

<body>
    <div class="header">
        <h2>DAFTAR HADIR PESERTA UJIAN</h2>
        <p><strong>{{ $session->exam->title ?? 'Ujian' }}</strong></p>
        <p>Sesi: {{ $session->name }} | Kelas: {{ $session->classroom->name ?? '-' }}</p>
        <p>Tanggal: {{ \Carbon\Carbon::parse($session->start_time)->format('d F Y') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width:5%; text-align:center;">No</th>
                <th style="width:30%;">Nama Siswa</th>
                <th style="width:15%;">Username</th>
                <th style="width:15%;">Kelas</th>
                <th style="width:20%; text-align:center;">Tanda Tangan</th>
                <th style="width:15%; text-align:center;">Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($session->examUsers as $i => $eu)
                <tr>
                    <td style="text-align:center;">{{ $i + 1 }}</td>
                    <td>{{ $eu->user->name ?? '-' }}</td>
                    <td>{{ $eu->user->username ?? '-' }}</td>
                    <td>{{ $eu->user->classroom->name ?? '-' }}</td>
                    <td style="height:35px;"></td>
                    <td></td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div style="margin-top:50px; float:right; text-align:center; width:200px;">
        <p>Proktor/Pengawas,</p>
        <br><br><br>
        <p style="border-top:1px solid #333; padding-top:5px;">(_________________)</p>
    </div>
</body>

</html>