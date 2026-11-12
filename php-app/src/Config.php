<?php
declare(strict_types=1);

final class Config
{
    private static array $values = [];
    private static bool $loaded = false;

    public static function load(): void
    {
        if (self::$loaded) {
            return;
        }
        self::$loaded = true;

        $envFile = dirname(__DIR__) . '/.env';
        if (is_file($envFile)) {
            foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                $line = trim($line);
                if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                    continue;
                }
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                if (strlen($value) >= 2 && $value[0] === '"' && str_ends_with($value, '"')) {
                    $value = substr($value, 1, -1);
                }
                self::$values[$key] = $value;
                if (getenv($key) === false) {
                    putenv("$key=$value");
                }
            }
        }
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        self::load();
        $fromEnv = getenv($key);
        if ($fromEnv !== false) {
            return $fromEnv;
        }
        return self::$values[$key] ?? $default;
    }
}
