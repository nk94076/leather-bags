<?php
declare(strict_types=1);

final class Auth
{
    public static function user(): ?array
    {
        if (empty($_SESSION['user_id'])) {
            return null;
        }
        static $cached = null;
        if ($cached !== null) {
            return $cached;
        }
        $stmt = Database::pdo()->prepare('SELECT id, name, email, phone, role, avatar_url FROM users WHERE id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        $cached = $user ?: null;
        return $cached;
    }

    public static function check(): bool
    {
        return self::user() !== null;
    }

    public static function isAdmin(): bool
    {
        $user = self::user();
        return $user !== null && $user['role'] === 'ADMIN';
    }

    public static function attempt(string $email, string $password): bool
    {
        $stmt = Database::pdo()->prepare('SELECT id, password_hash FROM users WHERE email = ?');
        $stmt->execute([strtolower($email)]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($password, $user['password_hash'])) {
            return false;
        }
        self::login((int) $user['id']);
        return true;
    }

    public static function login(int $userId): void
    {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
    }

    public static function logout(): void
    {
        $_SESSION = [];
        session_destroy();
    }

    public static function requireLogin(): void
    {
        if (!self::check()) {
            $_SESSION['intended'] = $_SERVER['REQUEST_URI'] ?? '/';
            redirect('/login');
        }
    }

    public static function requireAdmin(): void
    {
        if (!self::check()) {
            $_SESSION['intended'] = $_SERVER['REQUEST_URI'] ?? '/admin';
            redirect('/login?admin=1');
        }
        if (!self::isAdmin()) {
            http_response_code(403);
            require dirname(__DIR__) . '/src/Views/pages/403.php';
            exit;
        }
    }
}
