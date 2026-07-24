<?php
/** Expects $activePath (string) in scope. */
$links = [
    ['href' => '/account', 'label' => 'Overview'],
    ['href' => '/account/orders', 'label' => 'My Orders'],
    ['href' => '/account/addresses', 'label' => 'Addresses'],
    ['href' => '/wishlist', 'label' => 'Wishlist'],
    ['href' => '/account/password', 'label' => 'Change Password'],
];
$icons = [
    '/account' => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
    '/account/orders' => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16.5 9.4 7.5 4.2"/><path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>',
    '/account/addresses' => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-6.5 8-12a8 8 0 1 0-16 0c0 5.5 8 12 8 12Z"/><circle cx="12" cy="10" r="3"/></svg>',
    '/wishlist' => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
    '/account/password' => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
];
?>
<nav class="flex flex-col gap-1 rounded-2xl border border-black/5 bg-white p-3">
  <?php foreach ($links as $l): $active = $activePath === $l['href']; ?>
    <a href="<?= e(base_url($l['href'])) ?>" class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition <?= $active ? 'bg-brand-primary text-white' : 'text-brand-ink hover:bg-brand-cream' ?>">
      <?= $icons[$l['href']] ?>
      <?= e($l['label']) ?>
    </a>
  <?php endforeach; ?>
  <a href="<?= e(base_url('/logout')) ?>" class="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9" stroke-linecap="round" stroke-linejoin="round"/></svg>
    Sign Out
  </a>
</nav>
