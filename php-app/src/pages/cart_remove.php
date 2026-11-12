<?php
declare(strict_types=1);

$redirectTo = $_POST['redirect'] ?? '/cart';
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_verify()) {
    redirect($redirectTo);
}

$key = (string) ($_POST['key'] ?? '');
unset($_SESSION['cart'][$key]);
flash_set('success', 'Item removed from your bag.');
redirect($redirectTo);
