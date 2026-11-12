<?php
/** Expects $activePath in scope. Include after layout_open.php. */
?>
<div class="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
  <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1.5 text-xs text-black/50">
    <a href="<?= e(base_url('/')) ?>" class="hover:text-brand-primary">Home</a>
    <span>›</span>
    <span class="text-brand-ink">My Account</span>
  </nav>
  <h1 class="mb-8 mt-4 font-display text-3xl text-brand-ink sm:text-4xl">My Account</h1>
  <div class="flex flex-col gap-8 lg:flex-row">
    <div class="lg:w-64 lg:shrink-0">
      <?php include __DIR__ . '/partials/account-nav.php'; ?>
    </div>
    <div class="flex-1">
