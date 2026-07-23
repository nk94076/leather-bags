<?php
declare(strict_types=1);

$authUser = Auth::user();
$pdo = Database::pdo();

$PAYMENT_METHODS = [
    ['value' => 'COD', 'label' => 'Cash on Delivery', 'note' => '₹49 handling fee applies'],
    ['value' => 'UPI', 'label' => 'UPI', 'note' => 'GPay, PhonePe, Paytm & more'],
    ['value' => 'CARD', 'label' => 'Credit / Debit Card', 'note' => 'Visa, Mastercard, RuPay, Amex'],
    ['value' => 'NETBANKING', 'label' => 'Net Banking', 'note' => 'All major Indian banks'],
    ['value' => 'WALLET', 'label' => 'Wallet', 'note' => 'Paytm, Amazon Pay & more'],
];

$shippingSettings = get_setting('shipping');
$taxSettings = get_setting('tax');
$freeShippingThreshold = (float) ($shippingSettings['freeShippingThreshold'] ?? 999);
$standardFee = (float) ($shippingSettings['standardFee'] ?? 149);
$gstPercent = (float) ($taxSettings['gstPercent'] ?? 5);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify()) {
        flash_set('error', 'Your session expired. Please try again.');
        redirect('/checkout');
    }

    $addressId = (int) ($_POST['address_id'] ?? 0);
    $paymentMethod = $_POST['payment_method'] ?? 'COD';
    if (!in_array($paymentMethod, array_column($PAYMENT_METHODS, 'value'), true)) {
        $paymentMethod = 'COD';
    }

    $cart = $_SESSION['cart'] ?? [];
    if (empty($cart)) {
        flash_set('error', 'Your bag is empty.');
        redirect('/shop');
    }

    $addrStmt = $pdo->prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?');
    $addrStmt->execute([$addressId, $authUser['id']]);
    $address = $addrStmt->fetch();

    if (!$address) {
        flash_set('error', 'Please select or add a shipping address.');
        redirect('/checkout');
    }

    $productIds = array_column($cart, 'product_id');
    $placeholders = implode(',', array_fill(0, count($productIds), '?'));
    $prodStmt = $pdo->prepare(
        "SELECT p.*, pi.url AS image_url FROM products p
         LEFT JOIN product_images pi ON pi.product_id = p.id
         WHERE p.id IN ($placeholders)
         GROUP BY p.id"
    );
    $prodStmt->execute($productIds);
    $productMap = [];
    foreach ($prodStmt->fetchAll() as $p) {
        $productMap[(int) $p['id']] = $p;
    }

    foreach ($cart as $line) {
        $product = $productMap[(int) $line['product_id']] ?? null;
        if (!$product) {
            flash_set('error', 'One of the items is no longer available.');
            redirect('/cart');
        }
        if ((int) $product['stock'] < (int) $line['quantity']) {
            flash_set('error', $product['name'] . ' is out of stock.');
            redirect('/cart');
        }
    }

    $subtotal = 0.0;
    foreach ($cart as $line) {
        $product = $productMap[(int) $line['product_id']];
        $subtotal += (float) $product['price'] * (int) $line['quantity'];
    }

    $shippingFee = $subtotal >= $freeShippingThreshold ? 0.0 : $standardFee;
    $codFee = $paymentMethod === 'COD' ? 49.0 : 0.0;
    $tax = round($subtotal * ($gstPercent / 100));
    $total = $subtotal + $shippingFee + $codFee + $tax;

    $shippingSnapshot = json_encode([
        'fullName' => $address['full_name'],
        'phone' => $address['phone'],
        'line1' => $address['line1'],
        'line2' => $address['line2'],
        'city' => $address['city'],
        'state' => $address['state'],
        'postalCode' => $address['postal_code'],
        'country' => $address['country'],
    ]);

    $trackingHistory = json_encode([
        ['status' => 'PENDING', 'date' => date('c'), 'note' => 'Order placed'],
    ]);

    try {
        $pdo->beginTransaction();

        $orderStmt = $pdo->prepare(
            'INSERT INTO orders (order_number, user_id, address_id, shipping_snapshot, status, payment_method,
                payment_status, subtotal, shipping_fee, tax, total, tracking_history)
             VALUES (?,?,?,?,"PENDING",?,?,?,?,?,?,?)'
        );
        $orderStmt->execute([
            generate_order_number(), $authUser['id'], $address['id'], $shippingSnapshot, $paymentMethod,
            $paymentMethod === 'COD' ? 'PENDING' : 'PAID', $subtotal, $shippingFee + $codFee, $tax, $total, $trackingHistory,
        ]);
        $orderId = (int) $pdo->lastInsertId();

        $itemStmt = $pdo->prepare(
            'INSERT INTO order_items (order_id, product_id, product_name, product_image, color, price, quantity)
             VALUES (?,?,?,?,?,?,?)'
        );
        $stockStmt = $pdo->prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

        foreach ($cart as $line) {
            $product = $productMap[(int) $line['product_id']];
            $itemStmt->execute([
                $orderId, $product['id'], $product['name'], $product['image_url'] ?? '',
                $line['color'] ?: null, $product['price'], $line['quantity'],
            ]);
            $stockStmt->execute([$line['quantity'], $product['id']]);
        }

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        flash_set('error', 'Something went wrong placing your order. Please try again.');
        redirect('/checkout');
    }

    unset($_SESSION['cart']);
    flash_set('success', 'Order placed successfully!');
    redirect('/checkout/confirmation/' . $orderId);
}

$cart = $_SESSION['cart'] ?? [];

if (empty($cart)) {
    $pageTitle = 'Checkout';
    $noindex = true;
    require __DIR__ . '/../Views/layout_open.php';
    ?>
    <div class="mx-auto flex max-w-[1400px] flex-col items-center gap-4 px-4 py-24 text-center">
      <p class="font-display text-xl text-brand-ink">Your bag is empty</p>
      <a href="<?= e(base_url('/shop')) ?>" class="btn-primary">Shop Now</a>
    </div>
    <?php
    require __DIR__ . '/../Views/layout_close.php';
    exit;
}

$addrStmt = $pdo->prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC');
$addrStmt->execute([$authUser['id']]);
$addresses = $addrStmt->fetchAll();

$requestedAddress = isset($_GET['address']) ? (int) $_GET['address'] : null;
$selectedAddressId = null;
foreach ($addresses as $a) {
    if ($requestedAddress && (int) $a['id'] === $requestedAddress) {
        $selectedAddressId = (int) $a['id'];
    }
}
if (!$selectedAddressId && $addresses) {
    $selectedAddressId = (int) $addresses[0]['id'];
}

$subtotal = 0.0;
foreach ($cart as $l) {
    $subtotal += (float) $l['price'] * (int) $l['quantity'];
}
$shippingFee = $subtotal >= $freeShippingThreshold ? 0.0 : $standardFee;
$tax = round($subtotal * ($gstPercent / 100));

$pageTitle = 'Checkout';
$noindex = true;
require __DIR__ . '/../Views/layout_open.php';
?>
<div class="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
  <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1.5 text-xs text-black/50">
    <a href="<?= e(base_url('/')) ?>" class="hover:text-brand-primary">Home</a>
    <span>›</span>
    <a href="<?= e(base_url('/cart')) ?>" class="hover:text-brand-primary">Bag</a>
    <span>›</span>
    <span class="text-brand-ink">Checkout</span>
  </nav>
  <h1 class="mb-10 mt-4 font-display text-3xl text-brand-ink sm:text-4xl">Checkout</h1>

  <form action="<?= e(base_url('/checkout')) ?>" method="post" class="grid grid-cols-1 gap-10 lg:grid-cols-3">
    <?= csrf_field() ?>
    <div class="flex flex-col gap-8 lg:col-span-2">
      <section>
        <h2 class="mb-4 flex items-center gap-2 font-display text-lg text-brand-ink">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-6.5 8-12a8 8 0 1 0-16 0c0 5.5 8 12 8 12Z"/><circle cx="12" cy="10" r="3"/></svg>
          Shipping Address
        </h2>

        <?php if ($addresses): ?>
          <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <?php foreach ($addresses as $a): $checked = (int) $a['id'] === $selectedAddressId; ?>
              <label class="block cursor-pointer rounded-2xl border p-4 text-left text-sm transition <?= $checked ? 'border-brand-primary bg-brand-cream' : 'border-black/10 hover:border-black/20' ?>">
                <input type="radio" name="address_id" value="<?= (int) $a['id'] ?>" <?= $checked ? 'checked' : '' ?> class="sr-only" onchange="this.closest('form').querySelectorAll('[data-address-card]').forEach(c=>c.classList.remove('border-brand-primary','bg-brand-cream'));this.closest('[data-address-card]').classList.add('border-brand-primary','bg-brand-cream')">
                <div data-address-card class="contents">
                  <div class="mb-1 flex items-center justify-between">
                    <span class="font-semibold text-brand-ink"><?= e($a['label']) ?></span>
                    <?php if ($a['is_default']): ?><span class="text-[10px] uppercase text-brand-primary">Default</span><?php endif; ?>
                  </div>
                  <p class="text-black/60"><?= e($a['full_name']) ?></p>
                  <p class="text-black/50"><?= e($a['line1']) ?>, <?= $a['line2'] ? e($a['line2']) . ', ' : '' ?><?= e($a['city']) ?>, <?= e($a['state']) ?> <?= e($a['postal_code']) ?></p>
                  <p class="mt-1 text-black/50"><?= e($a['phone']) ?></p>
                </div>
              </label>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>

        <button type="button" data-toggle-target="new-address-form" class="flex items-center gap-2 text-sm font-medium text-brand-primary hover:underline">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
          Add a new address
        </button>
      </section>

      <section>
        <h2 class="mb-4 font-display text-lg text-brand-ink">Payment Method</h2>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <?php foreach ($PAYMENT_METHODS as $i => $m): $checked = $i === 0; ?>
            <label class="flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-left transition has-[:checked]:border-brand-primary has-[:checked]:bg-brand-cream border-black/10 hover:border-black/20">
              <input type="radio" name="payment_method" value="<?= e($m['value']) ?>" data-cod-toggle <?= $checked ? 'checked' : '' ?> class="h-4 w-4 accent-brand-primary">
              <div>
                <p class="text-sm font-medium text-brand-ink"><?= e($m['label']) ?></p>
                <p class="text-xs text-black/50"><?= e($m['note']) ?></p>
              </div>
            </label>
          <?php endforeach; ?>
        </div>
      </section>
    </div>

    <div class="h-fit rounded-2xl border border-black/5 bg-white p-6" data-order-summary data-subtotal="<?= $subtotal ?>" data-shipping="<?= $shippingFee ?>" data-tax="<?= $tax ?>">
      <h2 class="mb-5 font-display text-lg text-brand-ink">Order Summary</h2>
      <div class="flex max-h-64 flex-col gap-4 overflow-y-auto pr-1">
        <?php foreach ($cart as $l): ?>
          <div class="flex gap-3">
            <div class="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-cream-dark">
              <?php if (!empty($l['image'])): ?><img src="<?= e($l['image']) ?>" alt="<?= e($l['name']) ?>" class="h-full w-full object-cover"><?php endif; ?>
              <span class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-ink text-[10px] text-white"><?= (int) $l['quantity'] ?></span>
            </div>
            <div class="flex-1">
              <p class="line-clamp-1 text-sm text-brand-ink"><?= e($l['name']) ?></p>
              <?php if (!empty($l['color'])): ?><p class="text-xs text-black/40"><?= e($l['color']) ?></p><?php endif; ?>
            </div>
            <span class="text-sm font-medium text-brand-ink"><?= format_price((float) $l['price'] * (int) $l['quantity']) ?></span>
          </div>
        <?php endforeach; ?>
      </div>

      <div class="mt-5 flex flex-col gap-2.5 border-t border-black/5 pt-5 text-sm">
        <div class="flex justify-between text-black/60"><span>Subtotal</span><span><?= format_price($subtotal) ?></span></div>
        <div class="flex justify-between text-black/60"><span>Shipping</span><span><?= $shippingFee === 0.0 ? 'Free' : format_price($shippingFee) ?></span></div>
        <div class="flex justify-between text-black/60"><span>Tax (GST <?= (int) $gstPercent ?>%)</span><span><?= format_price($tax) ?></span></div>
        <div class="flex justify-between text-black/60" id="cod-fee-row"><span>COD Handling Fee</span><span id="cod-fee-amount">₹49</span></div>
      </div>

      <div class="mt-4 flex justify-between border-t border-black/10 pt-4 text-base font-semibold text-brand-ink">
        <span>Total</span>
        <span id="checkout-total"><?= format_price($subtotal + $shippingFee + $tax + 49) ?></span>
      </div>

      <button type="submit" class="btn-primary mt-6 w-full">Place Order</button>
    </div>
  </form>

  <div id="new-address-form" class="hidden mt-8 max-w-2xl rounded-2xl border border-black/10 p-6">
    <h3 class="mb-4 font-display text-lg text-brand-ink">Add New Address</h3>
    <form action="<?= e(base_url('/checkout/address/add')) ?>" method="post" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <?= csrf_field() ?>
      <label class="flex flex-col gap-1.5 sm:col-span-2">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Label</span>
        <input name="label" required placeholder="Home, Work, etc." class="input-field">
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Full Name</span>
        <input name="full_name" required class="input-field">
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Phone</span>
        <input name="phone" required class="input-field">
      </label>
      <label class="flex flex-col gap-1.5 sm:col-span-2">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Address Line 1</span>
        <input name="line1" required class="input-field">
      </label>
      <label class="flex flex-col gap-1.5 sm:col-span-2">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Address Line 2 (optional)</span>
        <input name="line2" class="input-field">
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">City</span>
        <input name="city" required class="input-field">
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">State</span>
        <input name="state" required class="input-field">
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Postal Code</span>
        <input name="postal_code" required class="input-field">
      </label>
      <label class="mt-1 flex items-center gap-2 text-sm text-black/60 sm:col-span-2">
        <input type="checkbox" name="is_default" value="1" class="h-4 w-4 accent-brand-primary"> Set as default address
      </label>
      <div class="sm:col-span-2">
        <button type="submit" class="btn-primary">Save Address</button>
      </div>
    </form>
  </div>
</div>
<script>
(function () {
  var summary = document.querySelector('[data-order-summary]');
  var codRow = document.getElementById('cod-fee-row');
  var totalEl = document.getElementById('checkout-total');
  if (!summary || !codRow || !totalEl) return;
  var subtotal = parseFloat(summary.dataset.subtotal || '0');
  var shipping = parseFloat(summary.dataset.shipping || '0');
  var tax = parseFloat(summary.dataset.tax || '0');
  function formatPrice(n) {
    return '₹' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function recompute() {
    var selected = document.querySelector('[data-cod-toggle]:checked');
    var isCod = selected && selected.value === 'COD';
    codRow.classList.toggle('hidden', !isCod);
    var codFee = isCod ? 49 : 0;
    totalEl.textContent = formatPrice(subtotal + shipping + tax + codFee);
  }
  document.querySelectorAll('[data-cod-toggle]').forEach(function (el) {
    el.addEventListener('change', recompute);
  });
  recompute();
})();
</script>
<?php require __DIR__ . '/../Views/layout_close.php'; ?>
