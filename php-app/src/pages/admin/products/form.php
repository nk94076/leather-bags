<?php
declare(strict_types=1);

$pdo = Database::pdo();
$productId = isset($params['id']) ? (int) $params['id'] : null;
$isEdit = $productId !== null;

$product = null;
$images = [];
if ($isEdit) {
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$productId]);
    $product = $stmt->fetch();
    if (!$product) {
        http_response_code(404);
        require __DIR__ . '/../../../Views/pages/404.php';
        exit;
    }
    $imgStmt = $pdo->prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC');
    $imgStmt->execute([$productId]);
    $images = $imgStmt->fetchAll();
    $selectedColors = json_decode_assoc($product['colors']);
}

$categories = $pdo->query('SELECT id, name FROM categories ORDER BY name ASC')->fetchAll();
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify()) {
        $errors[] = 'Your session expired. Please try again.';
    } else {
        $name = trim((string) ($_POST['name'] ?? ''));
        $slug = trim((string) ($_POST['slug'] ?? '')) ?: slugify($name);
        $sku = trim((string) ($_POST['sku'] ?? ''));
        $categoryId = (int) ($_POST['category_id'] ?? 0);
        $shortDescription = trim((string) ($_POST['short_description'] ?? ''));
        $description = trim((string) ($_POST['description'] ?? ''));
        $price = (float) ($_POST['price'] ?? 0);
        $compareAtPrice = !empty($_POST['compare_at_price']) ? (float) $_POST['compare_at_price'] : null;
        $stock = (int) ($_POST['stock'] ?? 0);
        $leatherType = $_POST['leather_type'] ?? LEATHER_TYPES[0];
        $dimensions = trim((string) ($_POST['dimensions'] ?? ''));
        $weight = trim((string) ($_POST['weight'] ?? ''));
        $warranty = trim((string) ($_POST['warranty'] ?? ''));
        $careInstructions = trim((string) ($_POST['care_instructions'] ?? ''));
        $metaTitle = trim((string) ($_POST['meta_title'] ?? ''));
        $metaDesc = trim((string) ($_POST['meta_desc'] ?? ''));
        $isActive = !empty($_POST['is_active']) ? 1 : 0;
        $isFeatured = !empty($_POST['is_featured']) ? 1 : 0;
        $isTrending = !empty($_POST['is_trending']) ? 1 : 0;
        $isLatest = !empty($_POST['is_latest']) ? 1 : 0;

        $colorNames = (array) ($_POST['colors'] ?? []);
        $colors = array_values(array_filter(COLOR_PALETTE, fn ($c) => in_array($c['name'], $colorNames, true)));

        if ($name === '' || $sku === '' || $categoryId <= 0 || $shortDescription === '' || $description === '') {
            $errors[] = 'Please fill in all required fields.';
        }
        if (empty($colors)) {
            $errors[] = 'Select at least one colour.';
        }

        if (empty($errors)) {
            if ($isEdit) {
                $pdo->prepare(
                    'UPDATE products SET name=?, slug=?, sku=?, category_id=?, short_description=?, description=?,
                        price=?, compare_at_price=?, stock=?, leather_type=?, dimensions=?, weight=?, warranty=?,
                        care_instructions=?, colors=?, is_active=?, is_featured=?, is_trending=?, is_latest=?,
                        meta_title=?, meta_desc=? WHERE id=?'
                )->execute([
                    $name, $slug, $sku, $categoryId, $shortDescription, $description,
                    $price, $compareAtPrice, $stock, $leatherType, $dimensions, $weight, $warranty,
                    $careInstructions, json_encode($colors), $isActive, $isFeatured, $isTrending, $isLatest,
                    $metaTitle ?: null, $metaDesc ?: null, $productId,
                ]);
            } else {
                $pdo->prepare(
                    'INSERT INTO products (name, slug, sku, category_id, short_description, description, price,
                        compare_at_price, stock, leather_type, dimensions, weight, warranty, care_instructions,
                        colors, is_active, is_featured, is_trending, is_latest, meta_title, meta_desc)
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
                )->execute([
                    $name, $slug, $sku, $categoryId, $shortDescription, $description, $price,
                    $compareAtPrice, $stock, $leatherType, $dimensions, $weight, $warranty, $careInstructions,
                    json_encode($colors), $isActive, $isFeatured, $isTrending, $isLatest, $metaTitle ?: null, $metaDesc ?: null,
                ]);
                $productId = (int) $pdo->lastInsertId();
            }

            // Remove images the admin unchecked.
            if ($isEdit) {
                $keepIds = array_map('intval', (array) ($_POST['keep_image_ids'] ?? []));
                if (empty($keepIds)) {
                    $pdo->prepare('DELETE FROM product_images WHERE product_id = ?')->execute([$productId]);
                } else {
                    $placeholders = implode(',', array_fill(0, count($keepIds), '?'));
                    $pdo->prepare("DELETE FROM product_images WHERE product_id = ? AND id NOT IN ($placeholders)")
                        ->execute([$productId, ...$keepIds]);
                }
                // Update alt text on kept images.
                $altTexts = (array) ($_POST['image_alt'] ?? []);
                foreach ($altTexts as $imgId => $alt) {
                    if (in_array((int) $imgId, $keepIds, true)) {
                        $pdo->prepare('UPDATE product_images SET alt_text = ? WHERE id = ? AND product_id = ?')
                            ->execute([trim((string) $alt) ?: $name, (int) $imgId, $productId]);
                    }
                }
            }

            // Handle new file uploads.
            $nextSortStmt = $pdo->prepare('SELECT COALESCE(MAX(sort_order),-1)+1 AS n FROM product_images WHERE product_id = ?');
            $nextSortStmt->execute([$productId]);
            $nextSort = (int) $nextSortStmt->fetch()['n'];

            $uploadedAny = false;
            if (!empty($_FILES['new_images']) && is_array($_FILES['new_images']['tmp_name'])) {
                foreach ($_FILES['new_images']['tmp_name'] as $i => $tmp) {
                    if ($_FILES['new_images']['error'][$i] !== UPLOAD_ERR_OK) {
                        continue;
                    }
                    $file = [
                        'tmp_name' => $tmp,
                        'error' => $_FILES['new_images']['error'][$i],
                        'size' => $_FILES['new_images']['size'][$i],
                    ];
                    $url = admin_save_upload($file, 'products', $name);
                    if ($url) {
                        $pdo->prepare('INSERT INTO product_images (product_id, url, alt_text, sort_order) VALUES (?,?,?,?)')
                            ->execute([$productId, $url, $name . ' - view ' . ($nextSort + 1), $nextSort]);
                        $nextSort++;
                        $uploadedAny = true;
                    }
                }
            }

            // Generate placeholder photography if requested (or no images exist yet at all).
            $countStmt = $pdo->prepare('SELECT COUNT(*) AS c FROM product_images WHERE product_id = ?');
            $countStmt->execute([$productId]);
            $currentImageCount = (int) $countStmt->fetch()['c'];

            if (!empty($_POST['generate_placeholders']) && !$uploadedAny) {
                for ($i = 0; $i < 3; $i++) {
                    $imgUrl = placeholder_url('product', $slug . '-' . $i, 1000, 1250, $name);
                    $pdo->prepare('INSERT INTO product_images (product_id, url, alt_text, sort_order) VALUES (?,?,?,?)')
                        ->execute([$productId, $imgUrl, $name . ' - view ' . ($i + 1), $nextSort + $i]);
                }
                $currentImageCount += 3;
            }

            if ($currentImageCount === 0) {
                $errors[] = 'Product saved, but it has no images yet — please upload photos or generate placeholders.';
            } else {
                flash_set('success', $isEdit ? 'Product updated.' : 'Product created.');
                redirect('/admin/products');
            }
        }
    }
}

$v = [
    'name' => $product['name'] ?? '',
    'slug' => $product['slug'] ?? '',
    'sku' => $product['sku'] ?? '',
    'category_id' => $product['category_id'] ?? ($categories[0]['id'] ?? ''),
    'short_description' => $product['short_description'] ?? '',
    'description' => $product['description'] ?? '',
    'price' => $product['price'] ?? '',
    'compare_at_price' => $product['compare_at_price'] ?? '',
    'stock' => $product['stock'] ?? 0,
    'leather_type' => $product['leather_type'] ?? LEATHER_TYPES[0],
    'dimensions' => $product['dimensions'] ?? '',
    'weight' => $product['weight'] ?? '',
    'warranty' => $product['warranty'] ?? '2-Year Craftsmanship Warranty',
    'care_instructions' => $product['care_instructions'] ?? '',
    'meta_title' => $product['meta_title'] ?? '',
    'meta_desc' => $product['meta_desc'] ?? '',
    'is_active' => $product['is_active'] ?? 1,
    'is_featured' => $product['is_featured'] ?? 0,
    'is_trending' => $product['is_trending'] ?? 0,
    'is_latest' => $product['is_latest'] ?? 0,
];
$selectedColorNames = array_column($selectedColors ?? [], 'name');

$pageTitle = $isEdit ? 'Edit Product' : 'Add Product';
$activeAdminPath = '/admin/products';
require __DIR__ . '/../../../Views/admin_shell_open.php';
?>
<div class="mb-6">
  <h1 class="font-display text-2xl text-brand-ink sm:text-3xl"><?= $isEdit ? 'Edit Product' : 'Add Product' ?></h1>
  <p class="mt-1 text-sm text-black/50"><?= $isEdit ? 'Update this product listing' : 'Create a new product listing' ?></p>
</div>

<?php foreach ($errors as $err): ?>
  <p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"><?= e($err) ?></p>
<?php endforeach; ?>

<form method="post" enctype="multipart/form-data" class="flex flex-col gap-8">
  <?= csrf_field() ?>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div class="flex flex-col gap-5 rounded-2xl border border-black/5 bg-white p-6 lg:col-span-2">
      <h2 class="font-display text-lg text-brand-ink">Basic Information</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Product Name</span>
          <input name="name" required value="<?= e($v['name']) ?>" class="input-field">
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">URL Slug</span>
          <input name="slug" placeholder="auto-generated from name" value="<?= e($v['slug']) ?>" class="input-field">
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">SKU</span>
          <input name="sku" required value="<?= e($v['sku']) ?>" class="input-field">
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Category</span>
          <select name="category_id" class="input-field">
            <?php foreach ($categories as $c): ?>
              <option value="<?= (int) $c['id'] ?>" <?= (int) $v['category_id'] === (int) $c['id'] ? 'selected' : '' ?>><?= e($c['name']) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
      </div>

      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Short Description</span>
        <textarea name="short_description" required rows="2" class="input-field"><?= e($v['short_description']) ?></textarea>
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Full Description</span>
        <textarea name="description" required rows="5" class="input-field"><?= e($v['description']) ?></textarea>
      </label>

      <h2 class="mt-2 font-display text-lg text-brand-ink">Pricing &amp; Inventory</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Price (₹)</span>
          <input type="number" name="price" required min="0" value="<?= e((string) $v['price']) ?>" class="input-field">
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Compare-at Price (₹)</span>
          <input type="number" name="compare_at_price" min="0" value="<?= e((string) $v['compare_at_price']) ?>" class="input-field">
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Stock Quantity</span>
          <input type="number" name="stock" required min="0" value="<?= e((string) $v['stock']) ?>" class="input-field">
        </label>
      </div>

      <h2 class="mt-2 font-display text-lg text-brand-ink">Specifications</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Leather Type</span>
          <select name="leather_type" class="input-field">
            <?php foreach (LEATHER_TYPES as $t): ?>
              <option value="<?= e($t) ?>" <?= $v['leather_type'] === $t ? 'selected' : '' ?>><?= e($t) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Dimensions</span>
          <input name="dimensions" value="<?= e($v['dimensions']) ?>" class="input-field">
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Weight</span>
          <input name="weight" value="<?= e($v['weight']) ?>" class="input-field">
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Warranty</span>
          <input name="warranty" value="<?= e($v['warranty']) ?>" class="input-field">
        </label>
      </div>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Care Instructions</span>
        <textarea name="care_instructions" rows="2" class="input-field"><?= e($v['care_instructions']) ?></textarea>
      </label>

      <h2 class="mt-2 font-display text-lg text-brand-ink">Colours</h2>
      <div class="flex flex-wrap gap-3">
        <?php foreach (COLOR_PALETTE as $c): $checked = in_array($c['name'], $selectedColorNames, true); ?>
          <label class="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs <?= $checked ? 'border-brand-primary bg-brand-cream' : 'border-black/10' ?>">
            <input type="checkbox" name="colors[]" value="<?= e($c['name']) ?>" <?= $checked ? 'checked' : '' ?> class="sr-only">
            <span class="h-4 w-4 rounded-full border border-black/10" style="background-color:<?= e($c['hex']) ?>"></span>
            <?= e($c['name']) ?>
          </label>
        <?php endforeach; ?>
      </div>

      <h2 class="mt-2 font-display text-lg text-brand-ink">SEO</h2>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Meta Title</span>
        <input name="meta_title" value="<?= e($v['meta_title']) ?>" class="input-field">
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Meta Description</span>
        <textarea name="meta_desc" rows="2" class="input-field"><?= e($v['meta_desc']) ?></textarea>
      </label>
    </div>

    <div class="flex flex-col gap-6">
      <div class="rounded-2xl border border-black/5 bg-white p-6">
        <h2 class="mb-4 font-display text-lg text-brand-ink">Images</h2>
        <?php if ($images): ?>
          <div class="mb-4 flex flex-col gap-3">
            <?php foreach ($images as $img): ?>
              <div class="flex items-center gap-2">
                <img src="<?= e($img['url']) ?>" alt="" class="h-12 w-12 shrink-0 rounded-lg object-cover">
                <input type="text" name="image_alt[<?= (int) $img['id'] ?>]" value="<?= e($img['alt_text']) ?>" class="input-field">
                <label class="flex shrink-0 items-center gap-1 text-xs text-black/50">
                  <input type="checkbox" name="keep_image_ids[]" value="<?= (int) $img['id'] ?>" checked class="h-4 w-4 accent-brand-primary"> Keep
                </label>
              </div>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Upload New Images</span>
          <input type="file" name="new_images[]" accept="image/*" multiple class="text-xs">
        </label>
        <label class="mt-3 flex items-center gap-2 text-xs text-black/60">
          <input type="checkbox" name="generate_placeholders" value="1" class="h-4 w-4 accent-brand-primary">
          Generate placeholder photography instead (only used if no files are uploaded)
        </label>
        <?php if (empty($images)): ?>
          <p class="mt-3 text-xs text-black/40">No images yet. Upload real photos or check the box above for placeholder photography.</p>
        <?php endif; ?>
      </div>

      <div class="rounded-2xl border border-black/5 bg-white p-6">
        <h2 class="mb-4 font-display text-lg text-brand-ink">Visibility</h2>
        <div class="flex flex-col gap-3 text-sm">
          <label class="flex items-center justify-between gap-3"><span class="text-black/70">Active (visible on storefront)</span><input type="checkbox" name="is_active" <?= $v['is_active'] ? 'checked' : '' ?> class="h-4 w-4 accent-brand-primary"></label>
          <label class="flex items-center justify-between gap-3"><span class="text-black/70">Featured Product</span><input type="checkbox" name="is_featured" <?= $v['is_featured'] ? 'checked' : '' ?> class="h-4 w-4 accent-brand-primary"></label>
          <label class="flex items-center justify-between gap-3"><span class="text-black/70">Trending Product</span><input type="checkbox" name="is_trending" <?= $v['is_trending'] ? 'checked' : '' ?> class="h-4 w-4 accent-brand-primary"></label>
          <label class="flex items-center justify-between gap-3"><span class="text-black/70">Latest Product</span><input type="checkbox" name="is_latest" <?= $v['is_latest'] ? 'checked' : '' ?> class="h-4 w-4 accent-brand-primary"></label>
        </div>
      </div>

      <button type="submit" class="btn-primary w-full"><?= $isEdit ? 'Save Changes' : 'Create Product' ?></button>
    </div>
  </div>
</form>
<?php require __DIR__ . '/../../../Views/admin_shell_close.php'; ?>
