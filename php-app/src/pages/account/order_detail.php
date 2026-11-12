<?php
declare(strict_types=1);

$authUser = Auth::user();
$orderId = (int) $params['id'];
$pdo = Database::pdo();

$orderStmt = $pdo->prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?');
$orderStmt->execute([$orderId, $authUser['id']]);
$order = $orderStmt->fetch();

if (!$order) {
    http_response_code(404);
    require __DIR__ . '/../../Views/pages/404.php';
    exit;
}

$itemsStmt = $pdo->prepare('SELECT * FROM order_items WHERE order_id = ?');
$itemsStmt->execute([$order['id']]);
$items = $itemsStmt->fetchAll();

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
$canCancel = in_array($order['status'], ['PENDING', 'CONFIRMED', 'PROCESSING'], true);

$pageTitle = 'Order #' . $order['order_number'];
$noindex = true;
$activePath = '/account/orders';
require __DIR__ . '/../../Views/layout_open.php';
require __DIR__ . '/../../Views/account_layout_open.php';
?>
<div class="flex flex-col gap-6">
  <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white p-6">
    <div>
      <p class="font-display text-xl text-brand-ink">Order #<?= e($order['order_number']) ?></p>
      <p class="text-xs text-black/50">Placed on <?= format_date($order['created_at']) ?></p>
    </div>
    <div class="flex items-center gap-3">
      <?php $status = $order['status']; include __DIR__ . '/../../Views/partials/order-status-badge.php'; ?>
      <?php if ($canCancel): ?>
        <form action="<?= e(base_url('/account/orders/' . $order['id'] . '/cancel')) ?>" method="post" data-confirm="Cancel this order?">
          <?= csrf_field() ?>
          <button type="submit" class="btn-outline btn-sm">Cancel Order</button>
        </form>
      <?php endif; ?>
    </div>
  </div>

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div class="flex flex-col gap-6 lg:col-span-2">
      <div class="rounded-2xl border border-black/5 bg-white p-6">
        <h3 class="mb-4 font-display text-lg text-brand-ink">Items</h3>
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
        <h3 class="mb-4 font-display text-lg text-brand-ink">Tracking</h3>
        <?php if (!empty($order['tracking_number'])): ?>
          <p class="mb-4 text-sm text-black/60">Tracking Number: <span class="font-medium text-brand-ink"><?= e($order['tracking_number']) ?></span></p>
        <?php endif; ?>
        <?php include __DIR__ . '/../../Views/partials/order-tracking-timeline.php'; ?>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <div class="rounded-2xl border border-black/5 bg-white p-6">
        <h3 class="mb-3 font-display text-lg text-brand-ink">Shipping Address</h3>
        <p class="text-sm text-black/60">
          <?= e($shipping['full_name']) ?><br>
          <?= e($shipping['line1']) ?><?= !empty($shipping['line2']) ? ', ' . e($shipping['line2']) : '' ?><br>
          <?= e($shipping['city']) ?>, <?= e($shipping['state']) ?> <?= e($shipping['postal_code']) ?><br>
          <?= e($shipping['phone']) ?>
        </p>
      </div>
      <div class="rounded-2xl border border-black/5 bg-white p-6">
        <h3 class="mb-3 font-display text-lg text-brand-ink">Payment</h3>
        <p class="text-sm text-black/60">Method: <span class="font-medium text-brand-ink"><?= e($order['payment_method']) ?></span></p>
        <p class="text-sm text-black/60">Status: <span class="font-medium text-brand-ink"><?= e($order['payment_status']) ?></span></p>
      </div>
    </div>
  </div>
</div>
<?php
require __DIR__ . '/../../Views/account_layout_close.php';
require __DIR__ . '/../../Views/layout_close.php';
