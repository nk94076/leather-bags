<?php
declare(strict_types=1);

$pdo = Database::pdo();
$customers = $pdo->query(
    "SELECT u.*,
        (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count,
        (SELECT COALESCE(SUM(total),0) FROM orders o WHERE o.user_id = u.id) AS total_spent,
        (SELECT COUNT(*) FROM wishlist_items w WHERE w.user_id = u.id) AS wishlist_count
     FROM users u WHERE u.role = 'CUSTOMER' ORDER BY u.created_at DESC"
)->fetchAll();

$pageTitle = 'Customers';
$activeAdminPath = '/admin/customers';
require __DIR__ . '/../../../Views/admin_shell_open.php';
?>
<div class="mb-6">
  <h1 class="font-display text-2xl text-brand-ink sm:text-3xl">Customers</h1>
  <p class="mt-1 text-sm text-black/50"><?= count($customers) ?> registered customers</p>
</div>

<div class="overflow-x-auto rounded-2xl border border-black/5 bg-white">
  <table class="w-full min-w-[720px] text-left text-sm">
    <thead>
      <tr>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Customer</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Joined</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Orders</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Total Spent</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Wishlist</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($customers as $c): ?>
        <tr class="hover:bg-brand-cream/40">
          <td class="border-b border-black/5 px-4 py-3.5 align-middle">
            <a href="<?= e(base_url('/admin/customers/' . $c['id'])) ?>" class="font-medium text-brand-primary hover:underline"><?= e($c['name']) ?></a>
            <p class="text-xs text-black/40"><?= e($c['email']) ?></p>
          </td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle text-black/60"><?= format_date($c['created_at']) ?></td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle text-black/60"><?= (int) $c['order_count'] ?></td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle font-medium text-brand-ink"><?= format_price((float) $c['total_spent']) ?></td>
          <td class="border-b border-black/5 px-4 py-3.5 align-middle text-black/60"><?= (int) $c['wishlist_count'] ?></td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php require __DIR__ . '/../../../Views/admin_shell_close.php'; ?>
