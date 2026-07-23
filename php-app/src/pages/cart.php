<?php
declare(strict_types=1);

$cart = $_SESSION['cart'] ?? [];
$lines = array_values($cart);
$keys = array_keys($cart);

$subtotal = 0.0;
foreach ($lines as $l) {
    $subtotal += (float) $l['price'] * (int) $l['quantity'];
}

$shippingSettings = get_setting('shipping');
$taxSettings = get_setting('tax');
$freeShippingThreshold = (float) ($shippingSettings['freeShippingThreshold'] ?? 999);
$standardFee = (float) ($shippingSettings['standardFee'] ?? 149);
$gstPercent = (float) ($taxSettings['gstPercent'] ?? 5);

$shippingFee = ($subtotal >= $freeShippingThreshold || $subtotal === 0.0) ? 0.0 : $standardFee;
$estimatedTax = round($subtotal * ($gstPercent / 100));
$total = $subtotal + $shippingFee + $estimatedTax;

$pageTitle = 'Your Shopping Bag';
$canonicalPath = '/cart';
$noindex = true;
require __DIR__ . '/../Views/layout_open.php';
?>
<div class="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
  <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1.5 text-xs text-black/50">
    <a href="<?= e(base_url('/')) ?>" class="hover:text-brand-primary">Home</a>
    <span>›</span>
    <span class="text-brand-ink">Shopping Bag</span>
  </nav>
  <h1 class="mb-10 mt-4 font-display text-3xl text-brand-ink sm:text-4xl">Your Shopping Bag</h1>

  <?php if (empty($lines)): ?>
    <div class="flex flex-col items-center gap-4 py-24 text-center">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-black/20"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <p class="font-display text-xl text-brand-ink">Your bag is empty</p>
      <p class="text-sm text-black/50">Looks like you haven't added anything yet.</p>
      <a href="<?= e(base_url('/shop')) ?>" class="btn-primary mt-2">Continue Shopping</a>
    </div>
  <?php else: ?>
    <div class="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <div class="flex flex-col gap-4 lg:col-span-2">
        <?php foreach ($lines as $i => $l): $key = $keys[$i]; ?>
          <div class="flex gap-4 rounded-2xl border border-black/5 bg-white p-4 sm:gap-6 sm:p-5">
            <a href="<?= e(base_url('/product/' . $l['slug'])) ?>" class="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-brand-cream-dark sm:h-32 sm:w-28">
              <?php if (!empty($l['image'])): ?><img src="<?= e($l['image']) ?>" alt="<?= e($l['name']) ?>" class="h-full w-full object-cover"><?php endif; ?>
            </a>
            <div class="flex flex-1 flex-col">
              <div class="flex items-start justify-between gap-2">
                <a href="<?= e(base_url('/product/' . $l['slug'])) ?>" class="font-display text-base text-brand-ink hover:text-brand-primary sm:text-lg"><?= e($l['name']) ?></a>
                <form action="<?= e(base_url('/cart/remove')) ?>" method="post">
                  <?= csrf_field() ?>
                  <input type="hidden" name="key" value="<?= e($key) ?>">
                  <input type="hidden" name="redirect" value="/cart">
                  <button type="submit" aria-label="Remove item" class="text-black/40 hover:text-red-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                </form>
              </div>
              <?php if (!empty($l['color'])): ?><span class="text-xs text-black/50">Colour: <?= e($l['color']) ?></span><?php endif; ?>
              <span class="mt-1 text-sm font-semibold text-brand-ink"><?= format_price((float) $l['price']) ?></span>
              <div class="mt-auto flex items-center justify-between pt-3">
                <div class="flex items-center rounded-full border border-black/10">
                  <form action="<?= e(base_url('/cart/update')) ?>" method="post">
                    <?= csrf_field() ?>
                    <input type="hidden" name="key" value="<?= e($key) ?>">
                    <input type="hidden" name="quantity" value="<?= max(0, (int) $l['quantity'] - 1) ?>">
                    <input type="hidden" name="redirect" value="/cart">
                    <button type="submit" class="px-3 py-2" aria-label="Decrease quantity">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14" stroke-linecap="round"/></svg>
                    </button>
                  </form>
                  <span class="w-8 text-center text-sm"><?= (int) $l['quantity'] ?></span>
                  <form action="<?= e(base_url('/cart/update')) ?>" method="post">
                    <?= csrf_field() ?>
                    <input type="hidden" name="key" value="<?= e($key) ?>">
                    <input type="hidden" name="quantity" value="<?= min((int) ($l['stock'] ?: 99), (int) $l['quantity'] + 1) ?>">
                    <input type="hidden" name="redirect" value="/cart">
                    <button type="submit" class="px-3 py-2" aria-label="Increase quantity">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
                    </button>
                  </form>
                </div>
                <span class="text-sm font-semibold text-brand-ink"><?= format_price((float) $l['price'] * (int) $l['quantity']) ?></span>
              </div>
            </div>
          </div>
        <?php endforeach; ?>
        <a href="<?= e(base_url('/shop')) ?>" class="self-start text-xs font-semibold uppercase tracking-wide text-brand-primary hover:underline">← Continue Shopping</a>
      </div>

      <div class="h-fit rounded-2xl border border-black/5 bg-white p-6">
        <h2 class="font-display text-lg text-brand-ink">Order Summary</h2>

        <div class="mt-5 flex flex-col gap-2.5 text-sm">
          <div class="flex justify-between text-black/60">
            <span>Subtotal</span>
            <span><?= format_price($subtotal) ?></span>
          </div>
          <div class="flex justify-between text-black/60">
            <span>Estimated Shipping</span>
            <span><?= $shippingFee === 0.0 ? 'Free' : format_price($shippingFee) ?></span>
          </div>
          <div class="flex justify-between text-black/60">
            <span>Estimated Tax (GST <?= (int) $gstPercent ?>%)</span>
            <span><?= format_price($estimatedTax) ?></span>
          </div>
        </div>

        <div class="mt-4 flex justify-between border-t border-black/10 pt-4 text-base font-semibold text-brand-ink">
          <span>Total</span>
          <span><?= format_price($total) ?></span>
        </div>

        <?php if ($subtotal < $freeShippingThreshold): ?>
          <p class="mt-3 text-xs text-brand-secondary">Add <?= format_price($freeShippingThreshold - $subtotal) ?> more to qualify for free shipping.</p>
        <?php endif; ?>

        <a href="<?= e(base_url('/checkout')) ?>" class="btn-primary mt-6 block w-full text-center">Proceed to Checkout</a>

        <div class="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-black/40">
          <?php foreach (['Visa', 'Mastercard', 'UPI', 'COD'] as $p): ?>
            <span class="rounded border border-black/10 px-2 py-1"><?= e($p) ?></span>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/../Views/layout_close.php'; ?>
