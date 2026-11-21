<?php

use App\Models\User;
use App\Models\Subject;
use App\Models\QuestionBank;
use App\Models\Question;
use App\Models\Classroom;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;

beforeEach(function () {
    $this->classroom = Classroom::create(['name' => 'Kelas Test Import', 'description' => 'Test']);
    $this->guru = User::create([
        'username' => 'guruimport',
        'name' => 'Guru Import',
        'email' => 'guruimport@test.com',
        'password' => bcrypt('password'),
        'role' => 'guru',
    ]);

    $subject = Subject::create(['name' => 'Informatika', 'code' => 'INF-TEST']);
    $this->qb = QuestionBank::create([
        'subject_id' => $subject->id,
        'user_id' => $this->guru->id,
        'name' => 'Bank Soal Import Benar Salah',
    ]);
});

it('normalizes various human-written benar salah answer keys correctly', function () {
    // 1. Standard key-value format
    $key1 = Question::normalizeBenarSalahKey('A: Benar, B: Salah');
    expect(json_decode($key1, true))->toBe(['a' => 'benar', 'b' => 'salah']);

    // 2. Shorthand B / S key-value
    $key2 = Question::normalizeBenarSalahKey('A: B, B: S, C: B');
    expect(json_decode($key2, true))->toBe(['a' => 'benar', 'b' => 'salah', 'c' => 'benar']);

    // 3. Semicolon and equal sign separators
    $key3 = Question::normalizeBenarSalahKey('a=b; b=s; c=b');
    expect(json_decode($key3, true))->toBe(['a' => 'benar', 'b' => 'salah', 'c' => 'benar']);

    // 4. Positional words without option letters
    $key4 = Question::normalizeBenarSalahKey('Benar, Salah, Benar', ['a' => 'Opt 1', 'b' => 'Opt 2', 'c' => 'Opt 3']);
    expect(json_decode($key4, true))->toBe(['a' => 'benar', 'b' => 'salah', 'c' => 'benar']);

    // 5. Positional shorthand B, S
    $key5 = Question::normalizeBenarSalahKey('B, S', ['a' => 'Opt 1', 'b' => 'Opt 2']);
    expect(json_decode($key5, true))->toBe(['a' => 'benar', 'b' => 'salah']);

    // 6. JSON passthrough and validation
    $key6 = Question::normalizeBenarSalahKey('{"a":"benar","b":"salah"}');
    expect(json_decode($key6, true))->toBe(['a' => 'benar', 'b' => 'salah']);

    // 7. Numeric 1 / 0
    $key7 = Question::normalizeBenarSalahKey('A: 1, B: 0');
    expect(json_decode($key7, true))->toBe(['a' => 'benar', 'b' => 'salah']);

    // 8. Empty input fallback
    $key8 = Question::normalizeBenarSalahKey('');
    expect(json_decode($key8, true))->toBe(['a' => 'benar']);
});

it('can download the excel template with benar salah question sample', function () {
    $response = $this->actingAs($this->guru)->get(route('guru.question-banks.template-excel'));

    $response->assertStatus(200);
    expect($response->headers->get('content-disposition'))->toContain('Template_Import_Soal.xlsx');
});

it('can download the word template with benar salah question sample', function () {
    $response = $this->actingAs($this->guru)->get(route('guru.question-banks.template-word'));

    $response->assertStatus(200);
    expect($response->headers->get('content-disposition'))->toContain('Template_Import_Soal.docx');
});

it('can import benar salah questions from excel spreadsheet', function () {
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    $headers = ['pertanyaan', 'tipe', 'opsi_a', 'opsi_b', 'opsi_c', 'opsi_d', 'opsi_e', 'kunci', 'skor'];
    foreach ($headers as $col => $header) {
        $sheet->setCellValueByColumnAndRow($col + 1, 1, $header);
    }

    // Row 2: Explicit benar_salah with A: Benar, B: Salah
    $sheet->setCellValue('A2', 'Pernyataan Sains 1:');
    $sheet->setCellValue('B2', 'benar_salah');
    $sheet->setCellValue('C2', 'Matahari adalah bintang');
    $sheet->setCellValue('D2', 'Bumi adalah pusat tata surya');
    $sheet->setCellValue('H2', 'A: Benar, B: Salah');
    $sheet->setCellValue('I2', '5');

    // Row 3: Alias 'bs' with positional shorthand 'B, S, B'
    $sheet->setCellValue('A3', 'Pernyataan Biologi 2:');
    $sheet->setCellValue('B3', 'bs');
    $sheet->setCellValue('C3', 'Tumbuhan berfotosintesis');
    $sheet->setCellValue('D3', 'Jamur berklorofil');
    $sheet->setCellValue('E3', 'Ikan bernapas dengan insang');
    $sheet->setCellValue('H3', 'B, S, B');
    $sheet->setCellValue('I3', '10');

    // Row 4: Auto-detect from Kunci even if tipe is empty
    $sheet->setCellValue('A4', 'Pernyataan Fisika 3:');
    $sheet->setCellValue('B4', '');
    $sheet->setCellValue('C4', 'Kecepatan cahaya lebih cepat dari suara');
    $sheet->setCellValue('D4', 'Massa jenis air adalah 100 g/cm3');
    $sheet->setCellValue('H4', 'A: Benar, B: Salah');
    $sheet->setCellValue('I4', '2');

    $tempPath = tempnam(sys_get_temp_dir(), 'test_excel_') . '.xlsx';
    $writer = new Xlsx($spreadsheet);
    $writer->save($tempPath);

    $uploadedFile = new UploadedFile($tempPath, 'soal_bs.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);

    $response = $this->actingAs($this->guru)->post(route('guru.question-banks.import-excel', $this->qb->id), [
        'file' => $uploadedFile,
    ]);

    $response->assertSessionHas('success');

    $questions = Question::where('question_bank_id', $this->qb->id)->get();
    expect($questions)->toHaveCount(3);

    // Verify Question 1
    $q1 = $questions->where('question_text', 'Pernyataan Sains 1:')->first();
    expect($q1)->not->toBeNull();
    expect($q1->type)->toBe('benar_salah');
    expect($q1->options)->toBe([
        'a' => 'Matahari adalah bintang',
        'b' => 'Bumi adalah pusat tata surya',
    ]);
    expect(json_decode($q1->answer_key, true))->toBe([
        'a' => 'benar',
        'b' => 'salah',
    ]);
    expect($q1->score_default)->toBe(5);

    // Verify Question 2
    $q2 = $questions->where('question_text', 'Pernyataan Biologi 2:')->first();
    expect($q2)->not->toBeNull();
    expect($q2->type)->toBe('benar_salah');
    expect(json_decode($q2->answer_key, true))->toBe([
        'a' => 'benar',
        'b' => 'salah',
        'c' => 'benar',
    ]);
    expect($q2->score_default)->toBe(10);

    // Verify Question 3 (Auto-detected)
    $q3 = $questions->where('question_text', 'Pernyataan Fisika 3:')->first();
    expect($q3)->not->toBeNull();
    expect($q3->type)->toBe('benar_salah');
    expect(json_decode($q3->answer_key, true))->toBe([
        'a' => 'benar',
        'b' => 'salah',
    ]);

    @unlink($tempPath);
});

it('can import benar salah questions from word document', function () {
    $phpWord = new PhpWord();
    $section = $phpWord->addSection();

    // Question 1: Explicit Tipe: Benar Salah
    $section->addText('1. Tentukan apakah pernyataan berikut Benar atau Salah:');
    $section->addText('Tipe: Benar Salah');
    $section->addText('A. RAM bersifat volatile');
    $section->addText('B. ROM kehilangan data saat listrik padam');
    $section->addText('C. CPU adalah pemroses instruksi');
    $section->addText('Kunci: A: Benar, B: Salah, C: Benar');
    $section->addTextBreak(1);

    // Question 2: Auto-detect from Kunci with shorthand B, S
    $section->addText('2. Periksa pernyataan logika berikut:');
    $section->addText('A. 2 + 2 = 4');
    $section->addText('B. 5 > 10');
    $section->addText('Kunci: A: B, B: S');

    $tempPath = tempnam(sys_get_temp_dir(), 'test_word_') . '.docx';
    $writer = IOFactory::createWriter($phpWord, 'Word2007');
    $writer->save($tempPath);

    $uploadedFile = new UploadedFile($tempPath, 'soal_bs.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', null, true);

    $response = $this->actingAs($this->guru)->post(route('guru.question-banks.import-word', $this->qb->id), [
        'file' => $uploadedFile,
    ]);

    $response->assertSessionHas('success');

    $questions = Question::where('question_bank_id', $this->qb->id)->get();
    expect($questions)->toHaveCount(2);

    $q1 = $questions->first();
    expect($q1->type)->toBe('benar_salah');
    expect($q1->options)->toBe([
        'a' => 'RAM bersifat volatile',
        'b' => 'ROM kehilangan data saat listrik padam',
        'c' => 'CPU adalah pemroses instruksi',
    ]);
    expect(json_decode($q1->answer_key, true))->toBe([
        'a' => 'benar',
        'b' => 'salah',
        'c' => 'benar',
    ]);

    $q2 = $questions->last();
    expect($q2->type)->toBe('benar_salah');
    expect(json_decode($q2->answer_key, true))->toBe([
        'a' => 'benar',
        'b' => 'salah',
    ]);

    @unlink($tempPath);
});
