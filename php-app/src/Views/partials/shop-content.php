<?php
/**
 * Expects: $categories, $result (products/total/totalPages/page), $view, $wishlistedIds,
 * $basePath, $lockedCategory in scope.
 */
?>
<div class="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
  <?php if (!isset($skipHeading)): ?>
    <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1.5 text-xs text-black/50">
      <a href="<?= e(base_url('/')) ?>" class="hover:text-brand-primary">Home</a>
      <span>›</span>
      <span class="text-brand-ink">Shop</span>
    </nav>
    <div class="mb-10 mt-4 flex flex-col gap-3 text-left">
      <span class="text-xs font-semibold uppercase tracking-[0.25em] text-brand-primary">The Full Collection</span>
      <h1 class="font-display text-3xl font-medium text-brand-ink sm:text-4xl"><?= e($pageTitle) ?></h1>
      <p class="max-w-2xl text-sm text-black/60 sm:text-base">Genuine leather bags, backpacks, wallets and accessories — handcrafted for daily life.</p>
    </div>
  <?php endif; ?>

  <div class="flex flex-col gap-8 lg:flex-row">
    <?php include __DIR__ . '/filter-sidebar.php'; ?>

    <div class="flex-1">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-6">
        <p class="text-sm text-black/50"><?= (int) $result['total'] ?> products</p>
        <div class="flex items-center gap-3">
          <form method="get" action="<?= e(base_url($basePath)) ?>" id="sort-form">
            <?php foreach ($_GET as $k => $v) {
                if ($k === 'sort' || $k === 'page') continue;
                foreach ((array) $v as $vv) {
                    echo '<input type="hidden" name="' . e($k . (is_array($v) ? '[]' : '')) . '" value="' . e((string) $vv) . '">';
                }
            } ?>
            <select name="sort" onchange="this.form.submit()" class="rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-wide outline-none">
              <?php foreach (SORT_OPTIONS as $val => $label): ?>
                <option value="<?= e($val) ?>" <?= ($_GET['sort'] ?? 'featured') === $val ? 'selected' : '' ?>><?= e($label) ?></option>
              <?php endforeach; ?>
            </select>
          </form>
          <div class="hidden items-center gap-1 rounded-full border border-black/10 p-1 sm:flex">
            <a href="<?= e(base_url($basePath)) ?>?<?= current_url_query(['view' => 'grid']) ?>" class="flex h-8 w-8 items-center justify-center rounded-full <?= $view === 'grid' ? 'bg-brand-ink text-white' : '' ?>" aria-label="Grid view">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </a>
            <a href="<?= e(base_url($basePath)) ?>?<?= current_url_query(['view' => 'list']) ?>" class="flex h-8 w-8 items-center justify-center rounded-full <?= $view === 'list' ? 'bg-brand-ink text-white' : '' ?>" aria-label="List view">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke-linecap="round"/></svg>
            </a>
          </div>
        </div>
      </div>

      <?php if (empty($result['products'])): ?>
        <div class="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <p class="font-display text-xl text-brand-ink">No products found</p>
          <p class="text-sm text-black/50">Try adjusting your filters or search terms.</p>
        </div>
      <?php elseif ($view === 'list'): ?>
        <div class="flex flex-col gap-4">
          <?php foreach ($result['products'] as $product): ?>
            <?php $discount = discount_percent((float) $product['price'], $product['compare_at_price'] !== null ? (float) $product['compare_at_price'] : null); $image = $product['images'][0] ?? null; ?>
            <div class="flex gap-5 rounded-2xl border border-black/5 bg-white p-4 transition hover:shadow-luxury sm:gap-6 sm:p-5">
              <a href="<?= e(base_url('/product/' . $product['slug'])) ?>" class="relative w-32 shrink-0 overflow-hidden rounded-xl bg-brand-cream-dark sm:w-44" style="aspect-ratio:4/5">
                <?php if ($image): ?><img src="<?= e($image['url']) ?>" alt="<?= e($image['alt_text']) ?>" class="h-full w-full object-cover"><?php endif; ?>
                <?php if ($discount > 0): ?><span class="badge absolute left-2 top-2 bg-brand-gold text-white"><?= $discount ?>% Off</span><?php endif; ?>
              </a>
              <div class="flex flex-1 flex-col">
                <span class="text-[11px] font-medium uppercase tracking-wider text-brand-primary"><?= e($product['category_name']) ?></span>
                <a href="<?= e(base_url('/product/' . $product['slug'])) ?>" class="mt-1 font-display text-lg text-brand-ink hover:text-brand-primary"><?= e($product['name']) ?></a>
                <?php $ratingValue = (float) $product['avg_rating']; $ratingCount = (int) $product['review_count']; include __DIR__ . '/rating.php'; ?>
                <div class="mt-2 flex items-center gap-2">
                  <span class="text-lg font-semibold text-brand-ink"><?= format_price((float) $product['price']) ?></span>
                  <?php if ($product['compare_at_price'] && $product['compare_at_price'] > $product['price']): ?><span class="text-sm text-black/40 line-through"><?= format_price((float) $product['compare_at_price']) ?></span><?php endif; ?>
                </div>
                <div class="mt-auto flex flex-wrap gap-2 pt-3">
                  <form action="<?= e(base_url('/cart/add')) ?>" method="post">
                    <?= csrf_field() ?>
                    <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
                    <input type="hidden" name="quantity" value="1">
                    <input type="hidden" name="redirect" value="<?= e($_SERVER['REQUEST_URI']) ?>">
                    <button type="submit" <?= $product['stock'] == 0 ? 'disabled' : '' ?> class="rounded-full bg-brand-ink px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-brand-secondary disabled:opacity-50"><?= $product['stock'] == 0 ? 'Sold Out' : 'Add to Cart' ?></button>
                  </form>
                  <a href="<?= e(base_url('/product/' . $product['slug'])) ?>" class="rounded-full border border-black/10 px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-brand-ink transition hover:bg-brand-cream">View Details</a>
                </div>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      <?php else: ?>
        <div class="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
          <?php foreach ($result['products'] as $product): include __DIR__ . '/product-card.php'; endforeach; ?>
        </div>
      <?php endif; ?>

      <?php if ($result['totalPages'] > 1): ?>
        <nav class="mt-12 flex items-center justify-center gap-2">
          <?php for ($p = 1; $p <= $result['totalPages']; $p++): ?>
            <a href="<?= e(base_url($basePath)) ?>?<?= current_url_query(['page' => $p > 1 ? $p : null]) ?>" class="flex h-10 w-10 items-center justify-center rounded-full border text-sm <?= $p === $result['page'] ? 'border-brand-primary bg-brand-primary text-white' : 'border-black/10 hover:bg-brand-cream' ?>"><?= $p ?></a>
          <?php endfor; ?>
        </nav>
      <?php endif; ?>
    </div>
  </div>
</div>
