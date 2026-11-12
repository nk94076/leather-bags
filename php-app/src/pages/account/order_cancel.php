<?php
declare(strict_types=1);

$authUser = Auth::user();
$orderId = (int) $params['id'];
$redirectTo = '/account/orders/' . $orderId;

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_verify()) {
    redirect($redirectTo);
}

$pdo = Database::pdo();
$orderStmt = $pdo->prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?');
$orderStmt->execute([$orderId, $authUser['id']]);
$order = $orderStmt->fetch();

if (!$order) {
    http_response_code(404);
    require __DIR__ . '/../../Views/pages/404.php';
    exit;
}

if (!in_array($order['status'], ['PENDING', 'CONFIRMED', 'PROCESSING'], true)) {
    flash_set('error', 'This order can no longer be cancelled.');
    redirect($redirectTo);
}

$history = json_decode_assoc($order['tracking_history']);
$history[] = ['status' => 'CANCELLED', 'date' => date('c'), 'note' => 'Cancelled by customer'];

$pdo->prepare('UPDATE orders SET status = "CANCELLED", tracking_history = ? WHERE id = ?')
    ->execute([json_encode($history), $orderId]);

flash_set('success', 'Order cancelled.');
redirect($redirectTo);
