<?php
declare(strict_types=1);

$pdo = Database::pdo();
$pages = $pdo->query('SELECT * FROM cms_pages ORDER BY title ASC')->fetchAll();
$faqCount = (int) $pdo->query('SELECT COUNT(*) AS c FROM faq_items')->fetch()['c'];

$pageTitle = 'Pages CMS';
$activeAdminPath = '/admin/pages';
require __DIR__ . '/../../../Views/admin_shell_open.php';
?>
<div class="mb-6">
  <h1 class="font-display text-2xl text-brand-ink sm:text-3xl">Pages CMS</h1>
  <p class="mt-1 text-sm text-black/50">Edit the content of every static page — no code required</p>
</div>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <?php foreach ($pages as $p): ?>
    <a href="<?= e(base_url('/admin/pages/' . $p['slug'])) ?>" class="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-6 transition hover:shadow-luxury">
      <div class="flex items-center gap-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/></svg>
        </span>
        <div>
          <p class="font-medium text-brand-ink"><?= e($p['title']) ?></p>
          <p class="text-xs text-black/40">/<?= e($p['slug']) ?></p>
        </div>
      </div>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-black/30"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
    </a>
  <?php endforeach; ?>

  <a href="<?= e(base_url('/admin/pages/faq')) ?>" class="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-6 transition hover:shadow-luxury">
    <div class="flex items-center gap-3">
      <span class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4M12 17h.01"/></svg>
      </span>
      <div>
        <p class="font-medium text-brand-ink">FAQs</p>
        <p class="text-xs text-black/40"><?= $faqCount ?> questions</p>
      </div>
    </div>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-black/30"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
  </a>
</div>
<?php require __DIR__ . '/../../../Views/admin_shell_close.php'; ?>
