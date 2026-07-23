<?php
declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_verify()) {
    redirect('/admin/categories');
}

$id = (int) $params['id'];

$countStmt = Database::pdo()->prepare('SELECT COUNT(*) AS c FROM products WHERE category_id = ?');
$countStmt->execute([$id]);
if ((int) $countStmt->fetch()['c'] > 0) {
    flash_set('error', 'Cannot delete a category that still has products. Move or delete its products first.');
    redirect('/admin/categories');
}

Database::pdo()->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
flash_set('success', 'Category deleted.');
redirect('/admin/categories');
