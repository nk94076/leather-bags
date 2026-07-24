<?php
declare(strict_types=1);

$categories = get_categories();

$filters = [
    'q' => $_GET['q'] ?? '',
    'category' => implode(',', (array) ($_GET['category'] ?? [])),
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

$basePath = '/shop';
$lockedCategory = null;

$pageTitle = $filters['q'] ? 'Search results for "' . $filters['q'] . '"' : 'Shop All Leather Bags';
$pageDescription = 'Browse our full collection of premium genuine leather bags, backpacks, wallets and accessories.';
$canonicalPath = '/shop';
require __DIR__ . '/../Views/layout_open.php';
require __DIR__ . '/../Views/partials/shop-content.php';
require __DIR__ . '/../Views/layout_close.php';
