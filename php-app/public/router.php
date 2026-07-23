<?php
// Dev-only router for PHP's built-in server, mirroring the .htaccess rewrite
// rules. Not used in production (Apache reads .htaccess directly there).
// Usage: php -S localhost:8000 -t public public/router.php
$path = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
$file = __DIR__ . $path;

if ($path !== '/' && is_file($file)) {
    return false;
}

require __DIR__ . '/index.php';
