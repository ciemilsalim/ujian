<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link rel="icon" href="/images/logo.png" type="image/png" />
    <title>Denah Ruang - {{ $room->name }}</title>
    <style>
        body { font-family: sans-serif; margin: 0; padding: 0; font-size: 12px; }
        .container { padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .school-name { font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
        .room-name { font-size: 22px; font-weight: 900; text-transform: uppercase; }
        .sub-title { font-size: 12px; font-weight: bold; color: #444; margin-top: 5px; letter-spacing: 2px; }
        
        .front-area { text-align: center; margin-bottom: 40px; position: relative; }
        .whiteboard { display: inline-block; border-bottom: 3px solid #ddd; padding: 8px 100px; font-weight: bold; color: #bbb; letter-spacing: 10px; font-size: 14px; margin-bottom: 20px; }
        .desks { margin-top: 10px; }
        .desk { display: inline-block; width: 150px; padding: 12px; background: #333; color: white; border-radius: 10px; font-size: 10px; font-weight: bold; margin: 0 15px; text-transform: uppercase; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .desk-proctor { background: #4f46e5; }
        
        .grid-container { width: 100%; text-align: center; }
        .grid { margin: 0 auto; border-collapse: separate; border-spacing: 10px; }
        .seat { border: 1.5px solid #eee; border-radius: 15px; height: 85px; width: 130px; text-align: center; vertical-align: middle; padding: 8px; background: #fff; }
        .student-name { font-size: 10px; font-weight: 900; text-transform: uppercase; margin-bottom: 4px; overflow: hidden; height: 28px; display: flex; align-items: center; justify-content: center; line-height: 1.2; }
        .classroom-name { font-size: 8px; font-weight: bold; color: #777; text-transform: uppercase; }
        .empty-seat { font-size: 9px; color: #ddd; text-transform: uppercase; font-weight: bold; }
        
        .footer { position: fixed; bottom: 20px; left: 20px; right: 20px; font-size: 9px; color: #999; }
        .footer-left { float: left; }
        .footer-right { float: right; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            @if(isset($settings['institution_name']))
                <div class="school-name">{{ $settings['institution_name'] }}</div>
            @endif
            <div class="room-name">TATA LETAK: {{ $room->name }}</div>
            <div class="sub-title">DENAH TEMPAT DUDUK SISWA</div>
        </div>

        <div class="front-area">
            <div class="whiteboard">PAPAN TULIS</div>
            <div class="desks">
                <div class="desk">MEJA PENGAWAS</div>
                <div class="desk desk-proctor">MEJA PROKTOR</div>
            </div>
        </div>

        @php
            $rows = $room->seating_grid['rows'] ?? 5;
            $cols = $room->seating_grid['cols'] ?? 4;
            $plan = $room->seating_plan ?? [];
        @endphp

        <div class="grid-container">
            <table class="grid">
                @for ($r = 0; $r < $rows; $r++)
                    <tr>
                        @for ($c = 0; $c < $cols; $c++)
                            @php
                                $key = "$r-$c";
                                $studentId = $plan[$key] ?? null;
                                $student = $studentId ? ($students[$studentId] ?? null) : null;
                            @endphp
                            <td class="seat">
                                @if ($student)
                                    <div class="student-name">{{ $student->name }}</div>
                                    <div class="classroom-name">{{ $student->classroom->name ?? '-' }}</div>
                                @else
                                    <div class="empty-seat">KOSONG</div>
                                @endif
                            </td>
                        @endfor
                    </tr>
                @endfor
            </table>
        </div>

        <div class="footer">
            <div class="footer-left">Sistem CBT v2.0</div>
            <div class="footer-right">Dicetak pada: {{ now()->format('d/m/Y H:i') }}</div>
        </div>
    </div>
</body>
</html>
