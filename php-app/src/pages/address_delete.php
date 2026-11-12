<?php
declare(strict_types=1);

$redirectTo = $_POST['redirect'] ?? '/account/addresses';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_verify()) {
    redirect($redirectTo);
}

$authUser = Auth::user();
$addressId = (int) ($_POST['address_id'] ?? 0);

$pdo = Database::pdo();
$stmt = $pdo->prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?');
$stmt->execute([$addressId, $authUser['id']]);

flash_set('success', 'Address removed.');
redirect($redirectTo);
