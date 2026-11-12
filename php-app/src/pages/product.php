<?php
declare(strict_types=1);

$slug = $params['slug'];
$product = get_product_by_slug($slug);

if (!$product) {
    http_response_code(404);
    require __DIR__ . '/../Views/pages/404.php';
    exit;
}

$pdo = Database::pdo();

$relatedStmt = $pdo->prepare(
    'SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p JOIN categories c ON c.id = p.category_id
     WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
     ORDER BY p.created_at DESC LIMIT 4'
);
$relatedStmt->execute([$product['category_id'], $product['id']]);
$related = array_map('decorate_product', $relatedStmt->fetchAll());

$reviewsStmt = $pdo->prepare(
    "SELECT * FROM reviews WHERE product_id = ? AND status = 'APPROVED' ORDER BY created_at DESC"
);
$reviewsStmt->execute([$product['id']]);
$reviews = $reviewsStmt->fetchAll();

$authUser = Auth::user();
$wishlistedIds = [];
$inWishlist = false;
if ($authUser) {
    $rows = $pdo->prepare('SELECT product_id FROM wishlist_items WHERE user_id = ?');
    $rows->execute([$authUser['id']]);
    foreach ($rows->fetchAll() as $r) {
        $wishlistedIds[(int) $r['product_id']] = true;
    }
    $inWishlist = !empty($wishlistedIds[$product['id']]);
}

$colors = $product['colors'] ?: [];
$images = $product['images'];
$discount = discount_percent((float) $product['price'], $product['compare_at_price'] !== null ? (float) $product['compare_at_price'] : null);
$shipping = get_setting('shipping');
$freeShippingThreshold = (float) ($shipping['freeShippingThreshold'] ?? 999);

$specs = [
    ['label' => 'Leather Type', 'value' => $product['leather_type']],
    ['label' => 'Dimensions', 'value' => $product['dimensions'] ?: '—'],
    ['label' => 'Weight', 'value' => $product['weight'] ?: '—'],
    ['label' => 'Warranty', 'value' => $product['warranty'] ?: '—'],
    ['label' => 'SKU', 'value' => $product['sku']],
    ['label' => 'Care Instructions', 'value' => $product['care_instructions'] ?: '—'],
];

$jsonLd = [[
    '@context' => 'https://schema.org',
    '@type' => 'Product',
    'name' => $product['name'],
    'image' => array_map(fn ($i) => $i['url'], $images),
    'description' => $product['short_description'],
    'sku' => $product['sku'],
    'brand' => ['@type' => 'Brand', 'name' => get_setting('general')['siteName'] ?? 'Corium'],
    'offers' => [
        '@type' => 'Offer',
        'url' => base_url('/product/' . $product['slug']),
        'priceCurrency' => 'INR',
        'price' => $product['price'],
        'availability' => $product['stock'] > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    ],
]];
if ((int) $product['review_count'] > 0) {
    $jsonLd[0]['aggregateRating'] = [
        '@type' => 'AggregateRating',
        'ratingValue' => (float) $product['avg_rating'],
        'reviewCount' => (int) $product['review_count'],
    ];
}

$pageTitle = $product['meta_title'] ?: $product['name'];
$pageDescription = $product['meta_desc'] ?: $product['short_description'];
$canonicalPath = '/product/' . $product['slug'];
require __DIR__ . '/../Views/layout_open.php';
?>
<div class="py-8 sm:py-12">
  <div class="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
    <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1.5 text-xs text-black/50">
      <a href="<?= e(base_url('/')) ?>" class="hover:text-brand-primary">Home</a>
      <span>›</span>
      <a href="<?= e(base_url('/shop')) ?>" class="hover:text-brand-primary">Shop</a>
      <span>›</span>
      <a href="<?= e(base_url('/shop/' . $product['category_slug'])) ?>" class="hover:text-brand-primary"><?= e($product['category_name']) ?></a>
      <span>›</span>
      <span class="text-brand-ink"><?= e($product['name']) ?></span>
    </nav>

    <div class="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
      <div class="flex flex-col-reverse gap-4 sm:flex-row">
        <div class="flex gap-3 overflow-x-auto sm:flex-col sm:overflow-visible">
          <?php foreach ($images as $i => $img): ?>
            <button type="button" data-gallery-thumb data-full-src="<?= e($img['url']) ?>" class="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 <?= $i === 0 ? 'border-brand-primary' : 'border-transparent opacity-70 hover:opacity-100' ?> transition sm:h-24 sm:w-20">
              <img src="<?= e($img['url']) ?>" alt="<?= e($img['alt_text']) ?>" class="h-full w-full object-cover">
            </button>
          <?php endforeach; ?>
        </div>
        <div data-zoom-wrap class="relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-brand-cream-dark">
          <img data-gallery-main src="<?= e($images[0]['url'] ?? '') ?>" alt="<?= e($product['name']) ?>" class="absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-out">
          <span class="absolute bottom-3 right-3 rounded-full bg-white/85 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-brand-ink sm:hidden">Tap to Zoom</span>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <div class="flex items-center justify-between">
          <a href="<?= e(base_url('/shop/' . $product['category_slug'])) ?>" class="text-xs font-semibold uppercase tracking-wider text-brand-primary"><?= e($product['category_name']) ?></a>
          <span class="text-xs text-black/40">SKU: <?= e($product['sku']) ?></span>
        </div>

        <h1 class="font-display text-3xl text-brand-ink sm:text-4xl"><?= e($product['name']) ?></h1>

        <div class="flex items-center gap-3">
          <?php $ratingValue = (float) $product['avg_rating']; $ratingCount = (int) $product['review_count']; include __DIR__ . '/../Views/partials/rating.php'; ?>
          <a href="#reviews" class="text-xs text-black/40 hover:underline">View reviews</a>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-2xl font-semibold text-brand-ink"><?= format_price((float) $product['price']) ?></span>
          <?php if ($product['compare_at_price'] && $product['compare_at_price'] > $product['price']): ?>
            <span class="text-lg text-black/40 line-through"><?= format_price((float) $product['compare_at_price']) ?></span>
            <span class="rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-semibold text-brand-gold">Save <?= $discount ?>%</span>
          <?php endif; ?>
        </div>

        <p class="text-sm leading-relaxed text-black/60"><?= e($product['short_description']) ?></p>
        <p class="text-xs text-black/50">Genuine <?= e($product['leather_type']) ?></p>

        <?php if (!empty($colors)): ?>
          <div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink">Colour: <span id="selected-color-label" class="font-normal text-black/50"><?= e($colors[0]['name'] ?? '') ?></span></p>
            <div data-color-select="selected-color" class="flex gap-2.5">
              <?php foreach ($colors as $i => $c): ?>
                <button type="button" data-color-value="<?= e($c['name']) ?>" title="<?= e($c['name']) ?>" class="h-9 w-9 rounded-full border-2 transition <?= $i === 0 ? 'border-transparent ring-2 ring-brand-primary scale-110' : 'border-transparent' ?>" style="background-color:<?= e($c['hex']) ?>"></button>
              <?php endforeach; ?>
            </div>
          </div>
        <?php endif; ?>

        <div>
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink">Quantity</p>
          <div class="flex items-center gap-4">
            <div class="flex items-center rounded-full border border-black/10">
              <button type="button" data-qty-decrease="qty-input" class="px-4 py-2.5" aria-label="Decrease quantity">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14" stroke-linecap="round"/></svg>
              </button>
              <input type="text" inputmode="numeric" id="qty-input" name="quantity" form="add-to-cart-form" value="1" data-max="<?= (int) $product['stock'] ?>" readonly class="w-8 border-0 bg-transparent text-center text-sm outline-none">
              <button type="button" data-qty-increase="qty-input" class="px-4 py-2.5" aria-label="Increase quantity">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
              </button>
            </div>
            <span class="text-xs font-medium <?= $product['stock'] > 0 ? 'text-green-700' : 'text-red-600' ?>"><?= $product['stock'] > 0 ? (int) $product['stock'] . ' in stock' : 'Out of Stock' ?></span>
          </div>
        </div>

        <form id="add-to-cart-form" action="<?= e(base_url('/cart/add')) ?>" method="post" class="flex flex-col gap-3 pt-2 sm:flex-row">
          <?= csrf_field() ?>
          <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
          <input type="hidden" id="selected-color" name="color" value="<?= e($colors[0]['name'] ?? '') ?>">
          <button type="submit" name="redirect" value="/product/<?= e($product['slug']) ?>" <?= $product['stock'] == 0 ? 'disabled' : '' ?> class="btn-primary flex-1">Add to Cart</button>
          <button type="submit" name="redirect" value="/checkout" <?= $product['stock'] == 0 ? 'disabled' : '' ?> class="btn-secondary flex-1">Buy Now</button>
        </form>
        <div class="flex gap-3">
          <form action="<?= e(base_url('/wishlist/toggle')) ?>" method="post">
            <?= csrf_field() ?>
            <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
            <input type="hidden" name="redirect" value="/product/<?= e($product['slug']) ?>">
            <button type="submit" aria-label="Toggle wishlist" class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/10 transition hover:bg-brand-cream <?= $inWishlist ? 'border-red-200 bg-red-50 text-red-500' : '' ?>">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="<?= $inWishlist ? 'currentColor' : 'none' ?>" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
            </button>
          </form>
          <button type="button" title="Share product" data-copy-link="<?= e(base_url('/product/' . $product['slug'])) ?>" aria-label="Share product" class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/10 transition hover:bg-brand-cream">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" stroke-linecap="round"/></svg>
          </button>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-3 rounded-2xl bg-brand-cream p-5 sm:grid-cols-3">
          <div class="flex items-center gap-2 text-xs text-black/60">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="shrink-0 text-brand-primary"><rect x="1" y="6" width="15" height="12" rx="1"/><path d="M16 10h4l3 3v5h-7z"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/></svg>
            Free shipping over <?= format_price($freeShippingThreshold) ?>
          </div>
          <div class="flex items-center gap-2 text-xs text-black/60">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="shrink-0 text-brand-primary"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            15-day easy returns
          </div>
          <div class="flex items-center gap-2 text-xs text-black/60">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="shrink-0 text-brand-primary"><path d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5z"/></svg>
            2-year warranty
          </div>
        </div>
      </div>
    </div>

    <div class="mt-16" id="reviews" data-tabs>
      <div class="flex gap-8 border-b border-black/10">
        <button type="button" data-tab-trigger="description" class="relative pb-4 text-sm font-medium uppercase tracking-wide text-brand-ink">
          Description
          <span data-tab-underline class="absolute inset-x-0 -bottom-px h-0.5 bg-brand-primary"></span>
        </button>
        <button type="button" data-tab-trigger="specs" class="relative pb-4 text-sm font-medium uppercase tracking-wide text-black/40 hover:text-black/60">
          Specifications
          <span data-tab-underline class="absolute inset-x-0 -bottom-px h-0.5 bg-brand-primary hidden"></span>
        </button>
        <button type="button" data-tab-trigger="reviews" class="relative pb-4 text-sm font-medium uppercase tracking-wide text-black/40 hover:text-black/60">
          Reviews (<?= count($reviews) ?>)
          <span data-tab-underline class="absolute inset-x-0 -bottom-px h-0.5 bg-brand-primary hidden"></span>
        </button>
      </div>

      <div class="py-8">
        <div data-tab-panel="description">
          <p class="max-w-3xl text-sm leading-relaxed text-black/70"><?= nl2br(e($product['description'])) ?></p>
        </div>
        <div data-tab-panel="specs" class="hidden">
          <dl class="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <?php foreach ($specs as $s): ?>
              <div class="flex justify-between border-b border-black/5 pb-3">
                <dt class="text-sm text-black/50"><?= e($s['label']) ?></dt>
                <dd class="text-sm font-medium text-brand-ink"><?= e($s['value']) ?></dd>
              </div>
            <?php endforeach; ?>
          </dl>
        </div>
        <div data-tab-panel="reviews" class="hidden">
          <div class="flex flex-col gap-8">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <span class="font-display text-3xl text-brand-ink"><?= number_format((float) $product['avg_rating'], 1) ?></span>
                <div>
                  <?php $ratingValue = (float) $product['avg_rating']; unset($ratingCount); include __DIR__ . '/../Views/partials/rating.php'; ?>
                  <p class="text-xs text-black/50">Based on <?= count($reviews) ?> reviews</p>
                </div>
              </div>
              <?php if ($authUser): ?>
                <button type="button" data-toggle-target="review-form" class="btn-outline btn-sm">Write a Review</button>
              <?php else: ?>
                <a href="<?= e(base_url('/login?callbackUrl=/product/' . $product['slug'] . '%23reviews')) ?>" class="btn-outline btn-sm">Sign In to Review</a>
              <?php endif; ?>
            </div>

            <?php if ($authUser): ?>
              <form id="review-form" action="<?= e(base_url('/review/submit')) ?>" method="post" class="hidden flex flex-col gap-4 rounded-2xl border border-black/10 p-6">
                <?= csrf_field() ?>
                <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
                <input type="hidden" name="slug" value="<?= e($product['slug']) ?>">
                <div>
                  <p class="mb-2 text-xs font-semibold uppercase tracking-wide">Your Rating</p>
                  <div data-star-rating="review-rating" class="flex gap-1">
                    <?php for ($i = 1; $i <= 5; $i++): ?>
                      <button type="button" data-star-value="<?= $i ?>" aria-label="Rate <?= $i ?> stars">
                        <svg data-star-icon width="22" height="22" viewBox="0 0 24 24" fill="#C9A24B" stroke="currentColor" stroke-width="1.5" class="text-brand-gold"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z" stroke-linejoin="round"/></svg>
                      </button>
                    <?php endfor; ?>
                  </div>
                  <input type="hidden" id="review-rating" name="rating" value="5">
                </div>
                <input required name="title" maxlength="120" placeholder="Review title" class="input-field">
                <textarea required name="comment" placeholder="Share your experience with this product..." rows="4" minlength="10" maxlength="1000" class="input-field"></textarea>
                <button type="submit" class="btn-primary self-start">Submit Review</button>
              </form>
            <?php endif; ?>

            <div class="flex flex-col gap-6">
              <?php if (empty($reviews)): ?>
                <p class="text-sm text-black/50">No reviews yet. Be the first to review this product.</p>
              <?php endif; ?>
              <?php foreach ($reviews as $r): ?>
                <div class="flex gap-4 border-b border-black/5 pb-6">
                  <img src="<?= e(placeholder_url('avatar', (string) $r['id'], 44, 44, $r['author_name'])) ?>" alt="<?= e($r['author_name']) ?>" class="h-11 w-11 shrink-0 rounded-full">
                  <div class="flex-1">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <p class="text-sm font-semibold text-brand-ink"><?= e($r['author_name']) ?></p>
                      <span class="text-xs text-black/40"><?= format_date($r['created_at']) ?></span>
                    </div>
                    <?php $ratingValue = (float) $r['rating']; unset($ratingCount); include __DIR__ . '/../Views/partials/rating.php'; ?>
                    <p class="mt-1 text-sm font-medium text-brand-ink"><?= e($r['title']) ?></p>
                    <p class="mt-1 text-sm text-black/60"><?= e($r['comment']) ?></p>
                    <?php if (!empty($r['admin_reply'])): ?>
                      <div class="mt-3 rounded-xl bg-brand-cream p-3 text-xs text-black/60">
                        <span class="font-semibold text-brand-ink">Corium Team: </span><?= e($r['admin_reply']) ?>
                      </div>
                    <?php endif; ?>
                  </div>
                </div>
              <?php endforeach; ?>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <?php if (!empty($related)): ?>
    <div class="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10">
      <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span class="text-xs font-semibold uppercase tracking-[0.25em] text-brand-primary">You May Also Like</span>
          <h2 class="mt-2 font-display text-2xl text-brand-ink sm:text-3xl">Related Products</h2>
        </div>
        <a href="<?= e(base_url('/shop/' . $product['category_slug'])) ?>" class="text-xs font-semibold uppercase tracking-wide text-brand-primary hover:underline">View All →</a>
      </div>
      <div class="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        <?php foreach ($related as $product): include __DIR__ . '/../Views/partials/product-card.php'; endforeach; ?>
      </div>
    </div>
  <?php endif; ?>
</div>
<?php
require __DIR__ . '/../Views/layout_close.php';
