<?php
declare(strict_types=1);

$redirectTo = $_POST['redirect'] ?? '/account/addresses';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_verify()) {
    redirect($redirectTo);
}

$authUser = Auth::user();
$addressId = (int) ($_POST['address_id'] ?? 0);

$pdo = Database::pdo();
$check = $pdo->prepare('SELECT id FROM addresses WHERE id = ? AND user_id = ?');
$check->execute([$addressId, $authUser['id']]);

if ($check->fetch()) {
    $pdo->prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?')->execute([$authUser['id']]);
    $pdo->prepare('UPDATE addresses SET is_default = 1 WHERE id = ?')->execute([$addressId]);
    flash_set('success', 'Default address updated.');
} else {
    flash_set('error', 'Could not update address.');
}

redirect($redirectTo);
