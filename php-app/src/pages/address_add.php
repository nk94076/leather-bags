<?php
declare(strict_types=1);

$redirectTo = $_POST['redirect'] ?? '/checkout';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_verify()) {
    redirect($redirectTo);
}

$authUser = Auth::user();
$pdo = Database::pdo();

$label = trim((string) ($_POST['label'] ?? 'Home'));
$fullName = trim((string) ($_POST['full_name'] ?? ''));
$phone = trim((string) ($_POST['phone'] ?? ''));
$line1 = trim((string) ($_POST['line1'] ?? ''));
$line2 = trim((string) ($_POST['line2'] ?? ''));
$city = trim((string) ($_POST['city'] ?? ''));
$state = trim((string) ($_POST['state'] ?? ''));
$postalCode = trim((string) ($_POST['postal_code'] ?? ''));
$typeInput = $_POST['type'] ?? 'HOME';
$type = in_array($typeInput, ['HOME', 'WORK', 'OTHER'], true) ? $typeInput : 'HOME';

if ($label === '' || mb_strlen($fullName) < 2 || mb_strlen($phone) < 10 || mb_strlen($line1) < 3
    || mb_strlen($city) < 2 || mb_strlen($state) < 2 || mb_strlen($postalCode) < 4) {
    flash_set('error', 'Please fill in all required address fields correctly.');
    redirect($redirectTo);
}

$countStmt = $pdo->prepare('SELECT COUNT(*) AS c FROM addresses WHERE user_id = ?');
$countStmt->execute([$authUser['id']]);
$isFirst = (int) $countStmt->fetch()['c'] === 0;

if (!empty($_POST['is_default']) || $isFirst) {
    $pdo->prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?')->execute([$authUser['id']]);
}

$insert = $pdo->prepare(
    'INSERT INTO addresses (user_id, label, type, full_name, phone, line1, line2, city, state, postal_code, is_default)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)'
);
$insert->execute([
    $authUser['id'], $label, $type, $fullName, $phone, $line1, $line2 ?: null, $city, $state, $postalCode,
    (!empty($_POST['is_default']) || $isFirst) ? 1 : 0,
]);
$newId = (int) $pdo->lastInsertId();

flash_set('success', 'Address saved.');
$separator = str_contains($redirectTo, '?') ? '&' : '?';
redirect($redirectTo . $separator . 'address=' . $newId);
