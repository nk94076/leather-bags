<?php
declare(strict_types=1);

$redirectTo = $_POST['redirect'] ?? '/cart';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_verify()) {
    redirect($redirectTo);
}

$productId = (int) ($_POST['product_id'] ?? 0);
$quantity = max(1, (int) ($_POST['quantity'] ?? 1));
$color = $_POST['color'] ?? null;

$stmt = Database::pdo()->prepare(
    'SELECT p.*, pi.url AS image_url FROM products p
     LEFT JOIN product_images pi ON pi.product_id = p.id
     WHERE p.id = ? ORDER BY pi.sort_order ASC LIMIT 1'
);
$stmt->execute([$productId]);
$product = $stmt->fetch();

if (!$product || $product['stock'] <= 0) {
    flash_set('error', 'This product is currently unavailable.');
    redirect($redirectTo);
}

if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

$key = $productId . '-' . ($color ?: 'base');
if (isset($_SESSION['cart'][$key])) {
    $_SESSION['cart'][$key]['quantity'] = min((int) $product['stock'], $_SESSION['cart'][$key]['quantity'] + $quantity);
} else {
    $_SESSION['cart'][$key] = [
        'product_id' => $productId,
        'name' => $product['name'],
        'slug' => $product['slug'],
        'price' => (float) $product['price'],
        'image' => $product['image_url'] ?? '',
        'color' => $color,
        'quantity' => min((int) $product['stock'], $quantity),
        'stock' => (int) $product['stock'],
    ];
}

flash_set('success', $product['name'] . ' added to your bag.');
redirect($redirectTo);
