<?php
/** Expects $product (array) and optional $wishlistedIds (array<int,bool>) in scope. */
$discount = discount_percent((float) $product['price'], $product['compare_at_price'] !== null ? (float) $product['compare_at_price'] : null);
$image = $product['images'][0] ?? null;
$hoverImage = $product['images'][1] ?? $image;
$inWishlist = isset($wishlistedIds) && !empty($wishlistedIds[$product['id']]);
$currentUri = $_SERVER['REQUEST_URI'] ?? '/';
?>
<div class="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-luxury">
  <a href="<?= e(base_url('/product/' . $product['slug'])) ?>" class="relative block aspect-[4/5] overflow-hidden bg-brand-cream-dark">
    <?php if ($image): ?>
      <img src="<?= e($image['url']) ?>" alt="<?= e($image['alt_text']) ?>" class="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0" loading="lazy">
      <img src="<?= e($hoverImage['url']) ?>" alt="<?= e($hoverImage['alt_text']) ?>" class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" loading="lazy">
    <?php endif; ?>

    <div class="absolute left-3 top-3 flex flex-col gap-2">
      <?php if ($discount > 0): ?><span class="badge bg-brand-gold text-white"><?= $discount ?>% Off</span><?php endif; ?>
      <?php if (!empty($product['is_trending'])): ?><span class="badge bg-brand-secondary text-white">Trending</span><?php endif; ?>
      <?php if (!empty($product['is_latest'])): ?><span class="badge border border-brand-secondary/30 bg-white/70 text-brand-secondary">New</span><?php endif; ?>
    </div>
  </a>

  <form action="<?= e(base_url('/wishlist/toggle')) ?>" method="post" class="absolute right-3 top-3">
    <?= csrf_field() ?>
    <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
    <input type="hidden" name="redirect" value="<?= e($currentUri) ?>">
    <button type="submit" aria-label="Toggle wishlist" class="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white <?= $inWishlist ? 'text-red-500' : 'text-brand-ink' ?>">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="<?= $inWishlist ? 'currentColor' : 'none' ?>" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
    </button>
  </form>

  <form action="<?= e(base_url('/cart/add')) ?>" method="post" class="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
    <?= csrf_field() ?>
    <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
    <input type="hidden" name="quantity" value="1">
    <input type="hidden" name="redirect" value="<?= e($currentUri) ?>">
    <button type="submit" <?= $product['stock'] == 0 ? 'disabled' : '' ?> class="flex w-full items-center justify-center gap-2 rounded-full bg-brand-ink py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-brand-secondary disabled:opacity-50">
      <?= $product['stock'] == 0 ? 'Sold Out' : 'Add to Cart' ?>
    </button>
  </form>

  <div class="flex flex-1 flex-col gap-1.5 p-4">
    <span class="text-[11px] font-medium uppercase tracking-wider text-brand-primary"><?= e($product['category_name'] ?? '') ?></span>
    <a href="<?= e(base_url('/product/' . $product['slug'])) ?>" class="line-clamp-1 font-display text-base font-medium text-brand-ink"><?= e($product['name']) ?></a>
    <?php $ratingValue = (float) $product['avg_rating']; $ratingCount = (int) $product['review_count']; include __DIR__ . '/rating.php'; ?>
    <div class="mt-1 flex items-center gap-2">
      <span class="font-semibold text-brand-ink"><?= format_price((float) $product['price']) ?></span>
      <?php if ($product['compare_at_price'] && $product['compare_at_price'] > $product['price']): ?>
        <span class="text-sm text-black/40 line-through"><?= format_price((float) $product['compare_at_price']) ?></span>
      <?php endif; ?>
    </div>
  </div>
</div>
