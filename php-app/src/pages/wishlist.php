<?php
declare(strict_types=1);

$pageTitle = 'My Wishlist';
$canonicalPath = '/wishlist';
$noindex = true;
$authUser = Auth::user();

require __DIR__ . '/../Views/layout_open.php';
?>
<div class="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
  <?php if (!$authUser): ?>
    <div class="flex flex-col items-center gap-4 py-24 text-center">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-black/20"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
      <p class="font-display text-xl text-brand-ink">Sign in to view your wishlist</p>
      <p class="text-sm text-black/50">Save your favourite pieces and pick up where you left off.</p>
      <a href="<?= e(base_url('/login?callbackUrl=/wishlist')) ?>" class="btn-primary mt-2">Sign In</a>
    </div>
  <?php else: ?>
    <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1.5 text-xs text-black/50">
      <a href="<?= e(base_url('/')) ?>" class="hover:text-brand-primary">Home</a>
      <span>›</span>
      <span class="text-brand-ink">Wishlist</span>
    </nav>
    <h1 class="mb-10 mt-4 font-display text-3xl text-brand-ink sm:text-4xl">My Wishlist</h1>

    <?php
    $stmt = Database::pdo()->prepare(
        'SELECT p.*, c.name AS category_name, c.slug AS category_slug
         FROM wishlist_items w
         JOIN products p ON p.id = w.product_id
         JOIN categories c ON c.id = p.category_id
         WHERE w.user_id = ? AND p.is_active = 1
         ORDER BY w.created_at DESC'
    );
    $stmt->execute([$authUser['id']]);
    $products = array_map('decorate_product', $stmt->fetchAll());
    $wishlistedIds = array_fill_keys(array_column($products, 'id'), true);
    ?>

    <?php if (empty($products)): ?>
      <div class="flex flex-col items-center gap-4 py-16 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-black/20"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
        <p class="font-display text-xl text-brand-ink">Your wishlist is empty</p>
        <p class="text-sm text-black/50">Tap the heart icon on any product to save it here.</p>
        <a href="<?= e(base_url('/shop')) ?>" class="btn-primary mt-2">Explore Products</a>
      </div>
    <?php else: ?>
      <div class="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
        <?php foreach ($products as $product): include __DIR__ . '/../Views/partials/product-card.php'; endforeach; ?>
      </div>
    <?php endif; ?>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/../Views/layout_close.php'; ?>
