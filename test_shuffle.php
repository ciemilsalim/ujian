<?php
// Script to test Collection shuffle consistency
require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$collection = collect(range(1, 10));

echo "Shuffle 1 (seed 5): " . $collection->shuffle(5)->implode(',') . "\n";
echo "Shuffle 2 (seed 5): " . $collection->shuffle(5)->implode(',') . "\n";
echo "Shuffle 3 (seed 5): " . $collection->shuffle(5)->implode(',') . "\n";
