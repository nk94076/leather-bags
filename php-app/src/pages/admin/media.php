<?php
declare(strict_types=1);

$pdo = Database::pdo();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && csrf_verify()) {
    $action = $_POST['action'] ?? '';

    if ($action === 'upload' && !empty($_FILES['file']['tmp_name'])) {
        $folder = trim((string) ($_POST['folder'] ?? 'general')) ?: 'general';
        $uploadError = null;
        $url = admin_save_upload($_FILES['file'], $folder, $_FILES['file']['name'] ?? '', $uploadError);
        flash_set($url ? 'success' : 'error', $url ? 'Image uploaded.' : ('Upload failed. ' . ($uploadError ?? 'Use JPG, PNG, WebP, GIF or SVG under 5MB.')));
    } elseif ($action === 'delete') {
        $id = (int) ($_POST['media_id'] ?? 0);
        $pdo->prepare('DELETE FROM media_assets WHERE id = ?')->execute([$id]);
        flash_set('success', 'Image removed.');
    }

    redirect('/admin/media');
}

$assets = $pdo->query('SELECT * FROM media_assets ORDER BY created_at DESC')->fetchAll();
$folders = array_values(array_unique(array_column($assets, 'folder')));

$pageTitle = 'Media Manager';
$activeAdminPath = '/admin/media';
require __DIR__ . '/../../Views/admin_shell_open.php';
?>
<div class="mb-6">
  <h1 class="font-display text-2xl text-brand-ink sm:text-3xl">Media Manager</h1>
  <p class="mt-1 text-sm text-black/50"><?= count($assets) ?> images in your media library</p>
</div>

<div class="flex flex-col gap-6">
  <div class="rounded-2xl border border-black/5 bg-white p-6">
    <h2 class="mb-4 font-display text-lg text-brand-ink">Upload New Image</h2>
    <form action="<?= e(base_url('/admin/media')) ?>" method="post" enctype="multipart/form-data" class="flex flex-wrap items-center gap-3">
      <?= csrf_field() ?>
      <input type="hidden" name="action" value="upload">
      <input name="folder" value="general" placeholder="Folder (e.g. products)" list="folder-suggestions" class="input-field w-48">
      <datalist id="folder-suggestions">
        <?php foreach ($folders as $f): ?><option value="<?= e($f) ?>"><?php endforeach; ?>
      </datalist>
      <input type="file" name="file" accept="image/*" required class="text-xs">
      <button type="submit" class="btn-primary btn-sm">Upload</button>
      <span class="text-xs text-black/40">JPG, PNG, WebP, GIF or SVG · Max 5MB</span>
    </form>
  </div>

  <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
    <?php foreach ($assets as $item): ?>
      <div class="group relative overflow-hidden rounded-2xl border border-black/5 bg-white">
        <div class="relative aspect-square">
          <img src="<?= e($item['url']) ?>" alt="<?= e($item['alt_text']) ?>" class="h-full w-full object-cover">
          <div class="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
            <button type="button" data-copy-link="<?= e($item['url']) ?>" class="rounded-full bg-white p-2 text-brand-ink" aria-label="Copy URL" title="Copy URL">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
            <form action="<?= e(base_url('/admin/media')) ?>" method="post" data-confirm="Delete this image?">
              <?= csrf_field() ?>
              <input type="hidden" name="action" value="delete">
              <input type="hidden" name="media_id" value="<?= (int) $item['id'] ?>">
              <button type="submit" class="rounded-full bg-white p-2 text-red-500" aria-label="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </form>
          </div>
        </div>
        <div class="p-2">
          <p class="truncate text-[11px] text-black/50"><?= e($item['folder']) ?></p>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</div>
<?php require __DIR__ . '/../../Views/admin_shell_close.php'; ?>
