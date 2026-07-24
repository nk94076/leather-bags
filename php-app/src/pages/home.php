<?php
declare(strict_types=1);

$pdo = Database::pdo();
$categories = get_categories();
$sections = get_homepage_sections();
$authUser = Auth::user();

$wishlistedIds = [];
if ($authUser) {
    $rows = $pdo->prepare('SELECT product_id FROM wishlist_items WHERE user_id = ?');
    $rows->execute([$authUser['id']]);
    foreach ($rows->fetchAll() as $r) {
        $wishlistedIds[(int) $r['product_id']] = true;
    }
}

$heroBanners = get_banners('hero');
$promoLeft = get_banners('promo-left')[0] ?? null;
$promoRight = get_banners('promo-right')[0] ?? null;

function fetch_products(PDO $pdo, string $whereCol, int $limit): array
{
    $stmt = $pdo->prepare("SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p JOIN categories c ON c.id = p.category_id WHERE p.is_active = 1 AND p.{$whereCol} = 1 ORDER BY p.created_at DESC LIMIT ?");
    $stmt->bindValue(1, $limit, PDO::PARAM_INT);
    $stmt->execute();
    return array_map('decorate_product', $stmt->fetchAll());
}

$latestProducts = fetch_products($pdo, 'is_latest', 8);
$trendingProducts = fetch_products($pdo, 'is_trending', 8);

$reviewStmt = $pdo->prepare('SELECT r.*, p.name AS product_name FROM reviews r JOIN products p ON p.id = r.product_id WHERE r.status = "APPROVED" AND r.rating >= 4 ORDER BY r.created_at DESC LIMIT 9');
$reviewStmt->execute();
$reviews = $reviewStmt->fetchAll();

$isVisible = fn(string $key) => ($sections[$key]['is_visible'] ?? 1) == 1;

$pageTitle = '';
$canonicalPath = '/';
require __DIR__ . '/../Views/layout_open.php';
?>

<?php if ($heroBanners): $hero = $heroBanners[0]; ?>
<section class="relative h-[78vh] min-h-[520px] w-full overflow-hidden bg-brand-ink">
  <img src="<?= e($hero['image_url']) ?>" alt="<?= e($hero['title']) ?>" class="absolute inset-0 h-full w-full object-cover">
  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10"></div>
  <div class="relative z-10 flex h-full items-end pb-20 sm:items-center sm:pb-0">
    <div class="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
      <div class="max-w-xl">
        <span class="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">Corium Leather Co.</span>
        <h1 class="font-display text-4xl leading-[1.1] text-white sm:text-5xl lg:text-6xl"><?= e($hero['title']) ?></h1>
        <?php if ($hero['subtitle']): ?><p class="mt-5 max-w-md text-base text-white/80 sm:text-lg"><?= e($hero['subtitle']) ?></p><?php endif; ?>
        <div class="mt-8 flex flex-wrap items-center gap-4">
          <a href="<?= e(base_url($hero['cta_url'] ?? '/shop')) ?>" class="btn-primary">Shop Now</a>
          <a href="<?= e(base_url('/shop')) ?>" class="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-8 py-4 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-white hover:text-brand-ink">Explore Collection</a>
        </div>
      </div>
    </div>
  </div>
</section>
<?php endif; ?>

<?php if ($isVisible('categories')): ?>
<section class="py-16 sm:py-20">
  <div class="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
    <div class="mb-10 flex flex-col items-center gap-3 text-center">
      <span class="text-xs font-semibold uppercase tracking-[0.25em] text-brand-primary">Collections</span>
      <h2 class="font-display text-3xl font-medium text-brand-ink sm:text-4xl"><?= e($sections['categories']['title'] ?? 'Shop by Category') ?></h2>
      <?php if (!empty($sections['categories']['subtitle'])): ?><p class="max-w-2xl text-sm text-black/60 sm:text-base"><?= e($sections['categories']['subtitle']) ?></p><?php endif; ?>
    </div>
    <div class="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 md:grid-cols-4 lg:grid-cols-5">
      <?php foreach ($categories as $category): include __DIR__ . '/../Views/partials/category-card.php'; endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<?php if ($isVisible('latest-products') && $latestProducts): ?>
<section class="py-16 sm:py-20">
  <div class="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
    <div class="mb-10 flex flex-col items-center gap-3 text-center">
      <span class="text-xs font-semibold uppercase tracking-[0.25em] text-brand-primary">Just Arrived</span>
      <h2 class="font-display text-3xl font-medium text-brand-ink sm:text-4xl"><?= e($sections['latest-products']['title'] ?? 'Latest Arrivals') ?></h2>
      <?php if (!empty($sections['latest-products']['subtitle'])): ?><p class="max-w-2xl text-sm text-black/60 sm:text-base"><?= e($sections['latest-products']['subtitle']) ?></p><?php endif; ?>
    </div>
    <div class="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      <?php foreach ($latestProducts as $product): include __DIR__ . '/../Views/partials/product-card.php'; endforeach; ?>
    </div>
    <div class="mt-10 flex justify-center">
      <a href="<?= e(base_url('/shop?sort=latest')) ?>" class="btn-outline">View All</a>
    </div>
  </div>
</section>
<?php endif; ?>

<?php if ($isVisible('trending-products') && $trendingProducts): ?>
<section class="bg-brand-cream-dark/50 py-16 sm:py-20">
  <div class="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
    <div class="mb-10 flex flex-col items-center gap-3 text-center">
      <span class="text-xs font-semibold uppercase tracking-[0.25em] text-brand-primary">Trending</span>
      <h2 class="font-display text-3xl font-medium text-brand-ink sm:text-4xl"><?= e($sections['trending-products']['title'] ?? 'Trending Now') ?></h2>
    </div>
    <div class="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      <?php foreach ($trendingProducts as $product): include __DIR__ . '/../Views/partials/product-card.php'; endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<?php if ($isVisible('promo-banners') && ($promoLeft || $promoRight)): ?>
<section class="py-16 sm:py-20">
  <div class="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <?php foreach ([$promoLeft, $promoRight] as $b): if (!$b) continue; ?>
        <a href="<?= e(base_url($b['cta_url'] ?? '/shop')) ?>" class="group relative flex h-96 flex-col justify-end overflow-hidden rounded-2xl">
          <img src="<?= e($b['image_url']) ?>" alt="<?= e($b['title']) ?>" class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105">
          <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
          <div class="relative p-8">
            <h3 class="font-display text-2xl text-white sm:text-3xl"><?= e($b['title']) ?></h3>
            <?php if ($b['subtitle']): ?><p class="mt-2 max-w-xs text-sm text-white/80"><?= e($b['subtitle']) ?></p><?php endif; ?>
            <span class="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wide text-brand-ink transition group-hover:bg-brand-gold group-hover:text-white"><?= e($b['cta_label'] ?? 'Shop Now') ?></span>
          </div>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<?php if ($isVisible('why-choose-us')):
  $whyContent = json_decode_assoc($sections['why-choose-us']['content'] ?? null);
  $items = $whyContent['items'] ?? [];
  $icons = [
    'Gem' => '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
    'Hammer' => '<path d="M15 12l6 6M3 21l7-7"/><path d="m14 8 5-5 3 3-5 5"/>',
    'ShieldCheck' => '<path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
    'Truck' => '<path d="M3 7h13v9H3zM16 11h4l2 3v2h-6z"/><circle cx="7" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/>',
    'RefreshCw' => '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
    'Headphones' => '<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="3" y="14" width="5" height="7" rx="1.5"/><rect x="16" y="14" width="5" height="7" rx="1.5"/>',
  ];
  if ($items): ?>
<section class="bg-white py-16 sm:py-20">
  <div class="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
    <div class="mb-10 flex flex-col items-center gap-3 text-center">
      <span class="text-xs font-semibold uppercase tracking-[0.25em] text-brand-primary">Our Promise</span>
      <h2 class="font-display text-3xl font-medium text-brand-ink sm:text-4xl"><?= e($sections['why-choose-us']['title'] ?? 'Why Choose Corium') ?></h2>
    </div>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <?php foreach ($items as $item): ?>
        <div class="group flex flex-col items-start gap-4 rounded-2xl border border-black/5 p-7 transition hover:-translate-y-1 hover:shadow-luxury">
          <span class="flex h-14 w-14 items-center justify-center rounded-full bg-brand-cream text-brand-primary transition group-hover:bg-brand-primary group-hover:text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><?= $icons[$item['icon']] ?? $icons['Gem'] ?></svg>
          </span>
          <h3 class="font-display text-lg text-brand-ink"><?= e($item['title']) ?></h3>
          <p class="text-sm text-black/60"><?= e($item['text']) ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; endif; ?>

<?php if ($isVisible('reviews') && $reviews): ?>
<section class="py-16 sm:py-20">
  <div class="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
    <div class="mb-10 flex flex-col items-center gap-3 text-center">
      <span class="text-xs font-semibold uppercase tracking-[0.25em] text-brand-primary">Testimonials</span>
      <h2 class="font-display text-3xl font-medium text-brand-ink sm:text-4xl"><?= e($sections['reviews']['title'] ?? 'Loved by Our Customers') ?></h2>
    </div>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <?php foreach (array_slice($reviews, 0, 6) as $r): ?>
        <div class="flex h-full flex-col gap-4 rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#C9A24B"><path d="M9 7c-2.8 0-5 2.2-5 5v5h5v-5H6.5C6.5 10 7.5 9 9 9V7Zm10 0c-2.8 0-5 2.2-5 5v5h5v-5h-2.5c0-2 1-3 2.5-3V7Z"/></svg>
          <?php $ratingValue = (float) $r['rating']; unset($ratingCount); include __DIR__ . '/../Views/partials/rating.php'; ?>
          <p class="text-sm leading-relaxed text-black/70">&ldquo;<?= e($r['comment']) ?>&rdquo;</p>
          <div class="mt-auto flex items-center gap-3 pt-2">
            <img src="<?= e(placeholder_url('avatar', (string) $r['id'], 44, 44, $r['author_name'])) ?>" alt="<?= e($r['author_name']) ?>" class="h-11 w-11 rounded-full">
            <div>
              <p class="text-sm font-medium text-brand-ink"><?= e($r['author_name']) ?></p>
              <p class="text-xs text-black/50">Purchased <?= e($r['product_name']) ?></p>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<?php if ($isVisible('instagram')):
  $instaContent = json_decode_assoc($sections['instagram']['content'] ?? null);
  $instaImages = $instaContent['images'] ?? [];
  $social = get_setting('social', []);
  if ($instaImages): ?>
<section class="py-16 sm:py-20">
  <div class="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
    <div class="mb-10 flex flex-col items-center gap-3 text-center">
      <span class="text-xs font-semibold uppercase tracking-[0.25em] text-brand-primary">@corium.leather</span>
      <h2 class="font-display text-3xl font-medium text-brand-ink sm:text-4xl"><?= e($sections['instagram']['title'] ?? 'Follow @corium.leather') ?></h2>
    </div>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      <?php foreach ($instaImages as $img): ?>
        <a href="<?= e($social['instagram'] ?? '#') ?>" target="_blank" rel="noopener noreferrer" class="group relative block aspect-square overflow-hidden rounded-xl">
          <img src="<?= e($img) ?>" alt="Corium on Instagram" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110">
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; endif; ?>

<?php if ($isVisible('newsletter')): ?>
<section class="py-16 sm:py-20">
  <div class="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
    <div class="flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-br from-brand-secondary to-brand-ink px-6 py-16 text-center shadow-luxury">
      <span class="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">Stay in Touch</span>
      <h2 class="max-w-xl font-display text-3xl text-white sm:text-4xl"><?= e($sections['newsletter']['title'] ?? 'Join the Corium Circle') ?></h2>
      <?php if (!empty($sections['newsletter']['subtitle'])): ?><p class="max-w-md text-sm text-white/70"><?= e($sections['newsletter']['subtitle']) ?></p><?php endif; ?>
      <form action="<?= e(base_url('/newsletter/subscribe')) ?>" method="post" class="flex w-full max-w-md items-center gap-2">
        <?= csrf_field() ?>
        <input type="hidden" name="redirect" value="/">
        <input type="email" name="email" required placeholder="Enter your email address" class="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-brand-gold">
        <button type="submit" aria-label="Subscribe" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white transition hover:bg-brand-primary-dark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </form>
    </div>
  </div>
</section>
<?php endif; ?>

<?php require __DIR__ . '/../Views/layout_close.php'; ?>
