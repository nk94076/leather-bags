<?php
declare(strict_types=1);

$type = $params['type'] ?? 'product';
$seed = $params['seed'] ?? 'corium';
$w = isset($_GET['w']) ? (int) $_GET['w'] : null;
$h = isset($_GET['h']) ? (int) $_GET['h'] : null;
$label = $_GET['label'] ?? null;

if ($type === 'avatar') {
    $svg = avatar_placeholder_svg($seed, $label ?: $seed, $w ?: 96);
} elseif ($type === 'banner' || $type === 'gallery') {
    $svg = banner_placeholder_svg($seed, $w ?: 1400, $h ?: 800);
} else {
    $svg = product_placeholder_svg($seed, $w ?: 800, $h ?: 1000, $label);
}

header('Content-Type: image/svg+xml');
header('Cache-Control: public, max-age=31536000, immutable');
echo $svg;
