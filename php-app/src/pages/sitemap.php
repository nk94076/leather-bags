<?php
declare(strict_types=1);

$pdo = Database::pdo();

$products = $pdo->query("SELECT slug, updated_at FROM products WHERE is_active = 1")->fetchAll();
$categories = $pdo->query('SELECT slug, updated_at FROM categories')->fetchAll();

$staticRoutes = [
    ['loc' => '/', 'freq' => 'daily', 'priority' => '1.0'],
    ['loc' => '/shop', 'freq' => 'daily', 'priority' => '0.9'],
    ['loc' => '/about-us', 'freq' => 'monthly', 'priority' => '0.6'],
    ['loc' => '/contact-us', 'freq' => 'monthly', 'priority' => '0.6'],
    ['loc' => '/faq', 'freq' => 'monthly', 'priority' => '0.5'],
    ['loc' => '/track-order', 'freq' => 'monthly', 'priority' => '0.3'],
    ['loc' => '/privacy-policy', 'freq' => 'yearly', 'priority' => '0.3'],
    ['loc' => '/terms-and-conditions', 'freq' => 'yearly', 'priority' => '0.3'],
    ['loc' => '/shipping-return-policy', 'freq' => 'yearly', 'priority' => '0.3'],
    ['loc' => '/login', 'freq' => 'yearly', 'priority' => '0.1'],
    ['loc' => '/register', 'freq' => 'yearly', 'priority' => '0.1'],
];

header('Content-Type: application/xml; charset=UTF-8');
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<?php foreach ($staticRoutes as $r): ?>
  <url>
    <loc><?= e(base_url($r['loc'])) ?></loc>
    <changefreq><?= e($r['freq']) ?></changefreq>
    <priority><?= e($r['priority']) ?></priority>
  </url>
<?php endforeach; ?>
<?php foreach ($categories as $c): ?>
  <url>
    <loc><?= e(base_url('/shop/' . $c['slug'])) ?></loc>
    <lastmod><?= date('c', strtotime($c['updated_at'])) ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
<?php endforeach; ?>
<?php foreach ($products as $p): ?>
  <url>
    <loc><?= e(base_url('/product/' . $p['slug'])) ?></loc>
    <lastmod><?= date('c', strtotime($p['updated_at'])) ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
<?php endforeach; ?>
</urlset>
