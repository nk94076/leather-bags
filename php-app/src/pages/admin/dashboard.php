<?php
declare(strict_types=1);

$pdo = Database::pdo();

$orderCount = (int) $pdo->query('SELECT COUNT(*) AS c FROM orders')->fetch()['c'];
$revenue = (float) ($pdo->query("SELECT COALESCE(SUM(total),0) AS s FROM orders WHERE payment_status = 'PAID'")->fetch()['s'] ?? 0);
$productCount = (int) $pdo->query('SELECT COUNT(*) AS c FROM products')->fetch()['c'];
$categoryCount = (int) $pdo->query('SELECT COUNT(*) AS c FROM categories')->fetch()['c'];
$customerCount = (int) $pdo->query("SELECT COUNT(*) AS c FROM users WHERE role = 'CUSTOMER'")->fetch()['c'];

$recentOrders = $pdo->query(
    'SELECT o.*, u.name AS user_name FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC LIMIT 6'
)->fetchAll();

$topProducts = $pdo->query(
    'SELECT p.*, (SELECT url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order ASC LIMIT 1) AS image_url
     FROM products p ORDER BY review_count DESC LIMIT 5'
)->fetchAll();

$since = date('Y-m-d H:i:s', strtotime('-30 days'));
$dailyStmt = $pdo->prepare('SELECT DATE(created_at) AS d, SUM(total) AS total FROM orders WHERE created_at >= ? GROUP BY DATE(created_at)');
$dailyStmt->execute([$since]);
$dailyRows = $dailyStmt->fetchAll();
$dailyMap = [];
foreach ($dailyRows as $r) {
    $dailyMap[$r['d']] = (float) $r['total'];
}
$chart = [];
for ($i = 29; $i >= 0; $i--) {
    $d = date('Y-m-d', strtotime("-$i days"));
    $chart[] = ['label' => date('d M', strtotime($d)), 'value' => $dailyMap[$d] ?? 0.0];
}
$maxRevenue = max(1, ...array_column($chart, 'value'));

$pageTitle = 'Dashboard';
$activeAdminPath = '/admin';
require __DIR__ . '/../../Views/admin_shell_open.php';
?>
<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
  <div>
    <h1 class="font-display text-2xl text-brand-ink sm:text-3xl">Dashboard</h1>
    <p class="mt-1 text-sm text-black/50">Overview of your store's performance</p>
  </div>
</div>

<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
  <a href="<?= e(base_url('/admin/orders')) ?>" class="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-5 transition hover:shadow-luxury">
    <span class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 7c0-2.8-2.7-5-6-5S6 4.2 6 7M4 7h16l-1.5 13a2 2 0 0 1-2 1.8H7.5A2 2 0 0 1 5.5 20Z"/></svg>
    </span>
    <div><p class="font-display text-2xl text-brand-ink"><?= format_price($revenue) ?></p><p class="text-xs text-black/50">Total Revenue</p></div>
  </a>
  <a href="<?= e(base_url('/admin/orders')) ?>" class="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-5 transition hover:shadow-luxury">
    <span class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </span>
    <div><p class="font-display text-2xl text-brand-ink"><?= $orderCount ?></p><p class="text-xs text-black/50">Orders</p></div>
  </a>
  <a href="<?= e(base_url('/admin/products')) ?>" class="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-5 transition hover:shadow-luxury">
    <span class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>
    </span>
    <div><p class="font-display text-2xl text-brand-ink"><?= $productCount ?></p><p class="text-xs text-black/50">Products</p></div>
  </a>
  <a href="<?= e(base_url('/admin/categories')) ?>" class="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-5 transition hover:shadow-luxury">
    <span class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3h6v6H3zM15 3h6v6h-6zM15 15h6v6h-6zM3 15h6v6H3z"/></svg>
    </span>
    <div><p class="font-display text-2xl text-brand-ink"><?= $categoryCount ?></p><p class="text-xs text-black/50">Categories</p></div>
  </a>
  <a href="<?= e(base_url('/admin/customers')) ?>" class="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-5 transition hover:shadow-luxury">
    <span class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
    </span>
    <div><p class="font-display text-2xl text-brand-ink"><?= $customerCount ?></p><p class="text-xs text-black/50">Customers</p></div>
  </a>
</div>

<div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
  <div class="rounded-2xl border border-black/5 bg-white p-6 lg:col-span-2">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="font-display text-lg text-brand-ink">Sales — Last 30 Days</h2>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-brand-primary"><path d="M23 6l-9.5 9.5-5-5L1 18" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <div class="flex h-40 items-stretch gap-1">
      <?php foreach ($chart as $c): $h = $c['value'] > 0 ? max(4, (int) round(($c['value'] / $maxRevenue) * 100)) : 2; ?>
        <div class="group flex flex-1 flex-col justify-end" title="<?= e($c['label']) ?>: <?= format_price($c['value']) ?>">
          <div class="w-full rounded-t bg-brand-primary/70 transition group-hover:bg-brand-primary" style="height:<?= $h ?>%"></div>
        </div>
      <?php endforeach; ?>
    </div>
    <div class="mt-2 flex justify-between text-[10px] text-black/40">
      <span><?= e($chart[0]['label']) ?></span>
      <span><?= e($chart[count($chart) - 1]['label']) ?></span>
    </div>
  </div>

  <div class="rounded-2xl border border-black/5 bg-white p-6">
    <h2 class="mb-4 font-display text-lg text-brand-ink">Top Products</h2>
    <div class="flex flex-col gap-4">
      <?php foreach ($topProducts as $i => $p): ?>
        <a href="<?= e(base_url('/admin/products/' . $p['id'] . '/edit')) ?>" class="flex items-center gap-3">
          <span class="w-4 text-xs font-semibold text-black/30"><?= $i + 1 ?></span>
          <div class="relative h-10 w-9 shrink-0 overflow-hidden rounded-lg bg-brand-cream-dark">
            <?php if (!empty($p['image_url'])): ?><img src="<?= e($p['image_url']) ?>" alt="" class="h-full w-full object-cover"><?php endif; ?>
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm text-brand-ink"><?= e($p['name']) ?></p>
            <p class="text-xs text-black/40"><?= (int) $p['review_count'] ?> reviews • <?= format_price((float) $p['price']) ?></p>
          </div>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</div>

<div class="mt-6 rounded-2xl border border-black/5 bg-white p-6">
  <div class="mb-4 flex items-center justify-between">
    <h2 class="font-display text-lg text-brand-ink">Latest Orders</h2>
    <a href="<?= e(base_url('/admin/orders')) ?>" class="text-xs font-medium text-brand-primary hover:underline">View All</a>
  </div>
  <div class="flex flex-col divide-y divide-black/5">
    <?php foreach ($recentOrders as $o): ?>
      <a href="<?= e(base_url('/admin/orders/' . $o['id'])) ?>" class="flex flex-wrap items-center justify-between gap-3 py-3">
        <div>
          <p class="text-sm font-medium text-brand-ink">#<?= e($o['order_number']) ?></p>
          <p class="text-xs text-black/50"><?= e($o['user_name']) ?> • <?= format_date($o['created_at']) ?></p>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm font-semibold text-brand-ink"><?= format_price((float) $o['total']) ?></span>
          <?php $status = $o['status']; include __DIR__ . '/../../Views/partials/order-status-badge.php'; ?>
        </div>
      </a>
    <?php endforeach; ?>
  </div>
</div>
<?php require __DIR__ . '/../../Views/admin_shell_close.php'; ?>
