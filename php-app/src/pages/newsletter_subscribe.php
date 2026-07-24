<?php
declare(strict_types=1);

$redirectTo = $_POST['redirect'] ?? '/';
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_verify()) {
    redirect($redirectTo);
}

$email = strtolower(trim((string) ($_POST['email'] ?? '')));
if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Database::pdo()->prepare('INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)')->execute([$email]);
    flash_set('success', "You're subscribed! Welcome to Corium.");
} else {
    flash_set('error', 'Enter a valid email address.');
}

redirect($redirectTo);
