<?php
require_once __DIR__ . '/../layout_open.php';
?>
<div class="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center sm:py-32">
  <span class="flex h-20 w-20 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8" stroke-linecap="round"/></svg>
  </span>
  <div>
    <p class="font-display text-7xl text-brand-primary/30 sm:text-8xl">404</p>
    <h1 class="mt-2 font-display text-2xl text-brand-ink sm:text-3xl">This Path Leads Nowhere</h1>
    <p class="mx-auto mt-3 max-w-md text-sm text-black/60">The page you're looking for may have been moved, renamed, or doesn't exist. Let's get you back on track.</p>
  </div>
  <div class="flex flex-wrap justify-center gap-3">
    <a href="<?= e(base_url('/')) ?>" class="btn-primary">Back to Home</a>
    <a href="<?= e(base_url('/shop')) ?>" class="btn-outline">Continue Shopping</a>
  </div>
</div>
<?php require_once __DIR__ . '/../layout_close.php'; ?>
