<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserController
{
    public function index()
    {
        $users = \App\Models\User::with('classroom')->latest()->paginate(10);
        $classrooms = \App\Models\Classroom::all();
        return \Inertia\Inertia::render('Proktor/Users/Index', [
            'users' => $users,
            'classrooms' => $classrooms
        ]);
    }

    public function create()
    {
        $classrooms = \App\Models\Classroom::all();
        return \Inertia\Inertia::render('Proktor/Users/Create', [
            'classrooms' => $classrooms
        ]);
    }

    public function importStudents(Request $request)
    {
        $request->validate([
            'file' => 'required',
        ]);

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();

        try {
            if (in_array($extension, ['xlsx', 'xls'])) {
                \Maatwebsite\Excel\Facades\Excel::import(
                    new \App\Imports\StudentsImport($request->classroom_id),
                    $file
                );
                $message = 'Siswa berhasil diimport dari Excel.';
            } elseif ($extension === 'docx') {
                $service = new \App\Services\StudentWordImportService();
                $count = $service->import($file->getRealPath());
                $message = "Berhasil mengimport {$count} siswa dari Word.";
            } else {
                return redirect()->back()->with('error', 'Format file harus Excel (.xlsx, .xls) atau Word (.docx).');
            }

            return redirect()->route('proktor.users.index')->with('success', $message);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal import: ' . $e->getMessage());
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:proktor,guru,siswa',
            'classroom_id' => 'required_if:role,siswa|nullable|exists:classrooms,id',
        ]);

        \App\Models\User::create([
            'username' => $request->username,
            'name' => $request->name,
            'email' => $request->email,
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
            'role' => $request->role,
            'classroom_id' => $request->classroom_id,
        ]);

        return redirect()->route('proktor.users.index')->with('success', 'User created successfully.');
    }

    public function edit($id)
    {
        $user = \App\Models\User::findOrFail($id);
        $classrooms = \App\Models\Classroom::all();
        return \Inertia\Inertia::render('Proktor/Users/Edit', [
            'user' => $user,
            'classrooms' => $classrooms
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = \App\Models\User::findOrFail($id);
        $request->validate([
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:proktor,guru,siswa',
            'classroom_id' => 'required_if:role,siswa|nullable|exists:classrooms,id',
        ]);

        $data = $request->only('username', 'name', 'email', 'role', 'classroom_id');
        if ($request->filled('password')) {
            $data['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        $user->update($data);

        return redirect()->route('proktor.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy($id)
    {
        $user = \App\Models\User::findOrFail($id);
        $user->delete();

        return redirect()->route('proktor.users.index')->with('success', 'User deleted successfully.');
    }

    public function downloadTemplateExcel()
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        $headers = ['Nama', 'NIS', 'Kelas', 'Email', 'Password'];
        foreach ($headers as $col => $header) {
            $sheet->setCellValueByColumnAndRow($col + 1, 1, $header);
        }

        // Sample Data
        $sheet->setCellValue('A2', 'Andi Siswa');
        $sheet->setCellValue('B2', '123456');
        $sheet->setCellValue('C2', 'X IPA 1');
        $sheet->setCellValue('D2', 'andi@example.com');
        $sheet->setCellValue('E2', 'password123');

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $fileName = 'Template_Import_Siswa.xlsx';
        
        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName);
    }

    public function downloadTemplateWord()
    {
        $phpWord = new \PhpOffice\PhpWord\PhpWord();
        $section = $phpWord->addSection();
        
        $section->addText('TEMPLATE IMPORT SISWA', ['bold' => true, 'size' => 16]);
        $section->addText('Pastikan data berada dalam tabel seperti contoh di bawah ini:', ['italic' => true]);
        $section->addTextBreak(1);
        
        $table = $section->addTable(['borderSize' => 6, 'borderColor' => '000000', 'cellMargin' => 80]);
        $table->addRow();
        $table->addCell(4000)->addText('Nama', ['bold' => true]);
        $table->addCell(2000)->addText('NIS', ['bold' => true]);
        $table->addCell(2000)->addText('Kelas', ['bold' => true]);

        $table->addRow();
        $table->addCell(4000)->addText('Andi Siswa');
        $table->addCell(2000)->addText('123456');
        $table->addCell(2000)->addText('X IPA 1');

        $fileName = 'Template_Import_Siswa.docx';
        $writer = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');

        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName);
    }
}
