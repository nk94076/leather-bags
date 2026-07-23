<?php
declare(strict_types=1);

const HP_ICON_OPTIONS = ['Gem', 'Hammer', 'ShieldCheck', 'Truck', 'RefreshCw', 'Headphones', 'Star', 'Award', 'Clock'];

$pdo = Database::pdo();

function hp_get_section(PDO $pdo, string $key): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM homepage_sections WHERE `key` = ?');
    $stmt->execute([$key]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function hp_upsert_section(PDO $pdo, string $key, ?string $title, ?string $subtitle, bool $visible, array $content): void
{
    $existing = hp_get_section($pdo, $key);
    if ($existing) {
        $pdo->prepare('UPDATE homepage_sections SET title=?, subtitle=?, is_visible=?, content=? WHERE `key`=?')
            ->execute([$title, $subtitle, $visible ? 1 : 0, json_encode($content), $key]);
    } else {
        $pdo->prepare('INSERT INTO homepage_sections (`key`, title, subtitle, is_visible, content, sort_order) VALUES (?,?,?,?,?,0)')
            ->execute([$key, $title, $subtitle, $visible ? 1 : 0, json_encode($content)]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && csrf_verify()) {
    $formType = $_POST['form_type'] ?? '';

    if ($formType === 'section_text') {
        $key = (string) ($_POST['section_key'] ?? '');
        $existing = hp_get_section($pdo, $key);
        hp_upsert_section(
            $pdo, $key, trim((string) ($_POST['title'] ?? '')), trim((string) ($_POST['subtitle'] ?? '')),
            !empty($_POST['visible']), $existing ? json_decode_assoc($existing['content']) : []
        );
        flash_set('success', 'Section updated.');
    } elseif ($formType === 'announcement') {
        $lines = array_values(array_filter(array_map('trim', explode("\n", (string) ($_POST['messages'] ?? '')))));
        hp_upsert_section($pdo, 'announcement', null, null, true, ['messages' => $lines]);
        flash_set('success', 'Announcement bar updated.');
    } elseif ($formType === 'why_choose_us') {
        $icons = (array) ($_POST['item_icon'] ?? []);
        $titles = (array) ($_POST['item_title'] ?? []);
        $texts = (array) ($_POST['item_text'] ?? []);
        $items = [];
        foreach ($titles as $i => $t) {
            $t = trim((string) $t);
            $text = trim((string) ($texts[$i] ?? ''));
            if ($t !== '' && $text !== '') {
                $items[] = ['icon' => $icons[$i] ?? 'Gem', 'title' => $t, 'text' => $text];
            }
        }
        hp_upsert_section(
            $pdo, 'why-choose-us', trim((string) ($_POST['title'] ?? '')), trim((string) ($_POST['subtitle'] ?? '')),
            true, ['items' => $items]
        );
        flash_set('success', 'Why Choose Us updated.');
    } elseif ($formType === 'instagram') {
        $lines = array_values(array_filter(array_map('trim', explode("\n", (string) ($_POST['images'] ?? '')))));
        $uploadError = null;
        if (!empty($_FILES['new_image']['tmp_name'])) {
            $uploaded = admin_save_upload($_FILES['new_image'], 'instagram', 'Instagram gallery image', $uploadError);
            if ($uploaded) {
                $lines[] = $uploaded;
            }
        }
        hp_upsert_section(
            $pdo, 'instagram', trim((string) ($_POST['title'] ?? '')), trim((string) ($_POST['subtitle'] ?? '')),
            true, ['images' => $lines]
        );
        flash_set($uploadError ? 'error' : 'success', $uploadError ? ('Instagram gallery saved, but image upload failed: ' . $uploadError) : 'Instagram gallery updated.');
    } elseif ($formType === 'banner_save') {
        $bannerId = (int) ($_POST['banner_id'] ?? 0);
        $placement = (string) ($_POST['placement'] ?? '');
        $title = trim((string) ($_POST['title'] ?? ''));
        $subtitle = trim((string) ($_POST['subtitle'] ?? ''));
        $ctaLabel = trim((string) ($_POST['cta_label'] ?? ''));
        $ctaUrl = trim((string) ($_POST['cta_url'] ?? ''));
        $isActive = !empty($_POST['is_active']) ? 1 : 0;

        $imageUrl = (string) ($_POST['existing_image_url'] ?? '');
        $uploadError = null;
        if (!empty($_FILES['image']['tmp_name'])) {
            $uploaded = admin_save_upload($_FILES['image'], 'banners', $title, $uploadError);
            if ($uploaded) {
                $imageUrl = $uploaded;
            }
        } elseif ($imageUrl === '' && !empty($_POST['generate_placeholder'])) {
            $imageUrl = placeholder_url('banner', $placement . '-' . time(), 1600, 800);
        }

        if ($uploadError) {
            flash_set('error', 'Image upload failed: ' . $uploadError);
        } elseif ($title !== '' && $imageUrl !== '') {
            if ($bannerId > 0) {
                $pdo->prepare('UPDATE banners SET title=?, subtitle=?, cta_label=?, cta_url=?, image_url=?, is_active=? WHERE id=?')
                    ->execute([$title, $subtitle ?: null, $ctaLabel ?: null, $ctaUrl ?: null, $imageUrl, $isActive, $bannerId]);
            } else {
                $maxSort = $pdo->prepare('SELECT COALESCE(MAX(sort_order),-1)+1 AS n FROM banners WHERE placement = ?');
                $maxSort->execute([$placement]);
                $nextSort = (int) $maxSort->fetch()['n'];
                $pdo->prepare('INSERT INTO banners (placement, title, subtitle, cta_label, cta_url, image_url, sort_order, is_active) VALUES (?,?,?,?,?,?,?,?)')
                    ->execute([$placement, $title, $subtitle ?: null, $ctaLabel ?: null, $ctaUrl ?: null, $imageUrl, $nextSort, $isActive]);
            }
            flash_set('success', 'Banner saved.');
        } else {
            flash_set('error', 'A banner needs a title and an image.');
        }
    } elseif ($formType === 'banner_delete') {
        $pdo->prepare('DELETE FROM banners WHERE id = ?')->execute([(int) ($_POST['banner_id'] ?? 0)]);
        flash_set('success', 'Banner removed.');
    }

    redirect('/admin/homepage');
}

$sectionRows = $pdo->query('SELECT * FROM homepage_sections')->fetchAll();
$sections = [];
foreach ($sectionRows as $row) {
    $sections[$row['key']] = $row;
}
$get = function (string $key) use ($sections) {
    return $sections[$key] ?? ['title' => '', 'subtitle' => '', 'is_visible' => 1, 'content' => '{}'];
};

$bannerRows = $pdo->query('SELECT * FROM banners ORDER BY placement ASC, sort_order ASC')->fetchAll();
$bannersByPlacement = ['hero' => [], 'promo-left' => [], 'promo-right' => []];
foreach ($bannerRows as $b) {
    $bannersByPlacement[$b['placement']][] = $b;
}

$announcementContent = json_decode_assoc($get('announcement')['content']);
$whyChoose = $get('why-choose-us');
$whyChooseContent = json_decode_assoc($whyChoose['content']);
$instagram = $get('instagram');
$instagramContent = json_decode_assoc($instagram['content']);

$pageTitle = 'Homepage Manager';
$activeAdminPath = '/admin/homepage';
require __DIR__ . '/../../Views/admin_shell_open.php';

function hp_section_text_card(string $key, string $label, array $section): void
{
    $content = json_decode_assoc($section['content'] ?? '{}');
    ?>
    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="font-display text-lg text-brand-ink"><?= e($label) ?></h2>
        <form action="<?= e(base_url('/admin/homepage')) ?>" method="post" class="flex items-center gap-4">
          <?= csrf_field() ?>
          <input type="hidden" name="form_type" value="section_text">
          <input type="hidden" name="section_key" value="<?= e($key) ?>">
          <label class="flex items-center gap-2 text-xs text-black/60">
            Visible
            <input type="checkbox" name="visible" <?= !empty($section['is_visible']) ? 'checked' : '' ?> class="h-4 w-4 accent-brand-primary">
          </label>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
            <label class="flex flex-col gap-1.5">
              <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Title</span>
              <input name="title" value="<?= e($section['title'] ?? '') ?>" class="input-field">
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Subtitle</span>
              <input name="subtitle" value="<?= e($section['subtitle'] ?? '') ?>" class="input-field">
            </label>
            <button type="submit" class="btn-primary btn-sm">Save</button>
          </div>
        </form>
      </div>
    </div>
    <?php
}
?>
<div class="mb-6">
  <h1 class="font-display text-2xl text-brand-ink sm:text-3xl">Homepage Manager</h1>
  <p class="mt-1 text-sm text-black/50">Manage every section of your homepage without touching code</p>
</div>

<div class="flex flex-col gap-6">
  <div class="rounded-2xl border border-black/5 bg-white p-6">
    <h2 class="mb-4 font-display text-lg text-brand-ink">Announcement Bar</h2>
    <form action="<?= e(base_url('/admin/homepage')) ?>" method="post" class="flex flex-col gap-3">
      <?= csrf_field() ?>
      <input type="hidden" name="form_type" value="announcement">
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Messages (one per line)</span>
        <textarea name="messages" rows="4" class="input-field"><?= e(implode("\n", $announcementContent['messages'] ?? [])) ?></textarea>
      </label>
      <button type="submit" class="btn-primary btn-sm self-start">Save</button>
    </form>
  </div>

  <?php
  $bannerLabels = ['hero' => 'Hero Banner Slides', 'promo-left' => 'Promo Banner — Left', 'promo-right' => 'Promo Banner — Right'];
  foreach (['hero'] as $placement):
  ?>
    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <h2 class="mb-4 font-display text-lg text-brand-ink"><?= e($bannerLabels[$placement]) ?></h2>
      <div class="flex flex-col gap-6">
        <?php foreach ($bannersByPlacement[$placement] as $b): ?>
          <?php include __DIR__ . '/../../Views/partials/admin-banner-row.php'; ?>
        <?php endforeach; ?>
        <?php $b = null; include __DIR__ . '/../../Views/partials/admin-banner-row.php'; ?>
      </div>
    </div>
  <?php endforeach; ?>

  <?php hp_section_text_card('categories', 'Categories Section', $get('categories')); ?>
  <?php hp_section_text_card('latest-products', 'Latest Products Section', $get('latest-products')); ?>
  <?php hp_section_text_card('trending-products', 'Trending Products Section', $get('trending-products')); ?>

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <?php foreach (['promo-left', 'promo-right'] as $placement): ?>
      <div class="rounded-2xl border border-black/5 bg-white p-6">
        <h2 class="mb-4 font-display text-lg text-brand-ink"><?= e($bannerLabels[$placement]) ?></h2>
        <div class="flex flex-col gap-6">
          <?php foreach ($bannersByPlacement[$placement] as $b): ?>
            <?php include __DIR__ . '/../../Views/partials/admin-banner-row.php'; ?>
          <?php endforeach; ?>
          <?php $b = null; include __DIR__ . '/../../Views/partials/admin-banner-row.php'; ?>
        </div>
      </div>
    <?php endforeach; ?>
  </div>

  <?php hp_section_text_card('recently-viewed', 'Recently Viewed Section', $get('recently-viewed')); ?>

  <div class="rounded-2xl border border-black/5 bg-white p-6">
    <h2 class="mb-4 font-display text-lg text-brand-ink">Why Choose Us</h2>
    <form action="<?= e(base_url('/admin/homepage')) ?>" method="post" class="flex flex-col gap-5">
      <?= csrf_field() ?>
      <input type="hidden" name="form_type" value="why_choose_us">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Section Title</span>
          <input name="title" value="<?= e($whyChoose['title'] ?? '') ?>" class="input-field">
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Section Subtitle</span>
          <input name="subtitle" value="<?= e($whyChoose['subtitle'] ?? '') ?>" class="input-field">
        </label>
      </div>
      <div class="flex flex-col gap-3">
        <?php $whyItems = $whyChooseContent['items'] ?? []; $whyRows = array_pad($whyItems, count($whyItems) + 2, ['icon' => 'Gem', 'title' => '', 'text' => '']); ?>
        <?php foreach ($whyRows as $item): ?>
          <div class="grid grid-cols-1 gap-3 rounded-xl border border-black/10 p-4 sm:grid-cols-[140px_1fr_2fr]">
            <select name="item_icon[]" class="input-field">
              <?php foreach (HP_ICON_OPTIONS as $ic): ?>
                <option value="<?= e($ic) ?>" <?= ($item['icon'] ?? '') === $ic ? 'selected' : '' ?>><?= e($ic) ?></option>
              <?php endforeach; ?>
            </select>
            <input name="item_title[]" value="<?= e($item['title'] ?? '') ?>" placeholder="Title" class="input-field">
            <input name="item_text[]" value="<?= e($item['text'] ?? '') ?>" placeholder="Description" class="input-field">
          </div>
        <?php endforeach; ?>
        <p class="text-xs text-black/40">Leave title/description blank to remove a row. Blank trailing rows are ignored.</p>
      </div>
      <button type="submit" class="btn-primary btn-sm self-start">Save</button>
    </form>
  </div>

  <?php hp_section_text_card('reviews', 'Customer Reviews Section', $get('reviews')); ?>

  <div class="rounded-2xl border border-black/5 bg-white p-6">
    <h2 class="mb-4 font-display text-lg text-brand-ink">Instagram Gallery</h2>
    <form action="<?= e(base_url('/admin/homepage')) ?>" method="post" enctype="multipart/form-data" class="flex flex-col gap-4">
      <?= csrf_field() ?>
      <input type="hidden" name="form_type" value="instagram">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Section Title</span>
          <input name="title" value="<?= e($instagram['title'] ?? '') ?>" class="input-field">
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Section Subtitle</span>
          <input name="subtitle" value="<?= e($instagram['subtitle'] ?? '') ?>" class="input-field">
        </label>
      </div>
      <?php if (!empty($instagramContent['images'])): ?>
        <div class="grid grid-cols-4 gap-3 sm:grid-cols-8">
          <?php foreach ($instagramContent['images'] as $src): ?>
            <div class="aspect-square overflow-hidden rounded-lg bg-brand-cream-dark"><img src="<?= e($src) ?>" alt="" class="h-full w-full object-cover"></div>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Image URLs (one per line)</span>
        <textarea name="images" rows="4" class="input-field"><?= e(implode("\n", $instagramContent['images'] ?? [])) ?></textarea>
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Or upload a new image to append</span>
        <input type="file" name="new_image" accept="image/*" class="text-xs">
      </label>
      <button type="submit" class="btn-primary btn-sm self-start">Save</button>
    </form>
  </div>

  <?php hp_section_text_card('newsletter', 'Newsletter Section', $get('newsletter')); ?>
</div>
<?php require __DIR__ . '/../../Views/admin_shell_close.php'; ?>
