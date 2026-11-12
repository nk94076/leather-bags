<?php
declare(strict_types=1);

$pdo = Database::pdo();
$categoryId = isset($params['id']) ? (int) $params['id'] : null;
$isEdit = $categoryId !== null;

$category = null;
if ($isEdit) {
    $stmt = $pdo->prepare('SELECT * FROM categories WHERE id = ?');
    $stmt->execute([$categoryId]);
    $category = $stmt->fetch();
    if (!$category) {
        http_response_code(404);
        require __DIR__ . '/../../../Views/pages/404.php';
        exit;
    }
}

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify()) {
        $errors[] = 'Your session expired. Please try again.';
    } else {
        $name = trim((string) ($_POST['name'] ?? ''));
        $slug = trim((string) ($_POST['slug'] ?? '')) ?: slugify($name);
        $description = trim((string) ($_POST['description'] ?? ''));
        $sortOrder = (int) ($_POST['sort_order'] ?? 0);
        $metaTitle = trim((string) ($_POST['meta_title'] ?? ''));
        $metaDesc = trim((string) ($_POST['meta_desc'] ?? ''));
        $isFeatured = !empty($_POST['is_featured']) ? 1 : 0;

        $imageUrl = $category['image_url'] ?? '';
        $bannerUrl = $category['banner_url'] ?? '';

        if (!empty($_FILES['image']['tmp_name'])) {
            $uploadError = null;
            $uploaded = admin_save_upload($_FILES['image'], 'categories', $name, $uploadError);
            if ($uploaded) {
                $imageUrl = $uploaded;
            } elseif ($uploadError) {
                $errors[] = 'Category image upload failed: ' . $uploadError;
            }
        } elseif (!empty($_POST['generate_placeholders']) && $imageUrl === '') {
            $imageUrl = placeholder_url('category', $slug, 900, 1200);
        }

        if (!empty($_FILES['banner']['tmp_name'])) {
            $uploadError = null;
            $uploaded = admin_save_upload($_FILES['banner'], 'categories', $name . ' banner', $uploadError);
            if ($uploaded) {
                $bannerUrl = $uploaded;
            } elseif ($uploadError) {
                $errors[] = 'Banner image upload failed: ' . $uploadError;
            }
        } elseif (!empty($_POST['generate_placeholders']) && $bannerUrl === '') {
            $bannerUrl = placeholder_url('banner', $slug . '-banner', 1600, 500);
        }

        if ($name === '' || $description === '') {
            $errors[] = 'Please fill in the name and description.';
        }
        if ($imageUrl === '') {
            $errors[] = 'Add a category image (upload a file or generate a placeholder).';
        }

        if (empty($errors)) {
            if ($isEdit) {
                $pdo->prepare(
                    'UPDATE categories SET name=?, slug=?, description=?, image_url=?, banner_url=?, meta_title=?,
                        meta_desc=?, sort_order=?, is_featured=? WHERE id=?'
                )->execute([
                    $name, $slug, $description, $imageUrl, $bannerUrl ?: null, $metaTitle ?: null,
                    $metaDesc ?: null, $sortOrder, $isFeatured, $categoryId,
                ]);
            } else {
                $pdo->prepare(
                    'INSERT INTO categories (name, slug, description, image_url, banner_url, meta_title, meta_desc, sort_order, is_featured)
                     VALUES (?,?,?,?,?,?,?,?,?)'
                )->execute([
                    $name, $slug, $description, $imageUrl, $bannerUrl ?: null, $metaTitle ?: null,
                    $metaDesc ?: null, $sortOrder, $isFeatured,
                ]);
            }
            flash_set('success', $isEdit ? 'Category updated.' : 'Category created.');
            redirect('/admin/categories');
        }
    }
}

$v = [
    'name' => $category['name'] ?? '',
    'slug' => $category['slug'] ?? '',
    'description' => $category['description'] ?? '',
    'image_url' => $category['image_url'] ?? '',
    'banner_url' => $category['banner_url'] ?? '',
    'meta_title' => $category['meta_title'] ?? '',
    'meta_desc' => $category['meta_desc'] ?? '',
    'sort_order' => $category['sort_order'] ?? 0,
    'is_featured' => $category['is_featured'] ?? 1,
];

$pageTitle = $isEdit ? 'Edit Category' : 'Add Category';
$activeAdminPath = '/admin/categories';
require __DIR__ . '/../../../Views/admin_shell_open.php';
?>
<div class="mb-6">
  <h1 class="font-display text-2xl text-brand-ink sm:text-3xl"><?= $isEdit ? 'Edit Category' : 'Add Category' ?></h1>
</div>

<?php foreach ($errors as $err): ?>
  <p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"><?= e($err) ?></p>
<?php endforeach; ?>

<form method="post" enctype="multipart/form-data" class="flex max-w-2xl flex-col gap-5 rounded-2xl border border-black/5 bg-white p-6">
  <?= csrf_field() ?>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Category Name</span>
      <input name="name" required value="<?= e($v['name']) ?>" class="input-field">
    </label>
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">URL Slug</span>
      <input name="slug" placeholder="auto-generated from name" value="<?= e($v['slug']) ?>" class="input-field">
    </label>
  </div>
  <label class="flex flex-col gap-1.5">
    <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Description</span>
    <textarea name="description" required rows="3" class="input-field"><?= e($v['description']) ?></textarea>
  </label>
  <label class="flex flex-col gap-1.5">
    <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Display Order</span>
    <input type="number" name="sort_order" value="<?= (int) $v['sort_order'] ?>" class="input-field max-w-[140px]">
  </label>

  <div class="flex items-center justify-between">
    <span class="text-xs font-semibold uppercase tracking-wide text-brand-ink">Images</span>
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div class="flex flex-col gap-2">
      <p class="text-xs text-black/50">Card / Thumbnail Image</p>
      <?php if ($v['image_url']): ?><img src="<?= e($v['image_url']) ?>" alt="" class="h-32 w-24 rounded-lg object-cover"><?php endif; ?>
      <input type="file" name="image" accept="image/*" class="text-xs">
    </div>
    <div class="flex flex-col gap-2">
      <p class="text-xs text-black/50">Banner Image (category page hero)</p>
      <?php if ($v['banner_url']): ?><img src="<?= e($v['banner_url']) ?>" alt="" class="h-20 w-full max-w-[200px] rounded-lg object-cover"><?php endif; ?>
      <input type="file" name="banner" accept="image/*" class="text-xs">
    </div>
  </div>
  <label class="flex items-center gap-2 text-xs text-black/60">
    <input type="checkbox" name="generate_placeholders" value="1" class="h-4 w-4 accent-brand-primary">
    Generate placeholder images for any of the above left empty
  </label>

  <label class="flex flex-col gap-1.5">
    <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Meta Title</span>
    <input name="meta_title" value="<?= e($v['meta_title']) ?>" class="input-field">
  </label>
  <label class="flex flex-col gap-1.5">
    <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Meta Description</span>
    <textarea name="meta_desc" rows="2" class="input-field"><?= e($v['meta_desc']) ?></textarea>
  </label>

  <label class="flex items-center justify-between text-sm">
    <span class="text-black/70">Featured on homepage</span>
    <input type="checkbox" name="is_featured" <?= $v['is_featured'] ? 'checked' : '' ?> class="h-4 w-4 accent-brand-primary">
  </label>

  <button type="submit" class="btn-primary self-start"><?= $isEdit ? 'Save Changes' : 'Create Category' ?></button>
</form>
<?php require __DIR__ . '/../../../Views/admin_shell_close.php'; ?>
