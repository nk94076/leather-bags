<?php
declare(strict_types=1);

$page = get_cms_page('about-us');
if (!$page) {
    http_response_code(404);
    require __DIR__ . '/../Views/pages/404.php';
    exit;
}
$content = $page['content'];
$hero = $content['hero'] ?? ['title' => 'About Us', 'subtitle' => ''];
$sections = $content['sections'] ?? [];
$stats = $content['stats'] ?? [];

$pageTitle = $page['meta_title'] ?: 'About Us';
$pageDescription = $page['meta_desc'] ?: 'Learn about Corium Leather Co.';
$canonicalPath = '/about-us';
require __DIR__ . '/../Views/layout_open.php';
?>
<div class="bg-brand-ink py-16 text-center sm:py-24">
  <div class="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
    <nav aria-label="Breadcrumb" class="flex flex-wrap items-center justify-center gap-1.5 text-xs text-white/60">
      <a href="<?= e(base_url('/')) ?>" class="hover:text-white">Home</a>
      <span>›</span>
      <span class="text-white">About Us</span>
    </nav>
    <h1 class="mx-auto mt-6 max-w-2xl font-display text-4xl text-white sm:text-5xl"><?= e($hero['title']) ?></h1>
    <p class="mx-auto mt-4 max-w-xl text-sm text-white/70 sm:text-base"><?= e($hero['subtitle']) ?></p>
  </div>
</div>

<div class="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
  <div class="mx-auto grid max-w-4xl grid-cols-2 gap-6 rounded-2xl bg-brand-cream p-8 sm:grid-cols-4">
    <?php foreach ($stats as $s): ?>
      <div class="text-center">
        <p class="font-display text-3xl text-brand-primary sm:text-4xl"><?= e($s['value']) ?></p>
        <p class="mt-1 text-xs uppercase tracking-wide text-black/50"><?= e($s['label']) ?></p>
      </div>
    <?php endforeach; ?>
  </div>

  <div class="mx-auto mt-16 flex max-w-3xl flex-col gap-10">
    <?php foreach ($sections as $s): ?>
      <section>
        <h2 class="mb-3 font-display text-2xl text-brand-ink"><?= e($s['heading']) ?></h2>
        <p class="text-sm leading-relaxed text-black/65"><?= e($s['body']) ?></p>
      </section>
    <?php endforeach; ?>
  </div>

  <div class="mt-16 flex flex-col items-center gap-4 text-center">
    <h3 class="font-display text-2xl text-brand-ink">Explore the Collection</h3>
    <a href="<?= e(base_url('/shop')) ?>" class="btn-primary">Shop Now</a>
  </div>
</div>
<?php require __DIR__ . '/../Views/layout_close.php'; ?>
