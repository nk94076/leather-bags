<?php
/** Expects $activeAdminPath (string, e.g. '/admin/products') in scope. Falls back to REQUEST_URI. */
$currentPath = $activeAdminPath ?? parse_url($_SERVER['REQUEST_URI'] ?? '/admin', PHP_URL_PATH);
$links = [
    ['href' => '/admin', 'label' => 'Dashboard'],
    ['href' => '/admin/products', 'label' => 'Products'],
    ['href' => '/admin/categories', 'label' => 'Categories'],
    ['href' => '/admin/orders', 'label' => 'Orders'],
    ['href' => '/admin/customers', 'label' => 'Customers'],
    ['href' => '/admin/reviews', 'label' => 'Reviews'],
    ['href' => '/admin/homepage', 'label' => 'Homepage Manager'],
    ['href' => '/admin/pages', 'label' => 'Pages CMS'],
    ['href' => '/admin/media', 'label' => 'Media Manager'],
    ['href' => '/admin/settings', 'label' => 'Settings'],
];
$icons = [
    '/admin' => '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    '/admin/products' => '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
    '/admin/categories' => '<path d="M3 3h6v6H3zM15 3h6v6h-6zM15 15h6v6h-6zM3 15h6v6H3z"/>',
    '/admin/orders' => '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" stroke-linecap="round" stroke-linejoin="round"/>',
    '/admin/customers' => '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    '/admin/reviews' => '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z"/>',
    '/admin/homepage' => '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>',
    '/admin/pages' => '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/>',
    '/admin/media' => '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    '/admin/settings' => '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',
];
?>
<aside class="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-brand-ink text-brand-cream">
  <div class="flex h-20 items-center px-6">
    <a href="<?= e(base_url('/admin')) ?>" class="font-display text-xl tracking-[0.15em] text-white">
      CORIUM
      <span class="ml-2 rounded-full bg-brand-gold px-2 py-0.5 text-[10px] font-sans uppercase tracking-wide text-white">Admin</span>
    </a>
  </div>
  <nav class="flex-1 px-3 py-2">
    <?php foreach ($links as $l): $active = $l['href'] === '/admin' ? $currentPath === '/admin' : str_starts_with($currentPath, $l['href']); ?>
      <a href="<?= e(base_url($l['href'])) ?>" class="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition <?= $active ? 'bg-brand-primary text-white' : 'text-brand-cream/70 hover:bg-white/5 hover:text-white' ?>">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><?= $icons[$l['href']] ?></svg>
        <?= e($l['label']) ?>
      </a>
    <?php endforeach; ?>
  </nav>
  <div class="flex flex-col gap-1 border-t border-white/10 p-3">
    <a href="<?= e(base_url('/')) ?>" target="_blank" class="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-brand-cream/70 hover:bg-white/5 hover:text-white">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      View Store
    </a>
    <a href="<?= e(base_url('/logout')) ?>" class="flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm text-red-300 hover:bg-red-500/10">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Sign Out
    </a>
  </div>
</aside>
