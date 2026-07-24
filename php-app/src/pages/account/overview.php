<?php
declare(strict_types=1);

$authUser = Auth::user();
$pdo = Database::pdo();

$ordersStmt = $pdo->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 3');
$ordersStmt->execute([$authUser['id']]);
$recentOrders = $ordersStmt->fetchAll();

foreach ($recentOrders as &$o) {
    $itemCountStmt = $pdo->prepare('SELECT COUNT(*) AS c FROM order_items WHERE order_id = ?');
    $itemCountStmt->execute([$o['id']]);
    $o['item_count'] = (int) $itemCountStmt->fetch()['c'];
}
unset($o);

$countStmt = $pdo->prepare('SELECT COUNT(*) AS c FROM orders WHERE user_id = ?');
$countStmt->execute([$authUser['id']]);
$totalOrders = (int) $countStmt->fetch()['c'];

$wishlistStmt = $pdo->prepare('SELECT COUNT(*) AS c FROM wishlist_items WHERE user_id = ?');
$wishlistStmt->execute([$authUser['id']]);
$wishlistCount = (int) $wishlistStmt->fetch()['c'];

$addressStmt = $pdo->prepare('SELECT COUNT(*) AS c FROM addresses WHERE user_id = ?');
$addressStmt->execute([$authUser['id']]);
$addressCount = (int) $addressStmt->fetch()['c'];

$pageTitle = 'My Account';
$noindex = true;
$activePath = '/account';
require __DIR__ . '/../../Views/layout_open.php';
require __DIR__ . '/../../Views/account_layout_open.php';
?>
<div class="flex flex-col gap-8">
  <div class="rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
    <p class="text-sm text-black/50">Welcome back,</p>
    <h2 class="font-display text-2xl text-brand-ink"><?= e($authUser['name']) ?></h2>
    <p class="mt-1 text-sm text-black/50"><?= e($authUser['email']) ?></p>
  </div>

  <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
    <a href="<?= e(base_url('/account/orders')) ?>" class="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-5 transition hover:shadow-luxury">
      <span class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>
      </span>
      <div>
        <p class="font-display text-2xl text-brand-ink"><?= $totalOrders ?></p>
        <p class="text-xs text-black/50">Total Orders</p>
      </div>
    </a>
    <a href="<?= e(base_url('/wishlist')) ?>" class="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-5 transition hover:shadow-luxury">
      <span class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
      </span>
      <div>
        <p class="font-display text-2xl text-brand-ink"><?= $wishlistCount ?></p>
        <p class="text-xs text-black/50">Wishlist Items</p>
      </div>
    </a>
    <a href="<?= e(base_url('/account/addresses')) ?>" class="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-5 transition hover:shadow-luxury">
      <span class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-6.5 8-12a8 8 0 1 0-16 0c0 5.5 8 12 8 12Z"/><circle cx="12" cy="10" r="3"/></svg>
      </span>
      <div>
        <p class="font-display text-2xl text-brand-ink"><?= $addressCount ?></p>
        <p class="text-xs text-black/50">Saved Addresses</p>
      </div>
    </a>
  </div>

  <div class="rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
    <div class="mb-5 flex items-center justify-between">
      <h3 class="font-display text-lg text-brand-ink">Recent Orders</h3>
      <a href="<?= e(base_url('/account/orders')) ?>" class="flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline">
        View All
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    </div>
    <?php if (empty($recentOrders)): ?>
      <p class="text-sm text-black/50">You haven't placed any orders yet.</p>
    <?php else: ?>
      <div class="flex flex-col divide-y divide-black/5">
        <?php foreach ($recentOrders as $o): ?>
          <a href="<?= e(base_url('/account/orders/' . $o['id'])) ?>" class="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-brand-cream/50">
            <div>
              <p class="text-sm font-medium text-brand-ink">#<?= e($o['order_number']) ?></p>
              <p class="text-xs text-black/50"><?= format_date($o['created_at']) ?> • <?= $o['item_count'] ?> item<?= $o['item_count'] > 1 ? 's' : '' ?></p>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm font-semibold text-brand-ink"><?= format_price((float) $o['total']) ?></span>
              <?php $status = $o['status']; include __DIR__ . '/../../Views/partials/order-status-badge.php'; ?>
            </div>
          </a>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</div>
<?php
require __DIR__ . '/../../Views/account_layout_close.php';
require __DIR__ . '/../../Views/layout_close.php';
