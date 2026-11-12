<?php
declare(strict_types=1);

$redirectTo = $_POST['redirect'] ?? '/wishlist';
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_verify()) {
    redirect($redirectTo);
}

$authUser = Auth::user();
if (!$authUser) {
    flash_set('error', 'Please sign in to save items to your wishlist.');
    redirect('/login?callbackUrl=' . urlencode($redirectTo));
}

$productId = (int) ($_POST['product_id'] ?? 0);
$pdo = Database::pdo();

$stmt = $pdo->prepare('SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?');
$stmt->execute([$authUser['id'], $productId]);
$existing = $stmt->fetch();

if ($existing) {
    $pdo->prepare('DELETE FROM wishlist_items WHERE id = ?')->execute([$existing['id']]);
    flash_set('success', 'Removed from wishlist.');
} else {
    $pdo->prepare('INSERT INTO wishlist_items (user_id, product_id) VALUES (?,?)')->execute([$authUser['id'], $productId]);
    flash_set('success', 'Added to wishlist.');
}

redirect($redirectTo);
