<?php

namespace App\Services;

use App\Models\User;
use App\Models\Classroom;
use Illuminate\Support\Facades\Hash;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Element\Table;
use PhpOffice\PhpWord\Element\TextRun;
use PhpOffice\PhpWord\Element\Text;

class StudentWordImportService
{
    protected $classrooms;

    public function __construct()
    {
        $this->classrooms = Classroom::all()->pluck('id', 'name')->mapWithKeys(function ($id, $name) {
            return [strtolower(trim($name)) => $id];
        });
    }

    public function import($filePath)
    {
        $phpWord = IOFactory::load($filePath);
        $students = [];

        foreach ($phpWord->getSections() as $section) {
            foreach ($section->getElements() as $element) {
                if ($element instanceof Table) {
                    $this->processTable($element, $students);
                }
            }
        }

        $count = 0;
        foreach ($students as $data) {
            if (empty($data['name']) || empty($data['nis'])) continue;

            // Cek duplikat NIS (username)
            if (User::where('username', $data['nis'])->exists()) continue;

            $className = strtolower(trim($data['kelas'] ?? ''));
            $classroomId = $this->classrooms[$className] ?? null;

            User::create([
                'username' => $data['nis'],
                'name' => $data['name'],
                'password' => Hash::make($data['password'] ?? 'siswa123'),
                'role' => 'siswa',
                'classroom_id' => $classroomId,
            ]);
            $count++;
        }

        return $count;
    }

    protected function processTable($table, &$students)
    {
        $rows = $table->getRows();
        
        // Asumsi baris 1 adalah header, atau minimal 3 kolom (Nama, NIS, Kelas)
        foreach ($rows as $index => $row) {
            if ($index === 0) continue; // Skip header

            $cells = $row->getCells();
            if (count($cells) < 2) continue;

            $data = [
                'name' => $this->getCellText($cells[0]),
                'nis' => $this->getCellText($cells[1]),
                'kelas' => isset($cells[2]) ? $this->getCellText($cells[2]) : '',
            ];

            if (!empty($data['name']) && !empty($data['nis'])) {
                $students[] = $data;
            }
        }
    }

    protected function getCellText($cell)
    {
        $text = '';
        foreach ($cell->getElements() as $element) {
            if ($element instanceof TextRun) {
                foreach ($element->getElements() as $child) {
                    if ($child instanceof Text) {
                        $text .= $child->getText();
                    }
                }
            } elseif ($element instanceof Text) {
                $text .= $element->getText();
            }
        }
        return trim($text);
    }
}
