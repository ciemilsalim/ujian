<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $guarded = ['id'];
    protected $casts = ['options' => 'array'];

    public function questionBank()
    {
        return $this->belongsTo(QuestionBank::class);
    }

    protected function setAnswerKeyAttribute($value)
    {
        $this->attributes['answer_key'] = str_replace(' ', '', strtolower(trim($value)));
    }

    /**
     * Normalize various human-written answer key formats for benar_salah into canonical JSON.
     * Supports:
     * - JSON: '{"a":"benar","b":"salah"}' or '{"أ":"صحيح"}'
     * - Key-Value (Latin & Arabic): 'A: Benar, B: Salah', 'A: B, B: S', 'أ: صحيح, ب: خطأ', 'a=benar; b=salah'
     * - Positional: 'Benar, Salah', 'B, S, B', 'صحيح, خطأ', '1, 0, 1', '١, ٠, ١', 'true, false'
     * - Arabic comma: '،' (U+060C) & Arabic semicolon: '؛' (U+061B)
     */
    public static function normalizeBenarSalahKey($rawKey, array $options = []): string
    {
        if (is_array($rawKey)) {
            $normalized = [];
            foreach ($rawKey as $k => $v) {
                $cleanK = self::normalizeOptionKey((string) $k);
                $normalized[$cleanK] = self::normalizeTrueFalseValue((string) $v);
            }
            return json_encode($normalized);
        }

        $trimmed = trim((string)$rawKey);
        if (empty($trimmed)) {
            return '{"a":"benar"}';
        }

        // 1. If already valid JSON mapping
        if (str_starts_with($trimmed, '{') && str_ends_with($trimmed, '}')) {
            $decoded = json_decode($trimmed, true);
            if (is_array($decoded) && !empty($decoded)) {
                $normalized = [];
                foreach ($decoded as $k => $v) {
                    $cleanK = self::normalizeOptionKey((string) $k);
                    $cleanV = self::normalizeTrueFalseValue((string) $v);
                    $normalized[$cleanK] = $cleanV;
                }
                return json_encode($normalized);
            }
        }

        // Normalize separators: replace semicolons, newlines, pipes, Arabic commas and Arabic semicolons with commas
        $cleanKey = str_replace(["\r\n", "\r", "\n", ';', '|', '،', '؛'], ',', $trimmed);

        // Split into items
        $items = array_values(array_filter(array_map('trim', explode(',', $cleanKey)), function ($item) {
            return $item !== '';
        }));

        $optKeys = !empty($options) ? array_keys($options) : ['a', 'b', 'c', 'd', 'e'];
        $ansMap = [];

        foreach ($items as $idx => $item) {
            $delim = null;
            if (str_contains($item, ':') || str_contains($item, '：')) {
                $delim = str_contains($item, ':') ? ':' : '：';
            } elseif (str_contains($item, '=')) {
                $delim = '=';
            } elseif (preg_match('/^([a-eA-E]|[أاإآبجدوههـ])\s*[-–—]\s*/u', $item)) {
                $delim = '-';
                if (str_contains($item, '–')) $delim = '–';
                if (str_contains($item, '—')) $delim = '—';
            }

            if ($delim !== null) {
                [$k, $v] = explode($delim, $item, 2);
                $cleanK = self::normalizeOptionKey($k);
                $cleanV = self::normalizeTrueFalseValue($v);
                $ansMap[$cleanK] = $cleanV;
            } else {
                // Positional match to option key by index
                $rawK = $optKeys[$idx] ?? chr(97 + $idx);
                $cleanK = self::normalizeOptionKey($rawK);
                $cleanV = self::normalizeTrueFalseValue($item);
                $ansMap[$cleanK] = $cleanV;
            }
        }

        return !empty($ansMap) ? json_encode($ansMap) : '{"a":"benar"}';
    }

    /**
     * Map Latin and Arabic option letters into standard 'a', 'b', 'c', 'd', 'e'
     */
    public static function normalizeOptionKey(string $key): string
    {
        $k = mb_strtolower(trim($key), 'UTF-8');
        $arabicMap = [
            'أ' => 'a', 'ا' => 'a', 'إ' => 'a', 'آ' => 'a',
            'ب' => 'b',
            'ج' => 'c',
            'د' => 'd',
            'ه' => 'e', 'هـ' => 'e', 'و' => 'e',
        ];
        return $arabicMap[$k] ?? $k;
    }

    /**
     * Determine whether an input value represents True/Benar or False/Salah.
     * Supports Indonesian, English, Arabic, and binary numbers.
     */
    public static function normalizeTrueFalseValue(string $val): string
    {
        $v = mb_strtolower(trim($val), 'UTF-8');
        $trueValues = [
            'b', 'benar', 'true', 't', '1', '١',
            'ص', 'صح', 'صحيح', 'حق', 'نعم',
        ];
        return in_array($v, $trueValues, true) ? 'benar' : 'salah';
    }
}
