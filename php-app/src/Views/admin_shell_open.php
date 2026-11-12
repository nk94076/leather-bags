<?php
/** Expects optional $pageTitle, $activeAdminPath in scope. */
$general = get_setting('general', []);
$siteName = $general['siteName'] ?? 'CORIUM';
$authUser = Auth::user();
$title = (isset($pageTitle) && $pageTitle !== '') ? $pageTitle . ' | Admin | ' . $siteName : 'Admin | ' . $siteName;
?><!DOCTYPE html>
<html lang="en" class="h-full antialiased">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= e($title) ?></title>
<meta name="robots" content="noindex,nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="<?= e(asset_url('css/app.css')) ?>">
<script>window.APP_BASE_URL = <?= json_encode(base_url('/')) ?>;</script>
</head>
<body class="min-h-full bg-brand-cream">
<?php $flashes = flash_get(); ?>
<div class="flex min-h-screen">
  <div class="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64">
    <?php require __DIR__ . '/partials/admin-sidebar.php'; ?>
  </div>

  <div id="admin-mobile-sidebar" class="fixed inset-0 z-50 hidden lg:hidden">
    <div data-toggle-target="admin-mobile-sidebar" class="absolute inset-0 bg-black/50"></div>
    <div class="absolute left-0 top-0 h-full w-64">
      <?php require __DIR__ . '/partials/admin-sidebar.php'; ?>
    </div>
    <button type="button" data-toggle-target="admin-mobile-sidebar" aria-label="Close menu" class="absolute right-4 top-4 z-10 text-white">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/></svg>
    </button>
  </div>

  <div class="flex min-h-screen flex-1 flex-col lg:pl-64">
    <div class="flex h-16 items-center justify-between border-b border-black/5 bg-white px-4 lg:hidden">
      <button type="button" data-toggle-target="admin-mobile-sidebar" aria-label="Open menu" class="text-brand-ink">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round"/></svg>
      </button>
      <span class="font-display text-lg text-brand-ink">Admin</span>
      <span class="text-xs text-black/50"><?= e($authUser['name'] ?? '') ?></span>
    </div>
    <main class="flex-1 p-4 sm:p-6 lg:p-8">
      <?php if ($flashes): ?>
        <div class="mb-6 flex flex-col gap-2">
          <?php foreach ($flashes as $f): ?>
            <div class="rounded-xl px-4 py-3 text-sm <?= $f['type'] === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700' ?>"><?= e($f['message']) ?></div>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
