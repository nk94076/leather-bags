<?php
declare(strict_types=1);

$productId = (int) ($_POST['product_id'] ?? 0);
$slug = $_POST['slug'] ?? '';
$redirectTo = $slug ? '/product/' . $slug . '#reviews' : '/';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_verify()) {
    redirect($redirectTo);
}

$rating = max(1, min(5, (int) ($_POST['rating'] ?? 5)));
$title = trim((string) ($_POST['title'] ?? ''));
$comment = trim((string) ($_POST['comment'] ?? ''));

if ($productId <= 0 || mb_strlen($title) < 2 || mb_strlen($comment) < 10) {
    flash_set('error', 'Please provide a valid title (2+ chars) and comment (10+ chars).');
    redirect($redirectTo);
}

$stmt = Database::pdo()->prepare('SELECT id FROM products WHERE id = ?');
$stmt->execute([$productId]);
if (!$stmt->fetch()) {
    flash_set('error', 'Product not found.');
    redirect($redirectTo);
}

$user = Auth::user();

$insert = Database::pdo()->prepare(
    'INSERT INTO reviews (product_id, user_id, author_name, rating, title, comment, status)
     VALUES (?, ?, ?, ?, ?, ?, "PENDING")'
);
$insert->execute([$productId, $user['id'], $user['name'] ?? 'Anonymous', $rating, $title, $comment]);

flash_set('success', 'Thanks! Your review is pending approval.');
redirect($redirectTo);
