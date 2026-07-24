<?php
declare(strict_types=1);

$faqs = get_faqs();
$grouped = [];
foreach ($faqs as $f) {
    $grouped[$f['category']][] = $f;
}

$jsonLd = [[
    '@context' => 'https://schema.org',
    '@type' => 'FAQPage',
    'mainEntity' => array_map(fn ($f) => [
        '@type' => 'Question',
        'name' => $f['question'],
        'acceptedAnswer' => ['@type' => 'Answer', 'text' => $f['answer']],
    ], $faqs),
]];

$pageTitle = 'Frequently Asked Questions';
$pageDescription = 'Find answers to common questions about orders, shipping, returns, payments and product care at Corium.';
$canonicalPath = '/faq';
require __DIR__ . '/../Views/layout_open.php';
?>
<div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
  <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1.5 text-xs text-black/50">
    <a href="<?= e(base_url('/')) ?>" class="hover:text-brand-primary">Home</a>
    <span>›</span>
    <span class="text-brand-ink">FAQ</span>
  </nav>
  <h1 class="mb-3 mt-4 font-display text-3xl text-brand-ink sm:text-4xl">Frequently Asked Questions</h1>
  <p class="mb-10 text-sm text-black/60">Can't find what you're looking for? <a href="<?= e(base_url('/contact-us')) ?>" class="text-brand-primary hover:underline">Contact our team</a>.</p>

  <div class="flex flex-col gap-10">
    <?php foreach ($grouped as $category => $items): ?>
      <div>
        <h2 class="mb-4 font-display text-xl text-brand-ink"><?= e($category) ?></h2>
        <div class="flex flex-col gap-3">
          <?php foreach ($items as $i => $item): $panelId = 'faq-' . $item['id']; ?>
            <div class="overflow-hidden rounded-2xl border border-black/5 bg-white">
              <button type="button" data-accordion-trigger="<?= e($panelId) ?>" class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                <span class="text-sm font-medium text-brand-ink"><?= e($item['question']) ?></span>
                <svg data-accordion-icon width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 text-black/40 transition-transform <?= $i === 0 ? 'rotate-180' : '' ?>"><path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <div id="<?= e($panelId) ?>" class="<?= $i === 0 ? '' : 'hidden' ?>">
                <p class="px-5 pb-5 text-sm leading-relaxed text-black/60"><?= e($item['answer']) ?></p>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</div>
<?php require __DIR__ . '/../Views/layout_close.php'; ?>
