<?php
declare(strict_types=1);

function admin_recompute_product_rating(PDO $pdo, int $productId): void
{
    $stmt = $pdo->prepare("SELECT AVG(rating) AS avg_rating, COUNT(*) AS c FROM reviews WHERE product_id = ? AND status = 'APPROVED'");
    $stmt->execute([$productId]);
    $agg = $stmt->fetch();
    $avg = $agg['avg_rating'] !== null ? round((float) $agg['avg_rating'], 1) : 0.0;
    $pdo->prepare('UPDATE products SET avg_rating = ?, review_count = ? WHERE id = ?')
        ->execute([$avg, (int) $agg['c'], $productId]);
}

$pdo = Database::pdo();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && csrf_verify()) {
    $reviewId = (int) ($_POST['review_id'] ?? 0);
    $action = $_POST['action'] ?? '';

    $rStmt = $pdo->prepare('SELECT * FROM reviews WHERE id = ?');
    $rStmt->execute([$reviewId]);
    $review = $rStmt->fetch();

    if ($review) {
        if ($action === 'approve' || $action === 'reject') {
            $newStatus = $action === 'approve' ? 'APPROVED' : 'REJECTED';
            $pdo->prepare('UPDATE reviews SET status = ? WHERE id = ?')->execute([$newStatus, $reviewId]);
            admin_recompute_product_rating($pdo, (int) $review['product_id']);
            flash_set('success', 'Review ' . strtolower($newStatus) . '.');
        } elseif ($action === 'reply') {
            $reply = trim((string) ($_POST['admin_reply'] ?? ''));
            $pdo->prepare('UPDATE reviews SET admin_reply = ? WHERE id = ?')->execute([$reply ?: null, $reviewId]);
            flash_set('success', 'Reply saved.');
        } elseif ($action === 'delete') {
            $pdo->prepare('DELETE FROM reviews WHERE id = ?')->execute([$reviewId]);
            admin_recompute_product_rating($pdo, (int) $review['product_id']);
            flash_set('success', 'Review deleted.');
        }
    }
    redirect('/admin/reviews' . (isset($_GET['status']) ? '?status=' . urlencode($_GET['status']) : ''));
}

$statusFilter = $_GET['status'] ?? '';
$where = '';
$bind = [];
if (in_array($statusFilter, ['PENDING', 'APPROVED', 'REJECTED'], true)) {
    $where = 'WHERE r.status = ?';
    $bind = [$statusFilter];
}

$stmt = $pdo->prepare(
    "SELECT r.*, p.name AS product_name, p.slug AS product_slug FROM reviews r
     JOIN products p ON p.id = r.product_id
     $where ORDER BY r.created_at DESC LIMIT 100"
);
$stmt->execute($bind);
$reviews = $stmt->fetchAll();

$badgeClass = ['PENDING' => 'bg-brand-gold text-white', 'APPROVED' => 'border border-black/10 bg-white text-brand-ink', 'REJECTED' => 'bg-brand-ink text-white'];

$pageTitle = 'Reviews';
$activeAdminPath = '/admin/reviews';
require __DIR__ . '/../../../Views/admin_shell_open.php';
?>
<div class="mb-6">
  <h1 class="font-display text-2xl text-brand-ink sm:text-3xl">Reviews</h1>
  <p class="mt-1 text-sm text-black/50"><?= count($reviews) ?> reviews</p>
</div>

<div class="mb-5 flex flex-wrap gap-2">
  <?php foreach (['' => 'All', 'PENDING' => 'PENDING', 'APPROVED' => 'APPROVED', 'REJECTED' => 'REJECTED'] as $val => $label): ?>
    <a href="<?= e(base_url('/admin/reviews')) ?><?= $val ? '?status=' . $val : '' ?>" class="rounded-full px-3 py-1.5 text-xs font-medium <?= $statusFilter === $val ? 'bg-brand-ink text-white' : 'border border-black/10 text-black/60' ?>"><?= e($label) ?></a>
  <?php endforeach; ?>
</div>

<div class="overflow-x-auto rounded-2xl border border-black/5 bg-white">
  <table class="w-full min-w-[880px] text-left text-sm">
    <thead>
      <tr>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Product</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Review</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Rating</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Date</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Status</th>
        <th class="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40">Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($reviews as $r): $panelId = 'reply-' . $r['id']; ?>
        <tr class="hover:bg-brand-cream/40">
          <td class="border-b border-black/5 px-4 py-3.5 align-top">
            <a href="<?= e(base_url('/product/' . $r['product_slug'])) ?>" class="text-brand-primary hover:underline"><?= e($r['product_name']) ?></a>
          </td>
          <td class="max-w-[280px] border-b border-black/5 px-4 py-3.5 align-top">
            <p class="font-medium text-brand-ink"><?= e($r['title']) ?></p>
            <p class="line-clamp-2 text-xs text-black/50"><?= e($r['comment']) ?></p>
            <p class="mt-1 text-xs text-black/40">— <?= e($r['author_name']) ?></p>
            <?php if (!empty($r['admin_reply'])): ?><p class="mt-1 text-xs italic text-brand-primary">Reply: <?= e($r['admin_reply']) ?></p><?php endif; ?>
          </td>
          <td class="border-b border-black/5 px-4 py-3.5 align-top">
            <?php $ratingValue = (float) $r['rating']; unset($ratingCount); include __DIR__ . '/../../../Views/partials/rating.php'; ?>
          </td>
          <td class="border-b border-black/5 px-4 py-3.5 align-top text-black/50"><?= format_date($r['created_at']) ?></td>
          <td class="border-b border-black/5 px-4 py-3.5 align-top">
            <span class="badge <?= $badgeClass[$r['status']] ?? '' ?>"><?= e($r['status']) ?></span>
          </td>
          <td class="border-b border-black/5 px-4 py-3.5 align-top">
            <div class="flex flex-col gap-2">
              <div class="flex flex-wrap items-center gap-3">
                <?php if ($r['status'] !== 'APPROVED'): ?>
                  <form action="<?= e(base_url('/admin/reviews')) ?>" method="post">
                    <?= csrf_field() ?>
                    <input type="hidden" name="review_id" value="<?= (int) $r['id'] ?>">
                    <input type="hidden" name="action" value="approve">
                    <button type="submit" class="text-xs font-medium text-green-700 hover:underline">Approve</button>
                  </form>
                <?php endif; ?>
                <?php if ($r['status'] !== 'REJECTED'): ?>
                  <form action="<?= e(base_url('/admin/reviews')) ?>" method="post">
                    <?= csrf_field() ?>
                    <input type="hidden" name="review_id" value="<?= (int) $r['id'] ?>">
                    <input type="hidden" name="action" value="reject">
                    <button type="submit" class="text-xs font-medium text-red-600 hover:underline">Reject</button>
                  </form>
                <?php endif; ?>
                <button type="button" data-toggle-target="<?= e($panelId) ?>" class="text-xs font-medium text-brand-primary hover:underline">Reply</button>
                <form action="<?= e(base_url('/admin/reviews')) ?>" method="post" data-confirm="Delete this review?">
                  <?= csrf_field() ?>
                  <input type="hidden" name="review_id" value="<?= (int) $r['id'] ?>">
                  <input type="hidden" name="action" value="delete">
                  <button type="submit" class="text-black/40 hover:text-red-600" aria-label="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                </form>
              </div>
              <form id="<?= e($panelId) ?>" action="<?= e(base_url('/admin/reviews')) ?>" method="post" class="hidden flex gap-2">
                <?= csrf_field() ?>
                <input type="hidden" name="review_id" value="<?= (int) $r['id'] ?>">
                <input type="hidden" name="action" value="reply">
                <input name="admin_reply" value="<?= e($r['admin_reply'] ?? '') ?>" placeholder="Write a reply..." class="w-full rounded-lg border border-black/10 px-3 py-1.5 text-xs">
                <button type="submit" class="shrink-0 rounded-lg bg-brand-ink px-3 py-1.5 text-xs text-white">Save</button>
              </form>
            </div>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php require __DIR__ . '/../../../Views/admin_shell_close.php'; ?>
