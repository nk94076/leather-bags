<?php
declare(strict_types=1);

$pdo = Database::pdo();
$customerId = (int) $params['id'];

$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? AND role = 'CUSTOMER'");
$stmt->execute([$customerId]);
$customer = $stmt->fetch();

if (!$customer) {
    http_response_code(404);
    require __DIR__ . '/../../../Views/pages/404.php';
    exit;
}

$ordersStmt = $pdo->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
$ordersStmt->execute([$customerId]);
$orders = $ordersStmt->fetchAll();
$totalSpent = array_sum(array_map(fn ($o) => (float) $o['total'], $orders));

$wishlistStmt = $pdo->prepare(
    'SELECT p.name, p.price, p.slug FROM wishlist_items w JOIN products p ON p.id = w.product_id WHERE w.user_id = ?'
);
$wishlistStmt->execute([$customerId]);
$wishlist = $wishlistStmt->fetchAll();

$addrStmt = $pdo->prepare('SELECT * FROM addresses WHERE user_id = ?');
$addrStmt->execute([$customerId]);
$addresses = $addrStmt->fetchAll();

$pageTitle = $customer['name'];
$activeAdminPath = '/admin/customers';
require __DIR__ . '/../../../Views/admin_shell_open.php';
?>
<div class="mb-6">
  <h1 class="font-display text-2xl text-brand-ink sm:text-3xl"><?= e($customer['name']) ?></h1>
  <p class="mt-1 text-sm text-black/50"><?= e($customer['email']) ?></p>
</div>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
  <div class="flex flex-col gap-6 lg:col-span-2">
    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <h2 class="mb-4 font-display text-lg text-brand-ink">Orders (<?= count($orders) ?>)</h2>
      <div class="flex flex-col divide-y divide-black/5">
        <?php foreach ($orders as $o): ?>
          <a href="<?= e(base_url('/admin/orders/' . $o['id'])) ?>" class="flex items-center justify-between gap-3 py-3">
            <div>
              <p class="text-sm font-medium text-brand-ink">#<?= e($o['order_number']) ?></p>
              <p class="text-xs text-black/50"><?= format_date($o['created_at']) ?></p>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm font-semibold text-brand-ink"><?= format_price((float) $o['total']) ?></span>
              <?php $status = $o['status']; include __DIR__ . '/../../../Views/partials/order-status-badge.php'; ?>
            </div>
          </a>
        <?php endforeach; ?>
        <?php if (empty($orders)): ?><p class="py-3 text-sm text-black/40">No orders yet.</p><?php endif; ?>
      </div>
    </div>

    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <h2 class="mb-4 font-display text-lg text-brand-ink">Wishlist (<?= count($wishlist) ?>)</h2>
      <div class="flex flex-col divide-y divide-black/5">
        <?php foreach ($wishlist as $w): ?>
          <a href="<?= e(base_url('/product/' . $w['slug'])) ?>" class="flex items-center justify-between py-3 text-sm">
            <span class="text-brand-ink"><?= e($w['name']) ?></span>
            <span class="text-black/50"><?= format_price((float) $w['price']) ?></span>
          </a>
        <?php endforeach; ?>
        <?php if (empty($wishlist)): ?><p class="py-3 text-sm text-black/40">No wishlist items.</p><?php endif; ?>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-6">
    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <h2 class="mb-3 font-display text-lg text-brand-ink">Summary</h2>
      <div class="flex flex-col gap-2 text-sm">
        <div class="flex justify-between"><span class="text-black/50">Total Orders</span><span class="font-medium text-brand-ink"><?= count($orders) ?></span></div>
        <div class="flex justify-between"><span class="text-black/50">Total Spent</span><span class="font-medium text-brand-ink"><?= format_price($totalSpent) ?></span></div>
        <div class="flex justify-between"><span class="text-black/50">Joined</span><span class="font-medium text-brand-ink"><?= format_date($customer['created_at']) ?></span></div>
        <div class="flex justify-between"><span class="text-black/50">Phone</span><span class="font-medium text-brand-ink"><?= e($customer['phone'] ?: '—') ?></span></div>
      </div>
    </div>

    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <h2 class="mb-3 font-display text-lg text-brand-ink">Addresses</h2>
      <div class="flex flex-col gap-4">
        <?php foreach ($addresses as $a): ?>
          <div class="text-sm">
            <p class="font-medium text-brand-ink"><?= e($a['label']) ?></p>
            <p class="text-black/50"><?= e($a['line1']) ?>, <?= e($a['city']) ?>, <?= e($a['state']) ?> <?= e($a['postal_code']) ?></p>
          </div>
        <?php endforeach; ?>
        <?php if (empty($addresses)): ?><p class="text-sm text-black/40">No addresses saved.</p><?php endif; ?>
      </div>
    </div>
  </div>
</div>
<?php require __DIR__ . '/../../../Views/admin_shell_close.php'; ?>
