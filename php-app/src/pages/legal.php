<?php
declare(strict_types=1);

$uri = trim((string) parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$slug = basename($uri);

$page = get_cms_page($slug);
if (!$page) {
    http_response_code(404);
    require __DIR__ . '/../Views/pages/404.php';
    exit;
}

$sections = $page['content']['sections'] ?? [];
$updatedAt = $page['content']['updatedAt'] ?? null;

$pageTitle = $page['meta_title'] ?: $page['title'];
$pageDescription = $page['meta_desc'] ?: $page['title'];
$canonicalPath = '/' . $slug;
require __DIR__ . '/../Views/layout_open.php';
?>
<div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
  <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1.5 text-xs text-black/50">
    <a href="<?= e(base_url('/')) ?>" class="hover:text-brand-primary">Home</a>
    <span>›</span>
    <span class="text-brand-ink"><?= e($page['title']) ?></span>
  </nav>
  <h1 class="mb-2 mt-4 font-display text-3xl text-brand-ink sm:text-4xl"><?= e($page['title']) ?></h1>
  <?php if ($updatedAt): ?><p class="mb-10 text-xs text-black/40">Last updated: <?= e($updatedAt) ?></p><?php endif; ?>

  <div class="flex flex-col gap-8">
    <?php foreach ($sections as $s): ?>
      <section>
        <h2 class="mb-2 font-display text-xl text-brand-ink"><?= e($s['heading']) ?></h2>
        <p class="text-sm leading-relaxed text-black/65"><?= e($s['body']) ?></p>
      </section>
    <?php endforeach; ?>
  </div>
</div>
<?php require __DIR__ . '/../Views/layout_close.php'; ?>
