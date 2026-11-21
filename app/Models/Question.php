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
     * - JSON: '{"a":"benar","b":"salah"}'
     * - Key-Value: 'A: Benar, B: Salah', 'A: B, B: S', 'a=benar; b=salah'
     * - Positional: 'Benar, Salah', 'B, S, B', '1, 0, 1', 'true, false'
     */
    public static function normalizeBenarSalahKey($rawKey, array $options = []): string
    {
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
                    $cleanK = strtolower(trim((string)$k));
                    $cleanV = in_array(strtolower(trim((string)$v)), ['b', 'benar', 'true', '1']) ? 'benar' : 'salah';
                    $normalized[$cleanK] = $cleanV;
                }
                return json_encode($normalized);
            }
        }

        // Normalize separators: replace semicolons, newlines, pipes with commas
        $cleanKey = str_replace(["\r\n", "\r", "\n", ';', '|'], ',', $trimmed);

        // Split into items
        $items = array_values(array_filter(array_map('trim', explode(',', $cleanKey)), function ($item) {
            return $item !== '';
        }));

        $optKeys = !empty($options) ? array_keys($options) : ['a', 'b', 'c', 'd', 'e'];
        $ansMap = [];

        foreach ($items as $idx => $item) {
            $delim = null;
            if (str_contains($item, ':')) {
                $delim = ':';
            } elseif (str_contains($item, '=')) {
                $delim = '=';
            } elseif (preg_match('/^[a-eA-E]\s*-\s*/', $item)) {
                $delim = '-';
            }

            if ($delim !== null) {
                [$k, $v] = explode($delim, $item, 2);
                $cleanK = strtolower(trim($k));
                $cleanV = in_array(strtolower(trim($v)), ['b', 'benar', 'true', '1']) ? 'benar' : 'salah';
                $ansMap[$cleanK] = $cleanV;
            } else {
                // Positional match to option key by index
                $k = $optKeys[$idx] ?? chr(97 + $idx);
                $cleanV = in_array(strtolower(trim($item)), ['b', 'benar', 'true', '1']) ? 'benar' : 'salah';
                $ansMap[$k] = $cleanV;
            }
        }

        return !empty($ansMap) ? json_encode($ansMap) : '{"a":"benar"}';
    }
}
