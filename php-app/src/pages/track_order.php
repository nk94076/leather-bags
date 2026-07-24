<?php
declare(strict_types=1);

$orderNumber = '';
$email = '';
$error = null;
$result = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify()) {
        $error = 'Your session expired. Please try again.';
    } else {
        $orderNumber = trim((string) ($_POST['order_number'] ?? ''));
        $email = trim((string) ($_POST['email'] ?? ''));

        if (mb_strlen($orderNumber) < 3 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = 'Enter a valid order number and email.';
        } else {
            $pdo = Database::pdo();
            $stmt = $pdo->prepare(
                'SELECT o.*, u.email AS user_email FROM orders o
                 JOIN users u ON u.id = o.user_id
                 WHERE o.order_number = ?'
            );
            $stmt->execute([strtoupper($orderNumber)]);
            $order = $stmt->fetch();

            if (!$order || strtolower($order['user_email']) !== strtolower($email)) {
                $error = "We couldn't find an order matching those details.";
            } else {
                $countStmt = $pdo->prepare('SELECT COUNT(*) AS c FROM order_items WHERE order_id = ?');
                $countStmt->execute([$order['id']]);
                $shipping = json_decode_assoc($order['shipping_snapshot']);
                $result = [
                    'orderNumber' => $order['order_number'],
                    'status' => $order['status'],
                    'createdAt' => $order['created_at'],
                    'trackingNumber' => $order['tracking_number'],
                    'trackingHistory' => json_decode_assoc($order['tracking_history']),
                    'itemCount' => (int) $countStmt->fetch()['c'],
                    'total' => (float) $order['total'],
                    'city' => $shipping['city'] ?? '',
                    'state' => $shipping['state'] ?? '',
                ];
            }
        }
    }
}

$pageTitle = 'Track Your Order';
$noindex = true;
require __DIR__ . '/../Views/layout_open.php';
?>
<div class="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
  <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1.5 text-xs text-black/50">
    <a href="<?= e(base_url('/')) ?>" class="hover:text-brand-primary">Home</a>
    <span>›</span>
    <span class="text-brand-ink">Track Order</span>
  </nav>
  <h1 class="mb-3 mt-4 font-display text-3xl text-brand-ink sm:text-4xl">Track Your Order</h1>
  <p class="mb-10 text-sm text-black/60">Enter your order number and the email address used at checkout to view your order status.</p>

  <form method="post" class="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
    <?= csrf_field() ?>
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Order Number</span>
      <input required name="order_number" value="<?= e($orderNumber) ?>" placeholder="e.g. MC202601011234" class="input-field">
    </label>
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Email Address</span>
      <input required type="email" name="email" value="<?= e($email) ?>" placeholder="you@example.com" class="input-field">
    </label>
    <button type="submit" class="btn-primary mt-2 self-start">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-1.5 inline"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3" stroke-linecap="round"/></svg>
      Track Order
    </button>
    <?php if ($error): ?><p class="text-sm text-red-600"><?= e($error) ?></p><?php endif; ?>
  </form>

  <?php if ($result): ?>
    <div class="mt-8 rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="font-display text-xl text-brand-ink">#<?= e($result['orderNumber']) ?></p>
          <p class="text-xs text-black/50">Placed <?= format_date($result['createdAt']) ?> • <?= $result['itemCount'] ?> item<?= $result['itemCount'] > 1 ? 's' : '' ?> • <?= format_price($result['total']) ?></p>
          <?php if ($result['city']): ?><p class="text-xs text-black/50">Shipping to <?= e($result['city']) ?>, <?= e($result['state']) ?></p><?php endif; ?>
        </div>
        <?php $status = $result['status']; include __DIR__ . '/../Views/partials/order-status-badge.php'; ?>
      </div>
      <?php $history = $result['trackingHistory']; include __DIR__ . '/../Views/partials/order-tracking-timeline.php'; ?>
    </div>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/../Views/layout_close.php'; ?>
