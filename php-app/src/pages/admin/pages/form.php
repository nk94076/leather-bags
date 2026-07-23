<?php
declare(strict_types=1);

$pdo = Database::pdo();
$slug = (string) $params['slug'];

$stmt = $pdo->prepare('SELECT * FROM cms_pages WHERE slug = ?');
$stmt->execute([$slug]);
$page = $stmt->fetch();

if (!$page) {
    http_response_code(404);
    require __DIR__ . '/../../../Views/pages/404.php';
    exit;
}

$isAbout = $slug === 'about-us';
$isContact = $slug === 'contact-us';
$isLegal = !$isAbout && !$isContact;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && csrf_verify()) {
    $title = trim((string) ($_POST['title'] ?? $page['title']));
    $metaTitle = trim((string) ($_POST['meta_title'] ?? ''));
    $metaDesc = trim((string) ($_POST['meta_desc'] ?? ''));

    if ($isAbout) {
        $stats = [];
        $statValues = (array) ($_POST['stat_value'] ?? []);
        $statLabels = (array) ($_POST['stat_label'] ?? []);
        foreach ($statValues as $i => $val) {
            $val = trim((string) $val);
            $label = trim((string) ($statLabels[$i] ?? ''));
            if ($val !== '' && $label !== '') {
                $stats[] = ['value' => $val, 'label' => $label];
            }
        }
        $sections = [];
        $headings = (array) ($_POST['section_heading'] ?? []);
        $bodies = (array) ($_POST['section_body'] ?? []);
        foreach ($headings as $i => $h) {
            $h = trim((string) $h);
            $b = trim((string) ($bodies[$i] ?? ''));
            if ($h !== '' && $b !== '') {
                $sections[] = ['heading' => $h, 'body' => $b];
            }
        }
        $content = [
            'hero' => ['title' => trim((string) ($_POST['hero_title'] ?? '')), 'subtitle' => trim((string) ($_POST['hero_subtitle'] ?? ''))],
            'stats' => $stats,
            'sections' => $sections,
        ];
    } elseif ($isContact) {
        $content = [
            'intro' => trim((string) ($_POST['intro'] ?? '')),
            'hours' => trim((string) ($_POST['hours'] ?? '')),
        ];
    } else {
        $sections = [];
        $headings = (array) ($_POST['section_heading'] ?? []);
        $bodies = (array) ($_POST['section_body'] ?? []);
        foreach ($headings as $i => $h) {
            $h = trim((string) $h);
            $b = trim((string) ($bodies[$i] ?? ''));
            if ($h !== '' && $b !== '') {
                $sections[] = ['heading' => $h, 'body' => $b];
            }
        }
        $content = [
            'updatedAt' => trim((string) ($_POST['updated_at'] ?? '')),
            'sections' => $sections,
        ];
    }

    $pdo->prepare('UPDATE cms_pages SET title=?, meta_title=?, meta_desc=?, content=? WHERE slug=?')
        ->execute([$title, $metaTitle ?: null, $metaDesc ?: null, json_encode($content), $slug]);

    flash_set('success', 'Page updated.');
    redirect('/admin/pages/' . $slug);
}

$content = json_decode_assoc($page['content']);

$pageTitle = 'Edit: ' . $page['title'];
$activeAdminPath = '/admin/pages';
require __DIR__ . '/../../../Views/admin_shell_open.php';
?>
<div class="mb-6">
  <h1 class="font-display text-2xl text-brand-ink sm:text-3xl">Edit: <?= e($page['title']) ?></h1>
  <p class="mt-1 text-sm text-black/50">/<?= e($page['slug']) ?></p>
</div>

<form method="post" class="flex flex-col gap-6">
  <?= csrf_field() ?>

  <div class="rounded-2xl border border-black/5 bg-white p-6">
    <h2 class="mb-4 font-display text-lg text-brand-ink">Page Settings</h2>
    <div class="flex flex-col gap-4">
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Page Title</span>
        <input name="title" value="<?= e($page['title']) ?>" class="input-field">
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Meta Title (SEO)</span>
        <input name="meta_title" value="<?= e($page['meta_title'] ?? '') ?>" class="input-field">
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Meta Description (SEO)</span>
        <textarea name="meta_desc" rows="2" class="input-field"><?= e($page['meta_desc'] ?? '') ?></textarea>
      </label>
    </div>
  </div>

  <?php if ($isAbout): ?>
    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <h2 class="mb-4 font-display text-lg text-brand-ink">Hero</h2>
      <div class="flex flex-col gap-4">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Hero Title</span>
          <input name="hero_title" value="<?= e($content['hero']['title'] ?? '') ?>" class="input-field">
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Hero Subtitle</span>
          <textarea name="hero_subtitle" rows="2" class="input-field"><?= e($content['hero']['subtitle'] ?? '') ?></textarea>
        </label>
      </div>
    </div>

    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <h2 class="mb-4 font-display text-lg text-brand-ink">Stats</h2>
      <div class="flex flex-col gap-3">
        <?php $stats = $content['stats'] ?? []; $statRows = array_pad($stats, count($stats) + 2, ['value' => '', 'label' => '']); ?>
        <?php foreach ($statRows as $s): ?>
          <div class="flex items-center gap-2">
            <input name="stat_value[]" value="<?= e($s['value'] ?? '') ?>" placeholder="Value (e.g. 10+)" class="input-field">
            <input name="stat_label[]" value="<?= e($s['label'] ?? '') ?>" placeholder="Label" class="input-field">
          </div>
        <?php endforeach; ?>
        <p class="text-xs text-black/40">Leave both fields blank to remove a row.</p>
      </div>
    </div>

    <?php $sections = $content['sections'] ?? []; ?>
    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <h2 class="mb-4 font-display text-lg text-brand-ink">Content Sections</h2>
      <div class="flex flex-col gap-5">
        <?php $sectionRows = array_pad($sections, count($sections) + 1, ['heading' => '', 'body' => '']); ?>
        <?php foreach ($sectionRows as $s): ?>
          <div class="rounded-xl border border-black/10 p-4">
            <input name="section_heading[]" value="<?= e($s['heading'] ?? '') ?>" placeholder="Section heading" class="input-field mb-2 font-medium">
            <textarea name="section_body[]" rows="3" placeholder="Section body" class="input-field"><?= e($s['body'] ?? '') ?></textarea>
          </div>
        <?php endforeach; ?>
        <p class="text-xs text-black/40">Leave heading blank to remove a section. A blank trailing row is provided to add a new one.</p>
      </div>
    </div>
  <?php elseif ($isContact): ?>
    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <h2 class="mb-4 font-display text-lg text-brand-ink">Contact Info</h2>
      <div class="flex flex-col gap-4">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Intro Text</span>
          <textarea name="intro" rows="2" class="input-field"><?= e($content['intro'] ?? '') ?></textarea>
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Business Hours</span>
          <input name="hours" value="<?= e($content['hours'] ?? '') ?>" class="input-field">
        </label>
      </div>
    </div>
  <?php else: ?>
    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <label class="flex max-w-xs flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Last Updated Label</span>
        <input name="updated_at" value="<?= e($content['updatedAt'] ?? '') ?>" placeholder="e.g. 1 June 2026" class="input-field">
      </label>
    </div>
    <?php $sections = $content['sections'] ?? []; ?>
    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <h2 class="mb-4 font-display text-lg text-brand-ink">Content Sections</h2>
      <div class="flex flex-col gap-5">
        <?php $sectionRows = array_pad($sections, count($sections) + 1, ['heading' => '', 'body' => '']); ?>
        <?php foreach ($sectionRows as $s): ?>
          <div class="rounded-xl border border-black/10 p-4">
            <input name="section_heading[]" value="<?= e($s['heading'] ?? '') ?>" placeholder="Section heading" class="input-field mb-2 font-medium">
            <textarea name="section_body[]" rows="3" placeholder="Section body" class="input-field"><?= e($s['body'] ?? '') ?></textarea>
          </div>
        <?php endforeach; ?>
        <p class="text-xs text-black/40">Leave heading blank to remove a section. A blank trailing row is provided to add a new one.</p>
      </div>
    </div>
  <?php endif; ?>

  <button type="submit" class="btn-primary self-start">Save Page</button>
</form>
<?php require __DIR__ . '/../../../Views/admin_shell_close.php'; ?>
