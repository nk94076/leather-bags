<?php
declare(strict_types=1);

function e(?string $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

function base_url(string $path = ''): string
{
    $base = rtrim(Config::get('APP_URL', ''), '/');
    if ($path === '') {
        return $base . '/';
    }
    return $base . '/' . ltrim($path, '/');
}

function asset_url(string $path): string
{
    return base_url('assets/' . ltrim($path, '/'));
}

function redirect(string $path): never
{
    header('Location: ' . base_url($path));
    exit;
}

function format_price(float $amount): string
{
    return '₹' . number_format($amount, 0, '.', ',');
}

function format_date(string $datetime): string
{
    $ts = strtotime($datetime);
    return $ts ? date('j F Y', $ts) : $datetime;
}

function slugify(string $text): string
{
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9]+/', '-', $text) ?? '';
    return trim($text, '-');
}

function discount_percent(float $price, ?float $compareAt): int
{
    if (!$compareAt || $compareAt <= $price) {
        return 0;
    }
    return (int) round((($compareAt - $price) / $compareAt) * 100);
}

function generate_order_number(): string
{
    return 'MC' . date('Ymd') . random_int(1000, 9999);
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf_token" value="' . e(csrf_token()) . '">';
}

function csrf_verify(): bool
{
    $token = $_POST['csrf_token'] ?? '';
    return is_string($token) && hash_equals($_SESSION['csrf_token'] ?? '', $token);
}

function flash_set(string $type, string $message): void
{
    $_SESSION['flash'][] = ['type' => $type, 'message' => $message];
}

function flash_get(): array
{
    $flashes = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $flashes;
}

function old(string $key, string $default = ''): string
{
    return e($_SESSION['old'][$key] ?? $default);
}

function json_decode_assoc(?string $json): array
{
    if (!$json) {
        return [];
    }
    $data = json_decode($json, true);
    return is_array($data) ? $data : [];
}

function current_url_query(array $overrides = []): string
{
    $params = $_GET;
    foreach ($overrides as $k => $v) {
        if ($v === null) {
            unset($params[$k]);
        } else {
            $params[$k] = $v;
        }
    }
    return http_build_query($params);
}

/**
 * The true, web-accessible document root — where index.php/.htaccess actually
 * live. Prefers the APP_PUBLIC_DIR constant index.php defines (authoritative,
 * correct under any deployment layout), then $_SERVER['DOCUMENT_ROOT'], then
 * falls back to the conventional php-app/public path for CLI contexts.
 */
function admin_web_root(): string
{
    if (defined('APP_PUBLIC_DIR')) {
        return APP_PUBLIC_DIR;
    }
    if (!empty($_SERVER['DOCUMENT_ROOT'])) {
        return $_SERVER['DOCUMENT_ROOT'];
    }
    return dirname(__DIR__, 2) . '/public';
}

/**
 * Save an uploaded file (a single entry from $_FILES) into {web root}/uploads/{folder}/
 * and record it in media_assets. Returns the public URL or null on failure.
 */
function admin_save_upload(array $file, string $folder, string $altText = ''): ?string
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || empty($file['tmp_name'])) {
        return null;
    }

    $allowedTypes = [
        'image/jpeg' => '.jpg', 'image/png' => '.png', 'image/webp' => '.webp',
        'image/gif' => '.gif', 'image/svg+xml' => '.svg',
    ];
    $mime = mime_content_type($file['tmp_name']) ?: '';
    if (!isset($allowedTypes[$mime])) {
        return null;
    }
    if ($file['size'] > 5 * 1024 * 1024) {
        return null;
    }

    $safeFolder = preg_replace('/[^a-z0-9\-_]/i', '', $folder) ?: 'general';
    $safeFolder = substr($safeFolder, 0, 40);
    $ext = $allowedTypes[$mime];
    $filename = ((string) round(microtime(true) * 1000)) . '-' . random_int(100000000, 999999999) . $ext;

    $uploadDir = rtrim(admin_web_root(), '/') . '/uploads/' . $safeFolder;
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    if (!move_uploaded_file($file['tmp_name'], $uploadDir . '/' . $filename)) {
        return null;
    }

    $url = base_url('uploads/' . $safeFolder . '/' . $filename);
    Database::pdo()->prepare('INSERT INTO media_assets (url, alt_text, folder) VALUES (?,?,?)')
        ->execute([$url, $altText ?: $filename, $safeFolder]);

    return $url;
}
