<?php
declare(strict_types=1);

header('Content-Type: text/plain; charset=UTF-8');
?>
User-agent: *
Allow: /
Disallow: /admin
Disallow: /account
Disallow: /checkout
Disallow: /cart
Disallow: /login
Disallow: /register
Disallow: /forgot-password

Sitemap: <?= base_url('/sitemap.xml') ?>
