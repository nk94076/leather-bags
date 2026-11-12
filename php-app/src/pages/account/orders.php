<?php
declare(strict_types=1);

$authUser = Auth::user();
$pdo = Database::pdo();

$ordersStmt = $pdo->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
$ordersStmt->execute([$authUser['id']]);
$orders = $ordersStmt->fetchAll();

foreach ($orders as &$o) {
    $itemsStmt = $pdo->prepare('SELECT * FROM order_items WHERE order_id = ? LIMIT 3');
    $itemsStmt->execute([$o['id']]);
    $o['preview_items'] = $itemsStmt->fetchAll();
    $countStmt = $pdo->prepare('SELECT COUNT(*) AS c FROM order_items WHERE order_id = ?');
    $countStmt->execute([$o['id']]);
    $o['item_count'] = (int) $countStmt->fetch()['c'];
}
unset($o);

$pageTitle = 'My Orders';
$noindex = true;
$activePath = '/account/orders';
require __DIR__ . '/../../Views/layout_open.php';
require __DIR__ . '/../../Views/account_layout_open.php';
?>
<?php if (empty($orders)): ?>
  <div class="flex flex-col items-center gap-4 rounded-2xl border border-black/5 bg-white py-20 text-center">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="text-black/20"><path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>
    <p class="font-display text-xl text-brand-ink">No orders yet</p>
    <p class="text-sm text-black/50">When you place an order, it will appear here.</p>
    <a href="<?= e(base_url('/shop')) ?>" class="btn-primary mt-2">Start Shopping</a>
  </div>
<?php else: ?>
  <div class="flex flex-col gap-5">
    <?php foreach ($orders as $o): ?>
      <a href="<?= e(base_url('/account/orders/' . $o['id'])) ?>" class="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-5 transition hover:shadow-luxury sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <div class="flex -space-x-3">
            <?php foreach ($o['preview_items'] as $item): ?>
              <div class="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-brand-cream-dark">
                <?php if (!empty($item['product_image'])): ?><img src="<?= e($item['product_image']) ?>" alt="<?= e($item['product_name']) ?>" class="h-full w-full object-cover"><?php endif; ?>
              </div>
            <?php endforeach; ?>
          </div>
          <div>
            <p class="text-sm font-medium text-brand-ink">#<?= e($o['order_number']) ?></p>
            <p class="text-xs text-black/50"><?= format_date($o['created_at']) ?> • <?= $o['item_count'] ?> item<?= $o['item_count'] > 1 ? 's' : '' ?></p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm font-semibold text-brand-ink"><?= format_price((float) $o['total']) ?></span>
          <?php $status = $o['status']; include __DIR__ . '/../../Views/partials/order-status-badge.php'; ?>
        </div>
      </a>
    <?php endforeach; ?>
  </div>
<?php endif; ?>
<?php
require __DIR__ . '/../../Views/account_layout_close.php';
require __DIR__ . '/../../Views/layout_close.php';
