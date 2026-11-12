<?php
declare(strict_types=1);

$categorySlug = $params['category'];
$category = get_category_by_slug($categorySlug);

if (!$category) {
    http_response_code(404);
    require __DIR__ . '/../Views/pages/404.php';
    exit;
}

$categories = get_categories();

$filters = [
    'q' => $_GET['q'] ?? '',
    'category' => $categorySlug,
    'material' => implode(',', (array) ($_GET['material'] ?? [])),
    'color' => implode(',', (array) ($_GET['color'] ?? [])),
    'availability' => $_GET['availability'] ?? '',
    'rating' => $_GET['rating'] ?? '',
    'minPrice' => $_GET['minPrice'] ?? '',
    'maxPrice' => $_GET['maxPrice'] ?? '',
    'sort' => $_GET['sort'] ?? '',
    'page' => $_GET['page'] ?? '1',
];

$result = get_shop_products($filters);
$view = ($_GET['view'] ?? 'grid') === 'list' ? 'list' : 'grid';

$authUser = Auth::user();
$wishlistedIds = [];
if ($authUser) {
    $rows = Database::pdo()->prepare('SELECT product_id FROM wishlist_items WHERE user_id = ?');
    $rows->execute([$authUser['id']]);
    foreach ($rows->fetchAll() as $r) {
        $wishlistedIds[(int) $r['product_id']] = true;
    }
}

$basePath = '/shop/' . $category['slug'];
$lockedCategory = $category['slug'];
$skipHeading = true;

$pageTitle = $category['meta_title'] ?: ($category['name'] . ' | Genuine Leather');
$pageDescription = $category['meta_desc'] ?: $category['description'];
$canonicalPath = '/shop/' . $category['slug'];
require __DIR__ . '/../Views/layout_open.php';
?>
<div class="relative flex h-64 items-end overflow-hidden bg-brand-ink sm:h-80">
  <?php $bannerImg = $category['banner_url'] ?: $category['image_url']; if ($bannerImg): ?>
    <img src="<?= e($bannerImg) ?>" alt="<?= e($category['name']) ?>" class="absolute inset-0 h-full w-full object-cover">
  <?php endif; ?>
  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"></div>
  <div class="relative mx-auto w-full max-w-[1400px] px-4 pb-10 sm:px-6 lg:px-10">
    <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1.5 text-xs text-white/70">
      <a href="<?= e(base_url('/')) ?>" class="hover:text-white">Home</a>
      <span>›</span>
      <a href="<?= e(base_url('/shop')) ?>" class="hover:text-white">Shop</a>
      <span>›</span>
      <span class="text-white"><?= e($category['name']) ?></span>
    </nav>
    <h1 class="mt-3 font-display text-4xl text-white sm:text-5xl"><?= e($category['name']) ?></h1>
    <p class="mt-3 max-w-xl text-sm text-white/75 sm:text-base"><?= e($category['description']) ?></p>
  </div>
</div>

<?php
require __DIR__ . '/../Views/partials/shop-content.php';
require __DIR__ . '/../Views/layout_close.php';
