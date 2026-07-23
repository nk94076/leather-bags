<?php
$general = get_setting('general', []);
$seo = get_setting('seo', []);
$siteName = $general['siteName'] ?? 'CORIUM';
$defaultTitle = $seo['defaultMetaTitle'] ?? ($siteName . ' | Premium Genuine Leather Bags');
$defaultDesc = $seo['defaultMetaDesc'] ?? 'Shop premium full-grain leather bags, backpacks, wallets and accessories.';

$title = isset($pageTitle) && $pageTitle !== '' ? $pageTitle . ' | ' . $siteName : $defaultTitle;
$description = $pageDescription ?? $defaultDesc;
$canonical = isset($canonicalPath) ? base_url($canonicalPath) : base_url($_SERVER['REQUEST_URI'] ?? '/');
$noindex = $noindex ?? false;
?><!DOCTYPE html>
<html lang="en" class="h-full antialiased">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= e($title) ?></title>
<meta name="description" content="<?= e($description) ?>">
<link rel="canonical" href="<?= e($canonical) ?>">
<?php if ($noindex): ?><meta name="robots" content="noindex,nofollow"><?php endif; ?>
<meta property="og:type" content="website">
<meta property="og:site_name" content="<?= e($siteName) ?>">
<meta property="og:title" content="<?= e($title) ?>">
<meta property="og:description" content="<?= e($description) ?>">
<?php if (!empty($ogImage)): ?><meta property="og:image" content="<?= e($ogImage) ?>"><?php endif; ?>
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="<?= e(asset_url('css/app.css')) ?>">
<script>window.APP_BASE_URL = <?= json_encode(base_url('/')) ?>;</script>
<?php if (!empty($jsonLd)): foreach ((array) $jsonLd as $block): ?>
<script type="application/ld+json"><?= json_encode($block, JSON_UNESCAPED_SLASHES) ?></script>
<?php endforeach; endif; ?>
</head>
<body class="min-h-full flex flex-col bg-brand-cream">
<?php
$flashes = flash_get();
require __DIR__ . '/partials/announcement.php';
require __DIR__ . '/partials/header.php';
?>
<?php if ($flashes): ?>
<div class="mx-auto mt-4 flex max-w-[1400px] flex-col gap-2 px-4 sm:px-6 lg:px-10">
  <?php foreach ($flashes as $f): ?>
    <div class="rounded-xl px-4 py-3 text-sm <?= $f['type'] === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700' ?>"><?= e($f['message']) ?></div>
  <?php endforeach; ?>
</div>
<?php endif; ?>
<main class="flex-1">
