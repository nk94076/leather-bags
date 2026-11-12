<?php
/**
 * Expects in scope: $basePath (string), $lockedCategory (?string), $categories (array),
 * and reads current filters from $_GET.
 */
$selectedCategories = $lockedCategory ? [$lockedCategory] : array_filter(explode(',', $_GET['category'] ?? ''));
$selectedMaterials = array_filter(explode(',', $_GET['material'] ?? ''));
$selectedColors = array_filter(explode(',', $_GET['color'] ?? ''));
$availability = $_GET['availability'] ?? '';
$rating = $_GET['rating'] ?? '';
$minPrice = $_GET['minPrice'] ?? '';
$maxPrice = $_GET['maxPrice'] ?? '';
$q = $_GET['q'] ?? '';
$sort = $_GET['sort'] ?? '';
$view = $_GET['view'] ?? '';
?>
<aside class="w-full lg:w-72 lg:shrink-0">
  <form method="get" action="<?= e(base_url($basePath)) ?>" class="flex flex-col gap-8">
    <?php if ($q): ?><input type="hidden" name="q" value="<?= e($q) ?>"><?php endif; ?>
    <?php if ($sort): ?><input type="hidden" name="sort" value="<?= e($sort) ?>"><?php endif; ?>
    <?php if ($view): ?><input type="hidden" name="view" value="<?= e($view) ?>"><?php endif; ?>
    <?php if ($lockedCategory): ?><input type="hidden" name="category" value="<?= e($lockedCategory) ?>"><?php endif; ?>

    <?php if (!$lockedCategory): ?>
    <div class="flex flex-col gap-3 border-b border-black/5 pb-6">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-brand-ink">Category</h3>
      <?php foreach ($categories as $cat): ?>
        <label class="flex cursor-pointer items-center gap-2.5 text-sm text-black/70">
          <input type="checkbox" name="category[]" value="<?= e($cat['slug']) ?>" <?= in_array($cat['slug'], $selectedCategories, true) ? 'checked' : '' ?> class="h-4 w-4 accent-brand-primary">
          <?= e($cat['name']) ?>
        </label>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <div class="flex flex-col gap-3 border-b border-black/5 pb-6">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-brand-ink">Price Range</h3>
      <div class="flex items-center gap-2">
        <input type="number" name="minPrice" min="0" placeholder="Min" value="<?= e($minPrice) ?>" class="w-full rounded-lg border border-black/10 px-3 py-2 text-xs">
        <span class="text-black/30">–</span>
        <input type="number" name="maxPrice" min="0" placeholder="Max 25000" value="<?= e($maxPrice) ?>" class="w-full rounded-lg border border-black/10 px-3 py-2 text-xs">
      </div>
    </div>

    <div class="flex flex-col gap-3 border-b border-black/5 pb-6">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-brand-ink">Leather Material</h3>
      <?php foreach (LEATHER_TYPES as $m): ?>
        <label class="flex cursor-pointer items-center gap-2.5 text-sm text-black/70">
          <input type="checkbox" name="material[]" value="<?= e($m) ?>" <?= in_array($m, $selectedMaterials, true) ? 'checked' : '' ?> class="h-4 w-4 accent-brand-primary">
          <?= e($m) ?>
        </label>
      <?php endforeach; ?>
    </div>

    <div class="flex flex-col gap-3 border-b border-black/5 pb-6">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-brand-ink">Colour</h3>
      <div class="flex flex-wrap gap-2">
        <?php foreach (COLOR_PALETTE as $c): $checked = in_array($c['name'], $selectedColors, true); ?>
          <label title="<?= e($c['name']) ?>" class="relative">
            <input type="checkbox" name="color[]" value="<?= e($c['name']) ?>" <?= $checked ? 'checked' : '' ?> class="peer sr-only">
            <span class="block h-7 w-7 cursor-pointer rounded-full border-2 <?= $checked ? 'border-brand-primary scale-110' : 'border-transparent' ?>" style="background-color:<?= e($c['hex']) ?>"></span>
          </label>
        <?php endforeach; ?>
      </div>
    </div>

    <div class="flex flex-col gap-3 border-b border-black/5 pb-6">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-brand-ink">Availability</h3>
      <label class="flex cursor-pointer items-center gap-2.5 text-sm text-black/70"><input type="radio" name="availability" value="" <?= $availability === '' ? 'checked' : '' ?> class="h-4 w-4 accent-brand-primary"> All</label>
      <label class="flex cursor-pointer items-center gap-2.5 text-sm text-black/70"><input type="radio" name="availability" value="in-stock" <?= $availability === 'in-stock' ? 'checked' : '' ?> class="h-4 w-4 accent-brand-primary"> In Stock</label>
      <label class="flex cursor-pointer items-center gap-2.5 text-sm text-black/70"><input type="radio" name="availability" value="out-of-stock" <?= $availability === 'out-of-stock' ? 'checked' : '' ?> class="h-4 w-4 accent-brand-primary"> Out of Stock</label>
    </div>

    <div class="flex flex-col gap-3">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-brand-ink">Rating</h3>
      <?php foreach ([4, 3, 2] as $r): ?>
        <label class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left <?= $rating === (string) $r ? 'bg-brand-cream-dark' : '' ?>">
          <input type="radio" name="rating" value="<?= $r ?>" <?= $rating === (string) $r ? 'checked' : '' ?> class="h-4 w-4 accent-brand-primary">
          <span class="text-xs text-black/60"><?= $r ?>+ Stars</span>
        </label>
      <?php endforeach; ?>
      <label class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left">
        <input type="radio" name="rating" value="" <?= $rating === '' ? 'checked' : '' ?> class="h-4 w-4 accent-brand-primary">
        <span class="text-xs text-black/60">Any Rating</span>
      </label>
    </div>

    <button type="submit" class="btn-primary">Apply Filters</button>
    <a href="<?= e(base_url($basePath)) ?>" class="text-center text-xs font-medium text-brand-primary hover:underline">Clear All Filters</a>
  </form>
</aside>
