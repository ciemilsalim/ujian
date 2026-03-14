<!DOCTYPE html>
<html>

<head>
    <title>Kartu Login Ujian</title>
    <style>
        body {
            font-family: sans-serif;
        }

        .grid-container {
            width: 100%;
        }

        .card {
            width: 48%;
            /* Adjust for 2 columns */
            display: inline-block;
            margin-bottom: 20px;
            border: 2px solid #333;
            padding: 15px;
            box-sizing: border-box;
            border-radius: 8px;
            vertical-align: top;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 10px;
        }

        .header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: bold;
        }

        .header p {
            margin: 2px 0;
            font-size: 12px;
        }

        .content table {
            width: 100%;
            font-size: 14px;
        }

        .content table td {
            padding: 4px 0;
            vertical-align: top;
        }

        .content table td:first-child {
            width: 80px;
            font-weight: bold;
        }

        .qr-code {
            text-align: center;
            margin-top: 15px;
        }

        .qr-code img {
            width: 80px;
            height: 80px;
        }

        .footer {
            margin-top: 10px;
            text-align: center;
            font-size: 10px;
            font-style: italic;
        }

        /* 5px gap adjustment logic using nth-child */
        .card:nth-child(odd) {
            margin-right: 2%;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>

<body>

    <div class="grid-container">
        @foreach($students as $index => $student)
            <div class="card">
                <div class="header">
                    <h3>KARTU LOGIN UJIAN</h3>
                    <p>{{ $schoolName }}</p>
                    <p>{{ $schoolAddress }}</p>
                </div>
                <div class="content" style="display:flex;">
                    @if($student->photo)
                        <div style="width:80px; margin-right:10px; flex-shrink:0;">
                            <img src="{{ public_path('storage/' . $student->photo) }}"
                                style="width:70px; height:90px; object-fit:cover; border:1px solid #ccc;">
                        </div>
                    @endif
                    <table>
                        <tr>
                            <td>Nama</td>
                            <td>: {{ $student->name }}</td>
                        </tr>
                        <tr>
                            <td>Username</td>
                            <td>: {{ $student->username }}</td>
                        </tr>
                        <tr>
                            <td>Kelas</td>
                            <td>: {{ $classroom->name }}</td>
                        </tr>
                        <tr>
                            <td>Password</td>
                            <td>: <b>*** (Hubungi Proktor)</b></td>
                        </tr>
                    </table>
                </div>
                <div class="qr-code">
                    <img
                        src="data:image/svg+xml;base64, {!! base64_encode(QrCode::format('svg')->size(100)->generate($student->username)) !!} ">
                </div>
            </div>

            {{-- 1 page = 8 cards (4 rows, 2 columns) --}}
            @if (($index + 1) % 8 == 0)
                </div>
                <div class="page-break"></div>
                <div class="grid-container">
            @endif
        @endforeach
    </div>

</body>

</html>