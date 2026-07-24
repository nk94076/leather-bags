<?php
declare(strict_types=1);

const ADMIN_ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'];
const ADMIN_STATUS_NOTES = [
    'PENDING' => 'Order placed',
    'CONFIRMED' => 'Order confirmed and payment verified',
    'PROCESSING' => 'Order is being packed at our warehouse',
    'SHIPPED' => 'Order has been shipped',
    'OUT_FOR_DELIVERY' => 'Out for delivery',
    'DELIVERED' => 'Delivered successfully',
    'CANCELLED' => 'Order cancelled',
    'RETURNED' => 'Order returned',
    'REFUNDED' => 'Refund processed',
];

$pdo = Database::pdo();
$orderId = (int) $params['id'];

$orderStmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
$orderStmt->execute([$orderId]);
$order = $orderStmt->fetch();

if (!$order) {
    http_response_code(404);
    require __DIR__ . '/../../../Views/pages/404.php';
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (csrf_verify()) {
        $newStatus = $_POST['status'] ?? $order['status'];
        $trackingNumber = trim((string) ($_POST['tracking_number'] ?? ''));

        if (in_array($newStatus, ADMIN_ORDER_STATUSES, true)) {
            $history = json_decode_assoc($order['tracking_history']);
            if ($order['status'] !== $newStatus) {
                $history[] = ['status' => $newStatus, 'date' => date('c'), 'note' => ADMIN_STATUS_NOTES[$newStatus] ?? $newStatus];
            }
            $paymentStatus = ($newStatus === 'DELIVERED' && $order['payment_method'] === 'COD') ? 'PAID' : $order['payment_status'];

            $pdo->prepare('UPDATE orders SET status=?, tracking_number=?, tracking_history=?, payment_status=? WHERE id=?')
                ->execute([$newStatus, $trackingNumber ?: $order['tracking_number'], json_encode($history), $paymentStatus, $orderId]);

            flash_set('success', 'Order updated.');
            redirect('/admin/orders/' . $orderId);
        }
    }
    flash_set('error', 'Could not update order.');
    redirect('/admin/orders/' . $orderId);
}

$itemsStmt = $pdo->prepare('SELECT * FROM order_items WHERE order_id = ?');
$itemsStmt->execute([$orderId]);
$items = $itemsStmt->fetchAll();

$userStmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
$userStmt->execute([$order['user_id']]);
$customer = $userStmt->fetch();

$address = null;
if ($order['address_id']) {
    $addrStmt = $pdo->prepare('SELECT * FROM addresses WHERE id = ?');
    $addrStmt->execute([$order['address_id']]);
    $address = $addrStmt->fetch() ?: null;
}
$shippingSnapshot = json_decode_assoc($order['shipping_snapshot']);
$shipping = $address ?: [
    'full_name' => $shippingSnapshot['fullName'] ?? '', 'line1' => $shippingSnapshot['line1'] ?? '',
    'line2' => $shippingSnapshot['line2'] ?? '', 'city' => $shippingSnapshot['city'] ?? '',
    'state' => $shippingSnapshot['state'] ?? '', 'postal_code' => $shippingSnapshot['postalCode'] ?? '',
    'phone' => $shippingSnapshot['phone'] ?? '',
];
$history = json_decode_assoc($order['tracking_history']);

$pageTitle = 'Order #' . $order['order_number'];
$activeAdminPath = '/admin/orders';
require __DIR__ . '/../../../Views/admin_shell_open.php';
?>
<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
  <div>
    <h1 class="font-display text-2xl text-brand-ink sm:text-3xl">Order #<?= e($order['order_number']) ?></h1>
    <p class="mt-1 text-sm text-black/50">Placed on <?= format_date($order['created_at']) ?></p>
  </div>
  <?php $status = $order['status']; include __DIR__ . '/../../../Views/partials/order-status-badge.php'; ?>
</div>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
  <div class="flex flex-col gap-6 lg:col-span-2">
    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <h2 class="mb-4 font-display text-lg text-brand-ink">Items</h2>
      <div class="flex flex-col gap-4">
        <?php foreach ($items as $item): ?>
          <div class="flex gap-4">
            <div class="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-cream-dark">
              <?php if (!empty($item['product_image'])): ?><img src="<?= e($item['product_image']) ?>" alt="<?= e($item['product_name']) ?>" class="h-full w-full object-cover"><?php endif; ?>
            </div>
            <div class="flex-1">
              <p class="text-sm text-brand-ink"><?= e($item['product_name']) ?></p>
              <p class="text-xs text-black/40"><?= $item['color'] ? e($item['color']) . ' • ' : '' ?>Qty <?= (int) $item['quantity'] ?></p>
            </div>
            <span class="text-sm font-medium text-brand-ink"><?= format_price((float) $item['price'] * (int) $item['quantity']) ?></span>
          </div>
        <?php endforeach; ?>
      </div>
      <div class="mt-5 flex flex-col gap-2 border-t border-black/5 pt-5 text-sm">
        <div class="flex justify-between text-black/60"><span>Subtotal</span><span><?= format_price((float) $order['subtotal']) ?></span></div>
        <div class="flex justify-between text-black/60"><span>Shipping</span><span><?= (float) $order['shipping_fee'] === 0.0 ? 'Free' : format_price((float) $order['shipping_fee']) ?></span></div>
        <div class="flex justify-between text-black/60"><span>Tax</span><span><?= format_price((float) $order['tax']) ?></span></div>
        <div class="flex justify-between border-t border-black/10 pt-2 text-base font-semibold text-brand-ink"><span>Total</span><span><?= format_price((float) $order['total']) ?></span></div>
      </div>
    </div>

    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <h2 class="mb-4 font-display text-lg text-brand-ink">Tracking History</h2>
      <?php include __DIR__ . '/../../../Views/partials/order-tracking-timeline.php'; ?>
    </div>
  </div>

  <div class="flex flex-col gap-6">
    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <h2 class="mb-4 font-display text-lg text-brand-ink">Update Status</h2>
      <form method="post" class="flex flex-col gap-4">
        <?= csrf_field() ?>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Order Status</span>
          <select name="status" class="input-field">
            <?php foreach (ADMIN_ORDER_STATUSES as $s): ?>
              <option value="<?= e($s) ?>" <?= $order['status'] === $s ? 'selected' : '' ?>><?= e(str_replace('_', ' ', $s)) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Tracking Number</span>
          <input name="tracking_number" value="<?= e($order['tracking_number'] ?? '') ?>" placeholder="e.g. IND1234567IN" class="input-field">
        </label>
        <button type="submit" class="btn-primary btn-sm self-start">Update Order</button>
      </form>
    </div>

    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <h2 class="mb-3 font-display text-lg text-brand-ink">Customer</h2>
      <?php if ($customer): ?>
        <a href="<?= e(base_url('/admin/customers/' . $customer['id'])) ?>" class="text-sm text-brand-primary hover:underline"><?= e($customer['name']) ?></a>
        <p class="text-sm text-black/50"><?= e($customer['email']) ?></p>
        <p class="text-sm text-black/50"><?= e($customer['phone'] ?? '') ?></p>
      <?php endif; ?>
    </div>

    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <h2 class="mb-3 font-display text-lg text-brand-ink">Shipping Address</h2>
      <p class="text-sm text-black/60">
        <?= e($shipping['full_name']) ?><br>
        <?= e($shipping['line1']) ?><?= !empty($shipping['line2']) ? ', ' . e($shipping['line2']) : '' ?><br>
        <?= e($shipping['city']) ?>, <?= e($shipping['state']) ?> <?= e($shipping['postal_code']) ?><br>
        <?= e($shipping['phone']) ?>
      </p>
    </div>

    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <h2 class="mb-3 font-display text-lg text-brand-ink">Payment</h2>
      <p class="text-sm text-black/60">Method: <span class="font-medium text-brand-ink"><?= e($order['payment_method']) ?></span></p>
      <p class="text-sm text-black/60">Status: <span class="font-medium text-brand-ink"><?= e($order['payment_status']) ?></span></p>
    </div>
  </div>
</div>
<?php require __DIR__ . '/../../../Views/admin_shell_close.php'; ?>
