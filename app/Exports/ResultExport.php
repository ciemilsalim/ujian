<?php

namespace App\Exports;

use App\Models\ExamSession;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class ResultExport implements FromCollection, WithHeadings, WithMapping, WithTitle, ShouldAutoSize
{
    protected $session;

    public function __construct(ExamSession $session)
    {
        $this->session = $session;
    }

    public function collection()
    {
        return $this->session->examUsers()->with('user.classroom')->get();
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama Siswa',
            'Username',
            'Kelas',
            'Skor',
            'Status',
            'Waktu Mulai',
            'Waktu Selesai',
        ];
    }

    public function map($examUser): array
    {
        static $no = 0;
        $no++;
        $passingGrade = (int) (\App\Models\Setting::where('key', 'passing_grade')->first()->value ?? 70);

        return [
            $no,
            $examUser->user->name ?? '-',
            $examUser->user->username ?? '-',
            $examUser->user->classroom->name ?? '-',
            $examUser->score ?? '-',
            $examUser->score !== null ? ($examUser->score >= $passingGrade ? 'LULUS' : 'TIDAK LULUS') : 'Belum Dinilai',
            $examUser->started_at ? date('d/m/Y H:i', strtotime($examUser->started_at)) : '-',
            $examUser->finished_at ? date('d/m/Y H:i', strtotime($examUser->finished_at)) : '-',
        ];
    }

    public function title(): string
    {
        return 'Hasil Ujian';
    }
}
