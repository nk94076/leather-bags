<?php
declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_verify()) {
    redirect('/admin/products');
}

$id = (int) $params['id'];
Database::pdo()->prepare('DELETE FROM products WHERE id = ?')->execute([$id]);

flash_set('success', 'Product deleted.');
redirect('/admin/products');
