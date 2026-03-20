<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class QuestionBankController
{
    public function index()
    {
        $questionBanks = \App\Models\QuestionBank::with(['subject', 'user'])
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(10);
        $subjects = \App\Models\Subject::all();
        return \Inertia\Inertia::render('Guru/QuestionBanks/Index', [
            'questionBanks' => $questionBanks,
            'subjects' => $subjects
        ]);
    }

    public function show($id)
    {
        $questionBank = \App\Models\QuestionBank::with(['subject', 'questions'])->findOrFail($id);

        if ($questionBank->user_id !== auth()->id()) {
            abort(403);
        }

        return \Inertia\Inertia::render('Guru/QuestionBanks/Show', [
            'questionBank' => $questionBank
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $qb = \App\Models\QuestionBank::create([
            'subject_id' => $request->subject_id,
            'user_id' => auth()->id(),
            'name' => $request->name,
            'description' => $request->description,
        ]);

        \App\Models\AuditLog::log('created', 'QuestionBank', $qb->id, null, "Membuat bank soal: {$qb->name}");

        return redirect()->back()->with('success', 'Bank soal berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $questionBank = \App\Models\QuestionBank::findOrFail($id);

        if ($questionBank->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $old = $questionBank->toArray();
        $questionBank->update([
            'subject_id' => $request->subject_id,
            'name' => $request->name,
            'description' => $request->description,
        ]);

        \App\Models\AuditLog::log('updated', 'QuestionBank', $questionBank->id, ['old' => $old, 'new' => $questionBank->fresh()->toArray()], "Mengubah bank soal: {$questionBank->name}");

        return redirect()->back()->with('success', 'Bank soal berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $questionBank = \App\Models\QuestionBank::findOrFail($id);

        if ($questionBank->user_id !== auth()->id()) {
            abort(403);
        }

        \App\Models\AuditLog::log('deleted', 'QuestionBank', $questionBank->id, null, "Menghapus bank soal: {$questionBank->name}");
        $questionBank->delete();

        return redirect()->back()->with('success', 'Bank soal berhasil dihapus.');
    }

    public function importExcel(Request $request, $id)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
        ]);

        $questionBank = \App\Models\QuestionBank::findOrFail($id);
        if ($questionBank->user_id !== auth()->id()) {
            abort(403);
        }

        try {
            $import = new \App\Imports\QuestionsImport($id);
            \Maatwebsite\Excel\Facades\Excel::import($import, $request->file('file'));

            \App\Models\AuditLog::log('imported', 'QuestionBank', $id, null, "Import soal Excel ke bank: {$questionBank->name}");

            $msg = "Soal berhasil diiimport: {$import->successCount} berhasil";
            if ($import->errorCount > 0) {
                $msg .= ", {$import->errorCount} gagal (cek format file)";
            }

            return redirect()->back()->with('success', $msg);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal import Excel: ' . $e->getMessage());
        }
    }

    public function importWord(Request $request, $id)
    {
        $request->validate([
            'file' => 'required|mimes:docx',
        ]);

        $questionBank = \App\Models\QuestionBank::findOrFail($id);
        if ($questionBank->user_id !== auth()->id()) {
            abort(403);
        }

        try {
            $service = new \App\Services\WordImportService();
            $result = $service->import($request->file('file')->getRealPath(), $id);

            \App\Models\AuditLog::log('imported', 'QuestionBank', $id, null, "Import {$result['success']} soal Word ke bank: {$questionBank->name}");

            $msg = "Berhasil mengimport {$result['success']} soal dari Word";
            if ($result['failed'] > 0) {
                $msg .= ", {$result['failed']} gagal diuraikan";
            }

            return redirect()->back()->with('success', $msg);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal import Word: ' . $e->getMessage());
        }
    }

    public function downloadTemplateExcel()
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        $headers = ['Pertanyaan', 'Tipe', 'Opsi A', 'Opsi B', 'Opsi C', 'Opsi D', 'Opsi E', 'Kunci', 'Skor'];
        foreach ($headers as $col => $header) {
            $sheet->setCellValueByColumnAndRow($col + 1, 1, $header);
        }

        // Sample Data 1: Pilihan Ganda
        $sheet->setCellValue('A2', 'Apa ibukota Indonesia?');
        $sheet->setCellValue('B2', 'pilihan_ganda');
        $sheet->setCellValue('C2', 'Jakarta');
        $sheet->setCellValue('D2', 'Bandung');
        $sheet->setCellValue('E2', 'Surabaya');
        $sheet->setCellValue('F2', 'Medan');
        $sheet->setCellValue('H2', 'a');
        $sheet->setCellValue('I2', '1');

        // Sample Data 2: PG Kompleks
        $sheet->setCellValue('A3', 'Pilih kota yang ada di pulau Jawa?');
        $sheet->setCellValue('B3', 'pilihan_ganda_kompleks');
        $sheet->setCellValue('C3', 'Jakarta');
        $sheet->setCellValue('D3', 'Bandung');
        $sheet->setCellValue('E3', 'Medan');
        $sheet->setCellValue('F3', 'Makassar');
        $sheet->setCellValue('H3', 'a,b');
        $sheet->setCellValue('I3', '1');

        // Sample Data 3: Isian Singkat
        $sheet->setCellValue('A4', 'Presiden pertama Indonesia adalah...');
        $sheet->setCellValue('B4', 'isian_singkat');
        $sheet->setCellValue('H4', 'Soekarno');
        $sheet->setCellValue('I4', '1');

        // Sample Data 4: Menjodohkan
        $sheet->setCellValue('A5', 'Jodohkan negara dengan ibukotanya?');
        $sheet->setCellValue('B5', 'menjodohkan');
        $sheet->setCellValue('C5', 'Indonesia|Jakarta');
        $sheet->setCellValue('D5', 'Jepang|Tokyo');
        $sheet->setCellValue('E5', 'Inggris|London');
        $sheet->setCellValue('I5', '1');

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $fileName = 'Template_Import_Soal.xlsx';
        
        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName);
    }

    public function downloadTemplateWord()
    {
        $phpWord = new \PhpOffice\PhpWord\PhpWord();
        $section = $phpWord->addSection();
        
        $section->addText('FORMAT IMPORT SOAL WORD', ['bold' => true, 'size' => 16]);
        $section->addTextBreak(1);
        
        $section->addText('1. Contoh Pilihan Ganda biasa?');
        $section->addText('A. Opsi 1');
        $section->addText('B. Opsi 2');
        $section->addText('Kunci: A');
        $section->addTextBreak(1);

        $section->addText('2. Contoh PG Kompleks (Beberapa jawaban benar)?');
        $section->addText('Tipe: PGK');
        $section->addText('A. Jawaban Benar 1');
        $section->addText('B. Jawaban Salah');
        $section->addText('C. Jawaban Benar 2');
        $section->addText('Kunci: A, C');
        $section->addTextBreak(1);

        $section->addText('3. Contoh Soal Isian Singkat?');
        $section->addText('Tipe: Isian');
        $section->addText('Kunci: Jawaban yang Benar');
        $section->addTextBreak(1);

        $section->addText('4. Contoh Menjodohkan?');
        $section->addText('Tipe: Menjodohkan');
        $section->addText('A. Indonesia|Jakarta');
        $section->addText('B. Malaysia|Kuala Lumpur');
        $section->addText('C. Thailand|Bangkok');
        $section->addTextBreak(1);

        $section->addText('5. Contoh Soal Essay?');
        $section->addText('Tipe: Essay');
        $section->addText('Kunci: keyword1, keyword2');

        $fileName = 'Template_Import_Soal.docx';
        $writer = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');

        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName);
    }
}
