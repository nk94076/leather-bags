<?php
declare(strict_types=1);

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'];

$pdo = Database::pdo();
$statusFilter = $_GET['status'] ?? '';

$where = '';
$bind = [];
if ($statusFilter !== '' && in_array($statusFilter, ORDER_STATUSES, true)) {
    $where = 'WHERE o.status = ?';
    $bind = [$statusFilter];
}

$stmt = $pdo->prepare(
    "SELECT o.*, u.name AS user_name, u.email AS user_email,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
     FROM orders o JOIN users u ON u.id = o.user_id
     $where
     ORDER BY o.created_at DESC LIMIT 100"
);
$stmt->execute($bind);
$orders = $stmt->fetchAll();

$pageTitle = 'Orders';
$activeAdminPath = '/admin/orders';
require __DIR__ . '/../../../Views/admin_shell_open.php';
?>
<div class="mb-6">
  <h1 class="font-display text-2xl text-brand-ink sm:text-3xl">Orders</h1>
  <p class="mt-1 text-sm text-black/50"><?= count($orders) ?> orders</p>
</div>

<div class="mb-5 flex flex-wrap gap-2">
  <a href="<?= e(base_url('/admin/orders')) ?>" class="rounded-full px-3 py-1.5 text-xs font-medium <?= $statusFilter === '' ? 'bg-brand-ink text-white' : 'border border-black/10 text-black/60' ?>">All</a>
  <?php foreach (ORDER_STATUSES as $s): ?>
    <a href="<?= e(base_url('/admin/orders')) ?>?status=<?= e($s) ?>" class="rounded-full px-3 py-1.5 text-xs font-medium <?= $statusFilter === $s ? 'bg-brand-ink text-white' : 'border border-black/10 text-black/60' ?>"><?= e(str_replace('_', ' ', $s)) ?></a>
  <?php endforeach; ?>
</div>

<div class="overflow-x-auto rounded-2xl border border-black/5 bg-white">
  <table class="w-full min-w-[760px] text-left text-sm">
    <thead>
      <tr>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Order</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Customer</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Date</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Items</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Total</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Status</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($orders as $o): ?>
        <tr class="hover:bg-brand-cream/40">
          <td class="border-b border-black/5 px-4 py-3.5 align-middle">
            <a href="<?= e(base_url('/admin/orders/' . $o['id'])) ?>" class="font-medium text-brand-primary hover:underline">#<?= e($o['order_number']) ?></a>
          </td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle">
            <p class="text-brand-ink"><?= e($o['user_name']) ?></p>
            <p class="text-xs text-black/40"><?= e($o['user_email']) ?></p>
          </td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle text-black/60"><?= format_date($o['created_at']) ?></td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle text-black/60"><?= (int) $o['item_count'] ?></td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle font-medium text-brand-ink"><?= format_price((float) $o['total']) ?></td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle">
            <?php $status = $o['status']; include __DIR__ . '/../../../Views/partials/order-status-badge.php'; ?>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php require __DIR__ . '/../../../Views/admin_shell_close.php'; ?>
