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
            \Maatwebsite\Excel\Facades\Excel::import(
                new \App\Imports\QuestionsImport($id),
                $request->file('file')
            );

            \App\Models\AuditLog::log('imported', 'QuestionBank', $id, null, "Import soal Excel ke bank: {$questionBank->name}");

            return redirect()->back()->with('success', 'Soal berhasil diimport dari Excel.');
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
            $count = $service->import($request->file('file')->getRealPath(), $id);

            \App\Models\AuditLog::log('imported', 'QuestionBank', $id, null, "Import {$count} soal Word ke bank: {$questionBank->name}");

            return redirect()->back()->with('success', "Berhasil mengimport {$count} soal dari Word.");
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

        // Sample Data
        $sheet->setCellValue('A2', 'Contoh pertanyaan pilihan ganda (Bisa masukkan gambar di sini)');
        $sheet->setCellValue('B2', 'pilihan_ganda');
        $sheet->setCellValue('C2', 'Jawaban A');
        $sheet->setCellValue('D2', 'Jawaban B');
        $sheet->setCellValue('E2', 'Jawaban C');
        $sheet->setCellValue('F2', 'Jawaban D');
        $sheet->setCellValue('G2', 'Jawaban E');
        $sheet->setCellValue('H2', 'a');
        $sheet->setCellValue('I2', '1');

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
        
        $section->addText('1. Ini adalah contoh pertanyaan pertama?');
        $section->addText('A. Pilihan jawaban A');
        $section->addText('B. Pilihan jawaban B');
        $section->addText('C. Pilihan jawaban C');
        $section->addText('D. Pilihan jawaban D');
        $section->addText('E. Pilihan jawaban E');
        $section->addText('Kunci: A');
        $section->addTextBreak(1);

        $section->addText('2. Ini adalah contoh pertanyaan essay?');
        $section->addText('Kunci: keyword, kemerdekaan');

        $fileName = 'Template_Import_Soal.docx';
        $writer = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');

        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName);
    }
}
