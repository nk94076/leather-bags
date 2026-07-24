<?php
/** Expects $b (array|null — null means "add new") and $placement (string) in scope. */
$isNew = $b === null;
?>
<div class="flex flex-col gap-4 rounded-xl border <?= $isNew ? 'border-dashed border-black/20' : 'border-black/10' ?> p-4 sm:flex-row">
  <div class="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-brand-cream-dark sm:w-48">
    <?php if (!$isNew): ?><img src="<?= e($b['image_url']) ?>" alt="" class="h-full w-full object-cover"><?php endif; ?>
  </div>
  <form action="<?= e(base_url('/admin/homepage')) ?>" method="post" enctype="multipart/form-data" class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
    <?= csrf_field() ?>
    <input type="hidden" name="form_type" value="banner_save">
    <input type="hidden" name="placement" value="<?= e($placement) ?>">
    <?php if (!$isNew): ?>
      <input type="hidden" name="banner_id" value="<?= (int) $b['id'] ?>">
      <input type="hidden" name="existing_image_url" value="<?= e($b['image_url']) ?>">
    <?php endif; ?>
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Title (optional)</span>
      <input name="title" value="<?= e($b['title'] ?? '') ?>" placeholder="<?= $isNew ? 'New banner title' : '' ?>" class="input-field">
    </label>
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Subtitle</span>
      <input name="subtitle" value="<?= e($b['subtitle'] ?? '') ?>" class="input-field">
    </label>
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">CTA Label</span>
      <input name="cta_label" value="<?= e($b['cta_label'] ?? ($isNew ? 'Shop Now' : '')) ?>" class="input-field">
    </label>
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">CTA URL</span>
      <input name="cta_url" value="<?= e($b['cta_url'] ?? ($isNew ? '/shop' : '')) ?>" class="input-field">
    </label>
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Replace Image</span>
      <input type="file" name="image" accept="image/*" class="text-xs">
    </label>
    <?php if ($isNew): ?>
      <label class="flex items-center gap-2 self-end text-xs text-black/60">
        <input type="checkbox" name="generate_placeholder" value="1" class="h-4 w-4 accent-brand-primary"> Generate placeholder if no image uploaded
      </label>
    <?php endif; ?>
    <div class="flex items-center gap-4 sm:col-span-2">
      <label class="flex items-center gap-2 text-xs text-black/60">
        Active
        <input type="checkbox" name="is_active" <?= ($b['is_active'] ?? 1) ? 'checked' : '' ?> class="h-4 w-4 accent-brand-primary">
      </label>
      <button type="submit" class="btn-primary btn-sm"><?= $isNew ? 'Add Slide' : 'Save' ?></button>
    </div>
  </form>
  <?php if (!$isNew): ?>
    <form action="<?= e(base_url('/admin/homepage')) ?>" method="post" data-confirm="Remove this banner?" class="shrink-0">
      <?= csrf_field() ?>
      <input type="hidden" name="form_type" value="banner_delete">
      <input type="hidden" name="banner_id" value="<?= (int) $b['id'] ?>">
      <button type="submit" class="flex items-center gap-1 text-xs text-red-500 hover:underline">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Remove
      </button>
    </form>
  <?php endif; ?>
</div>
