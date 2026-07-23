<?php
declare(strict_types=1);

$pdo = Database::pdo();
$q = trim((string) ($_GET['q'] ?? ''));
$page = max(1, (int) ($_GET['page'] ?? 1));
$perPage = 20;

$where = '';
$bind = [];
if ($q !== '') {
    $where = 'WHERE p.name LIKE ? OR p.sku LIKE ?';
    $bind = ['%' . $q . '%', '%' . $q . '%'];
}

$totalStmt = $pdo->prepare("SELECT COUNT(*) AS c FROM products p $where");
$totalStmt->execute($bind);
$total = (int) $totalStmt->fetch()['c'];
$totalPages = max(1, (int) ceil($total / $perPage));

$stmt = $pdo->prepare(
    "SELECT p.*, c.name AS category_name,
        (SELECT url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order ASC LIMIT 1) AS image_url
     FROM products p JOIN categories c ON c.id = p.category_id
     $where
     ORDER BY p.created_at DESC LIMIT $perPage OFFSET " . (($page - 1) * $perPage)
);
$stmt->execute($bind);
$products = $stmt->fetchAll();

$pageTitle = 'Products';
$activeAdminPath = '/admin/products';
require __DIR__ . '/../../../Views/admin_shell_open.php';
?>
<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
  <div>
    <h1 class="font-display text-2xl text-brand-ink sm:text-3xl">Products</h1>
    <p class="mt-1 text-sm text-black/50"><?= $total ?> products in catalog</p>
  </div>
  <a href="<?= e(base_url('/admin/products/new')) ?>" class="btn-primary btn-sm">+ Add Product</a>
</div>

<form method="get" class="mb-5 flex max-w-sm items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-black/40"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3" stroke-linecap="round"/></svg>
  <input type="text" name="q" value="<?= e($q) ?>" placeholder="Search by name or SKU..." class="w-full text-sm outline-none">
</form>

<div class="overflow-x-auto rounded-2xl border border-black/5 bg-white">
  <table class="w-full min-w-[820px] text-left text-sm">
    <thead>
      <tr>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Product</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Category</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Price</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Stock</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Status</th>
        <th class="border-b border-black/5 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-black/40">Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($products as $p): ?>
        <tr class="hover:bg-brand-cream/40">
          <td class="border-b border-black/5 px-4 py-3.5 align-middle">
            <div class="flex items-center gap-3">
              <div class="relative h-11 w-10 shrink-0 overflow-hidden rounded-lg bg-brand-cream-dark">
                <?php if (!empty($p['image_url'])): ?><img src="<?= e($p['image_url']) ?>" alt="" class="h-full w-full object-cover"><?php endif; ?>
              </div>
              <div>
                <p class="line-clamp-1 max-w-[220px] font-medium text-brand-ink"><?= e($p['name']) ?></p>
                <p class="text-xs text-black/40"><?= e($p['sku']) ?></p>
              </div>
            </div>
          </td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle text-black/60"><?= e($p['category_name']) ?></td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle text-black/60"><?= format_price((float) $p['price']) ?></td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle">
            <span class="<?= (int) $p['stock'] === 0 ? 'text-red-600' : 'text-black/60' ?>"><?= (int) $p['stock'] ?></span>
          </td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle">
            <div class="flex flex-wrap gap-1">
              <span class="badge border border-black/10 bg-white text-brand-ink"><?= $p['is_active'] ? 'Active' : 'Hidden' ?></span>
              <?php if ($p['is_featured']): ?><span class="badge bg-brand-gold text-white">Featured</span><?php endif; ?>
              <?php if ($p['is_trending']): ?><span class="badge bg-brand-secondary text-white">Trending</span><?php endif; ?>
            </div>
          </td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle">
            <div class="flex items-center justify-end gap-3">
              <a href="<?= e(base_url('/admin/products/' . $p['id'] . '/edit')) ?>" class="text-black/40 hover:text-brand-primary" aria-label="Edit">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              </a>
              <form action="<?= e(base_url('/admin/products/' . $p['id'] . '/delete')) ?>" method="post" data-confirm="Delete this product?">
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

<?php if ($totalPages > 1): ?>
  <div class="mt-6 flex justify-center gap-2">
    <?php for ($p = 1; $p <= $totalPages; $p++): ?>
      <a href="<?= e(base_url('/admin/products')) ?>?<?= $q ? 'q=' . urlencode($q) . '&' : '' ?>page=<?= $p ?>" class="flex h-9 w-9 items-center justify-center rounded-full border text-sm <?= $p === $page ? 'border-brand-primary bg-brand-primary text-white' : 'border-black/10' ?>"><?= $p ?></a>
    <?php endfor; ?>
  </div>
<?php endif; ?>
<?php require __DIR__ . '/../../../Views/admin_shell_close.php'; ?>
