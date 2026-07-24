<?php
declare(strict_types=1);

$pdo = Database::pdo();
$categories = $pdo->query(
    'SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
     FROM categories c ORDER BY sort_order ASC'
)->fetchAll();

$pageTitle = 'Categories';
$activeAdminPath = '/admin/categories';
require __DIR__ . '/../../../Views/admin_shell_open.php';
?>
<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
  <div>
    <h1 class="font-display text-2xl text-brand-ink sm:text-3xl">Categories</h1>
    <p class="mt-1 text-sm text-black/50"><?= count($categories) ?> categories</p>
  </div>
  <a href="<?= e(base_url('/admin/categories/new')) ?>" class="btn-primary btn-sm">+ Add Category</a>
</div>

<div class="overflow-x-auto rounded-2xl border border-black/5 bg-white">
  <table class="w-full min-w-[720px] text-left text-sm">
    <thead>
      <tr>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Category</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Slug</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Products</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Order</th>
        <th class="border-b border-black/5 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-black/40">Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($categories as $c): ?>
        <tr class="hover:bg-brand-cream/40">
          <td class="border-b border-black/5 px-4 py-3.5 align-middle">
            <div class="flex items-center gap-3">
              <div class="relative h-11 w-10 shrink-0 overflow-hidden rounded-lg bg-brand-cream-dark">
                <img src="<?= e($c['image_url']) ?>" alt="<?= e($c['name']) ?>" class="h-full w-full object-cover">
              </div>
              <span class="font-medium text-brand-ink"><?= e($c['name']) ?></span>
            </div>
          </td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle text-black/50">/<?= e($c['slug']) ?></td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle text-black/60"><?= (int) $c['product_count'] ?></td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle text-black/60"><?= (int) $c['sort_order'] ?></td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle">
            <div class="flex items-center justify-end gap-3">
              <a href="<?= e(base_url('/admin/categories/' . $c['id'] . '/edit')) ?>" class="text-black/40 hover:text-brand-primary" aria-label="Edit">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              </a>
              <form action="<?= e(base_url('/admin/categories/' . $c['id'] . '/delete')) ?>" method="post" data-confirm="Delete this category?">
                <?= csrf_field() ?>
                <button type="submit" class="text-black/40 hover:text-red-600" aria-label="Delete">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </form>
            </div>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php require __DIR__ . '/../../../Views/admin_shell_close.php'; ?>
