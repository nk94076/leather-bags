<?php
declare(strict_types=1);

$q = trim((string) ($_GET['q'] ?? ''));
header('Content-Type: application/json');

if (strlen($q) < 2) {
    echo json_encode(['products' => [], 'categories' => []]);
    exit;
}

$pdo = Database::pdo();
$like = '%' . $q . '%';

$prodStmt = $pdo->prepare('SELECT p.id, p.name, p.slug, p.price, pi.url AS image FROM products p LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.sort_order = 0 WHERE p.is_active = 1 AND p.name LIKE ? LIMIT 5');
$prodStmt->execute([$like]);
$products = array_map(function ($p) {
    $p['priceFormatted'] = format_price((float) $p['price']);
    return $p;
}, $prodStmt->fetchAll());

$catStmt = $pdo->prepare('SELECT name, slug FROM categories WHERE name LIKE ? LIMIT 3');
$catStmt->execute([$like]);
$categories = $catStmt->fetchAll();

echo json_encode(['products' => $products, 'categories' => $categories]);
