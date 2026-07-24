<?php
declare(strict_types=1);

$authUser = Auth::user();
$pdo = Database::pdo();

$addrStmt = $pdo->prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC');
$addrStmt->execute([$authUser['id']]);
$addresses = $addrStmt->fetchAll();

$pageTitle = 'My Addresses';
$noindex = true;
$activePath = '/account/addresses';
require __DIR__ . '/../../Views/layout_open.php';
require __DIR__ . '/../../Views/account_layout_open.php';
?>
<div class="flex flex-col gap-6">
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <?php foreach ($addresses as $a): ?>
      <div class="rounded-2xl border border-black/5 bg-white p-5">
        <div class="mb-2 flex items-center justify-between">
          <span class="flex items-center gap-2 text-sm font-semibold text-brand-ink">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-brand-primary"><path d="M12 22s8-6.5 8-12a8 8 0 1 0-16 0c0 5.5 8 12 8 12Z"/><circle cx="12" cy="10" r="3"/></svg>
            <?= e($a['label']) ?>
          </span>
          <?php if ($a['is_default']): ?><span class="text-[10px] font-semibold uppercase text-brand-primary">Default</span><?php endif; ?>
        </div>
        <p class="text-sm text-black/60"><?= e($a['full_name']) ?></p>
        <p class="text-sm text-black/50"><?= e($a['line1']) ?><?= $a['line2'] ? ', ' . e($a['line2']) : '' ?>, <?= e($a['city']) ?>, <?= e($a['state']) ?> <?= e($a['postal_code']) ?></p>
        <p class="text-sm text-black/50"><?= e($a['phone']) ?></p>
        <div class="mt-4 flex gap-4">
          <?php if (!$a['is_default']): ?>
            <form action="<?= e(base_url('/address/default')) ?>" method="post">
              <?= csrf_field() ?>
              <input type="hidden" name="address_id" value="<?= (int) $a['id'] ?>">
              <input type="hidden" name="redirect" value="/account/addresses">
              <button type="submit" class="flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z"/></svg>
                Set as Default
              </button>
            </form>
          <?php endif; ?>
          <form action="<?= e(base_url('/address/delete')) ?>" method="post" data-confirm="Remove this address?">
            <?= csrf_field() ?>
            <input type="hidden" name="address_id" value="<?= (int) $a['id'] ?>">
            <input type="hidden" name="redirect" value="/account/addresses">
            <button type="submit" class="flex items-center gap-1 text-xs font-medium text-red-500 hover:underline">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Remove
            </button>
          </form>
        </div>
      </div>
    <?php endforeach; ?>
  </div>

  <button type="button" data-toggle-target="new-address-form" class="btn-outline self-start">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-1.5 inline"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
    Add New Address
  </button>

  <div id="new-address-form" class="hidden max-w-2xl rounded-2xl border border-black/5 bg-white p-6">
    <h3 class="mb-4 font-display text-lg text-brand-ink">Add New Address</h3>
    <form action="<?= e(base_url('/address/add')) ?>" method="post" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <?= csrf_field() ?>
      <input type="hidden" name="redirect" value="/account/addresses">
      <label class="flex flex-col gap-1.5 sm:col-span-2">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Label</span>
        <input name="label" required placeholder="Home, Work, etc." class="input-field">
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Full Name</span>
        <input name="full_name" required class="input-field">
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Phone</span>
        <input name="phone" required class="input-field">
      </label>
      <label class="flex flex-col gap-1.5 sm:col-span-2">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Address Line 1</span>
        <input name="line1" required class="input-field">
      </label>
      <label class="flex flex-col gap-1.5 sm:col-span-2">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Address Line 2 (optional)</span>
        <input name="line2" class="input-field">
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">City</span>
        <input name="city" required class="input-field">
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">State</span>
        <input name="state" required class="input-field">
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Postal Code</span>
        <input name="postal_code" required class="input-field">
      </label>
      <label class="mt-1 flex items-center gap-2 text-sm text-black/60 sm:col-span-2">
        <input type="checkbox" name="is_default" value="1" class="h-4 w-4 accent-brand-primary"> Set as default address
      </label>
      <div class="sm:col-span-2">
        <button type="submit" class="btn-primary">Save Address</button>
      </div>
    </form>
  </div>
</div>
<?php
require __DIR__ . '/../../Views/account_layout_close.php';
require __DIR__ . '/../../Views/layout_close.php';
