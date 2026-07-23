<?php
declare(strict_types=1);

// The directory this file actually lives in is always the true, web-accessible
// document root — regardless of where the app source (src/, database/) is
// deployed relative to it. admin_save_upload() relies on this to save files
// where they're actually reachable over HTTP.
define('APP_PUBLIC_DIR', __DIR__);

$root = dirname(__DIR__);

spl_autoload_register(function (string $class) use ($root) {
    $file = $root . '/src/' . str_replace('\\', '/', $class) . '.php';
    if (is_file($file)) {
        require $file;
    }
});

require $root . '/src/Helpers/functions.php';
require $root . '/src/Helpers/placeholder.php';
require $root . '/src/Helpers/data.php';
require $root . '/src/Helpers/constants.php';

session_start();

Config::load();

/** @var Router $router */
$router = require $root . '/src/routes.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = $_SERVER['REQUEST_URI'] ?? '/';

$match = $router->match($method, $uri);

if (!$match) {
    http_response_code(404);
    require $root . '/src/Views/pages/404.php';
    exit;
}

if ($match['auth']) {
    Auth::requireLogin();
}
if ($match['admin']) {
    Auth::requireAdmin();
}

$params = $match['params'];
$scriptPath = $root . '/src/pages/' . $match['script'];

if (!is_file($scriptPath)) {
    http_response_code(500);
    echo 'Route script missing: ' . e($match['script']);
    exit;
}

require $scriptPath;
