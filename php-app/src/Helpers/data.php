<?php
declare(strict_types=1);

function get_categories(): array
{
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }
    $stmt = Database::pdo()->query('SELECT * FROM categories ORDER BY sort_order ASC');
    $cache = $stmt->fetchAll();
    return $cache;
}

function get_category_by_slug(string $slug): ?array
{
    $stmt = Database::pdo()->prepare('SELECT * FROM categories WHERE slug = ?');
    $stmt->execute([$slug]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function get_setting(string $key, array $default = []): array
{
    static $cache = [];
    if (isset($cache[$key])) {
        return $cache[$key];
    }
    $stmt = Database::pdo()->prepare('SELECT value FROM settings WHERE `key` = ?');
    $stmt->execute([$key]);
    $value = $stmt->fetchColumn();
    $cache[$key] = $value ? json_decode_assoc($value) : $default;
    return $cache[$key];
}

function get_homepage_sections(): array
{
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }
    $stmt = Database::pdo()->query('SELECT * FROM homepage_sections ORDER BY sort_order ASC');
    $rows = $stmt->fetchAll();
    $cache = [];
    foreach ($rows as $row) {
        $cache[$row['key']] = $row;
    }
    return $cache;
}

function get_cms_page(string $slug): ?array
{
    $stmt = Database::pdo()->prepare('SELECT * FROM cms_pages WHERE slug = ?');
    $stmt->execute([$slug]);
    $row = $stmt->fetch();
    if (!$row) {
        return null;
    }
    $row['content'] = json_decode_assoc($row['content']);
    return $row;
}

function get_faqs(): array
{
    $stmt = Database::pdo()->query('SELECT * FROM faq_items ORDER BY sort_order ASC');
    return $stmt->fetchAll();
}

function get_banners(string $placement): array
{
    $stmt = Database::pdo()->prepare('SELECT * FROM banners WHERE placement = ? AND is_active = 1 ORDER BY sort_order ASC');
    $stmt->execute([$placement]);
    return $stmt->fetchAll();
}

/** Decode a product row's JSON/relational extras and format for display. */
function decorate_product(array $product): array
{
    $product['colors'] = json_decode_assoc($product['colors']);
    $pdo = Database::pdo();

    $imgStmt = $pdo->prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC');
    $imgStmt->execute([$product['id']]);
    $product['images'] = $imgStmt->fetchAll();

    return $product;
}

define('PRODUCTS_PER_PAGE', 12);

function get_shop_products(array $filters): array
{
    $pdo = Database::pdo();
    $where = ['p.is_active = 1'];
    $bind = [];

    if (!empty($filters['q'])) {
        $where[] = '(p.name LIKE ? OR p.short_description LIKE ? OR p.description LIKE ?)';
        $like = '%' . $filters['q'] . '%';
        $bind[] = $like;
        $bind[] = $like;
        $bind[] = $like;
    }
    if (!empty($filters['category'])) {
        $slugs = array_filter(explode(',', $filters['category']));
        if ($slugs) {
            $placeholders = implode(',', array_fill(0, count($slugs), '?'));
            $where[] = "c.slug IN ({$placeholders})";
            foreach ($slugs as $s) {
                $bind[] = $s;
            }
        }
    }
    if (!empty($filters['material'])) {
        $materials = array_filter(explode(',', $filters['material']));
        if ($materials) {
            $placeholders = implode(',', array_fill(0, count($materials), '?'));
            $where[] = "p.leather_type IN ({$placeholders})";
            foreach ($materials as $m) {
                $bind[] = $m;
            }
        }
    }
    if (!empty($filters['color'])) {
        $colors = array_filter(explode(',', $filters['color']));
        if ($colors) {
            $colorConds = [];
            foreach ($colors as $c) {
                $colorConds[] = 'p.colors LIKE ?';
                $bind[] = '%' . $c . '%';
            }
            $where[] = '(' . implode(' OR ', $colorConds) . ')';
        }
    }
    if (($filters['availability'] ?? '') === 'in-stock') {
        $where[] = 'p.stock > 0';
    } elseif (($filters['availability'] ?? '') === 'out-of-stock') {
        $where[] = 'p.stock = 0';
    }
    if (!empty($filters['rating'])) {
        $where[] = 'p.avg_rating >= ?';
        $bind[] = (float) $filters['rating'];
    }
    if (!empty($filters['minPrice'])) {
        $where[] = 'p.price >= ?';
        $bind[] = (float) $filters['minPrice'];
    }
    if (!empty($filters['maxPrice'])) {
        $where[] = 'p.price <= ?';
        $bind[] = (float) $filters['maxPrice'];
    }

    $orderBy = match ($filters['sort'] ?? '') {
        'latest' => 'p.created_at DESC',
        'price-asc' => 'p.price ASC',
        'price-desc' => 'p.price DESC',
        'rating' => 'p.avg_rating DESC',
        'popularity' => 'p.review_count DESC',
        default => 'p.is_featured DESC, p.created_at DESC',
    };

    $whereSql = implode(' AND ', $where);
    $page = max(1, (int) ($filters['page'] ?? 1));
    $offset = ($page - 1) * PRODUCTS_PER_PAGE;

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM products p JOIN categories c ON c.id = p.category_id WHERE {$whereSql}");
    $countStmt->execute($bind);
    $total = (int) $countStmt->fetchColumn();

    $sql = "SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p JOIN categories c ON c.id = p.category_id WHERE {$whereSql} ORDER BY {$orderBy} LIMIT {$offset}, " . PRODUCTS_PER_PAGE;
    $stmt = $pdo->prepare($sql);
    $stmt->execute($bind);
    $products = array_map('decorate_product', $stmt->fetchAll());

    return [
        'products' => $products,
        'total' => $total,
        'totalPages' => max(1, (int) ceil($total / PRODUCTS_PER_PAGE)),
        'page' => $page,
    ];
}

function get_product_by_slug(string $slug): ?array
{
    $stmt = Database::pdo()->prepare(
        'SELECT p.*, c.name AS category_name, c.slug AS category_slug
         FROM products p JOIN categories c ON c.id = p.category_id
         WHERE p.slug = ?'
    );
    $stmt->execute([$slug]);
    $row = $stmt->fetch();
    return $row ? decorate_product($row) : null;
}
