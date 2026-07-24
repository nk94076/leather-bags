<?php
declare(strict_types=1);

$redirectTo = $_POST['redirect'] ?? '/cart';
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_verify()) {
    redirect($redirectTo);
}

$key = (string) ($_POST['key'] ?? '');
$quantity = max(0, (int) ($_POST['quantity'] ?? 1));

if (isset($_SESSION['cart'][$key])) {
    if ($quantity === 0) {
        unset($_SESSION['cart'][$key]);
    } else {
        $max = $_SESSION['cart'][$key]['stock'] ?: 99;
        $_SESSION['cart'][$key]['quantity'] = min($max, $quantity);
    }
}

redirect($redirectTo);
