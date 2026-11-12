<?php
declare(strict_types=1);

$authUser = Auth::user();
$orderId = (int) $params['orderId'];

$pdo = Database::pdo();
$orderStmt = $pdo->prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?');
$orderStmt->execute([$orderId, $authUser['id']]);
$order = $orderStmt->fetch();

if (!$order) {
    http_response_code(404);
    require __DIR__ . '/../Views/pages/404.php';
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

$pageTitle = 'Order Confirmed';
$noindex = true;
require __DIR__ . '/../Views/layout_open.php';
?>
<div class="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
  <div class="flex flex-col items-center gap-3 text-center">
    <span class="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" stroke-linecap="round"/><path d="m9 11 3 3L22 4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </span>
    <h1 class="font-display text-3xl text-brand-ink sm:text-4xl">Thank You For Your Order!</h1>
    <p class="text-sm text-black/60">Your order <span class="font-semibold text-brand-ink">#<?= e($order['order_number']) ?></span> has been placed successfully. A confirmation has been sent to your registered email.</p>
  </div>

  <div class="mt-10 rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-6">
      <div>
        <p class="text-xs uppercase tracking-wide text-black/40">Order Date</p>
        <p class="text-sm font-medium text-brand-ink"><?= format_date($order['created_at']) ?></p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-wide text-black/40">Payment Method</p>
        <p class="text-sm font-medium text-brand-ink"><?= e($order['payment_method']) ?></p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-wide text-black/40">Order Total</p>
        <p class="text-sm font-semibold text-brand-ink"><?= format_price((float) $order['total']) ?></p>
      </div>
    </div>

    <div class="flex flex-col gap-4 py-6">
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

    <?php if ($address || $shippingSnapshot): $ship = $address ?: [
        'full_name' => $shippingSnapshot['fullName'] ?? '', 'line1' => $shippingSnapshot['line1'] ?? '',
        'city' => $shippingSnapshot['city'] ?? '', 'state' => $shippingSnapshot['state'] ?? '', 'postal_code' => $shippingSnapshot['postalCode'] ?? '',
    ]; ?>
      <div class="border-t border-black/5 pt-6">
        <p class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-ink">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m21 8-9-5-9 5v8l9 5 9-5Z"/><path d="M3 8l9 5 9-5M12 13v8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Shipping To
        </p>
        <p class="text-sm text-black/60"><?= e($ship['full_name']) ?>, <?= e($ship['line1']) ?>, <?= e($ship['city']) ?>, <?= e($ship['state']) ?> <?= e($ship['postal_code']) ?></p>
      </div>
    <?php endif; ?>
  </div>

  <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
    <a href="<?= e(base_url('/account/orders/' . $order['id'])) ?>" class="btn-primary text-center">Track Your Order</a>
    <a href="<?= e(base_url('/shop')) ?>" class="btn-outline text-center">Continue Shopping</a>
  </div>
</div>
<?php require __DIR__ . '/../Views/layout_close.php'; ?>
