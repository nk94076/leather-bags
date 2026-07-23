<?php
declare(strict_types=1);

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
