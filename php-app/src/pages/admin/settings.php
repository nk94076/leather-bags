<?php
declare(strict_types=1);

$pdo = Database::pdo();

$SETTINGS_SECTIONS = [
    'general' => ['label' => 'General', 'fields' => [
        ['key' => 'siteName', 'label' => 'Website Name'],
        ['key' => 'tagline', 'label' => 'Tagline'],
        ['key' => 'logoUrl', 'label' => 'Logo URL'],
        ['key' => 'favicon', 'label' => 'Favicon URL'],
        ['key' => 'email', 'label' => 'Contact Email'],
        ['key' => 'supportEmail', 'label' => 'Support Email'],
        ['key' => 'phone', 'label' => 'Phone Number'],
        ['key' => 'whatsapp', 'label' => 'WhatsApp Number'],
        ['key' => 'address', 'label' => 'Business Address', 'type' => 'textarea'],
    ]],
    'theme' => ['label' => 'Theme Colors', 'fields' => [
        ['key' => 'primary', 'label' => 'Primary Color (Light Brown)', 'type' => 'color'],
        ['key' => 'secondary', 'label' => 'Secondary Color (Dark Brown)', 'type' => 'color'],
        ['key' => 'gold', 'label' => 'Accent Color (Gold)', 'type' => 'color'],
    ]],
    'social' => ['label' => 'Social Links', 'fields' => [
        ['key' => 'instagram', 'label' => 'Instagram URL'],
        ['key' => 'facebook', 'label' => 'Facebook URL'],
        ['key' => 'twitter', 'label' => 'Twitter / X URL'],
        ['key' => 'pinterest', 'label' => 'Pinterest URL'],
    ]],
    'seo' => ['label' => 'SEO & Analytics', 'fields' => [
        ['key' => 'defaultMetaTitle', 'label' => 'Default Meta Title'],
        ['key' => 'defaultMetaDesc', 'label' => 'Default Meta Description', 'type' => 'textarea'],
        ['key' => 'gaId', 'label' => 'Google Analytics ID'],
        ['key' => 'gtmId', 'label' => 'Google Tag Manager ID'],
        ['key' => 'metaPixelId', 'label' => 'Meta Pixel ID'],
        ['key' => 'searchConsoleVerification', 'label' => 'Google Search Console Verification Code'],
    ]],
    'payment' => ['label' => 'Payment Settings', 'fields' => [
        ['key' => 'codEnabled', 'label' => 'Cash on Delivery', 'type' => 'checkbox'],
        ['key' => 'upiEnabled', 'label' => 'UPI', 'type' => 'checkbox'],
        ['key' => 'cardEnabled', 'label' => 'Credit / Debit Card', 'type' => 'checkbox'],
        ['key' => 'netbankingEnabled', 'label' => 'Net Banking', 'type' => 'checkbox'],
        ['key' => 'walletEnabled', 'label' => 'Wallets', 'type' => 'checkbox'],
        ['key' => 'codFee', 'label' => 'COD Handling Fee (₹)', 'type' => 'number'],
        ['key' => 'codMaxOrderValue', 'label' => 'Max Order Value for COD (₹)', 'type' => 'number'],
    ]],
    'shipping' => ['label' => 'Shipping Settings', 'fields' => [
        ['key' => 'freeShippingThreshold', 'label' => 'Free Shipping Threshold (₹)', 'type' => 'number'],
        ['key' => 'standardFee', 'label' => 'Standard Shipping Fee (₹)', 'type' => 'number'],
        ['key' => 'expressFee', 'label' => 'Express Shipping Fee (₹)', 'type' => 'number'],
        ['key' => 'standardDeliveryDays', 'label' => 'Standard Delivery (days)'],
        ['key' => 'expressDeliveryDays', 'label' => 'Express Delivery (days)'],
    ]],
    'tax' => ['label' => 'Tax Settings', 'fields' => [
        ['key' => 'gstPercent', 'label' => 'GST Percentage (%)', 'type' => 'number'],
        ['key' => 'pricesIncludeTax', 'label' => 'Prices Include Tax', 'type' => 'checkbox'],
    ]],
    'currency' => ['label' => 'Currency', 'fields' => [
        ['key' => 'code', 'label' => 'Currency Code'],
        ['key' => 'symbol', 'label' => 'Currency Symbol'],
    ]],
    'smtp' => ['label' => 'SMTP (Email Delivery)', 'fields' => [
        ['key' => 'host', 'label' => 'SMTP Host'],
        ['key' => 'port', 'label' => 'SMTP Port', 'type' => 'number'],
        ['key' => 'username', 'label' => 'SMTP Username'],
        ['key' => 'password', 'label' => 'SMTP Password'],
        ['key' => 'fromEmail', 'label' => 'From Email Address'],
    ]],
];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && csrf_verify()) {
    $settingKey = (string) ($_POST['setting_key'] ?? '');
    if (isset($SETTINGS_SECTIONS[$settingKey])) {
        $value = [];
        foreach ($SETTINGS_SECTIONS[$settingKey]['fields'] as $field) {
            $fk = $field['key'];
            if (($field['type'] ?? 'text') === 'checkbox') {
                $value[$fk] = !empty($_POST['field'][$fk]);
            } elseif (($field['type'] ?? 'text') === 'number') {
                $value[$fk] = is_numeric($_POST['field'][$fk] ?? null) ? (float) $_POST['field'][$fk] : 0;
            } else {
                $value[$fk] = trim((string) ($_POST['field'][$fk] ?? ''));
            }
        }
        $exists = $pdo->prepare('SELECT id FROM settings WHERE `key` = ?');
        $exists->execute([$settingKey]);
        if ($exists->fetch()) {
            $pdo->prepare('UPDATE settings SET value = ? WHERE `key` = ?')->execute([json_encode($value), $settingKey]);
        } else {
            $pdo->prepare('INSERT INTO settings (`key`, value) VALUES (?, ?)')->execute([$settingKey, json_encode($value)]);
        }
        flash_set('success', $SETTINGS_SECTIONS[$settingKey]['label'] . ' updated.');
    }
    redirect('/admin/settings');
}

$settingRows = $pdo->query('SELECT * FROM settings')->fetchAll();
$settingsMap = [];
foreach ($settingRows as $row) {
    $settingsMap[$row['key']] = json_decode_assoc($row['value']);
}

$pageTitle = 'Settings';
$activeAdminPath = '/admin/settings';
require __DIR__ . '/../../Views/admin_shell_open.php';
?>
<div class="mb-6">
  <h1 class="font-display text-2xl text-brand-ink sm:text-3xl">Settings</h1>
  <p class="mt-1 text-sm text-black/50">Configure site-wide branding, payments, shipping, tax and SEO</p>
</div>

<div class="flex flex-col gap-6">
  <?php foreach ($SETTINGS_SECTIONS as $key => $section): $values = $settingsMap[$key] ?? []; ?>
    <div class="rounded-2xl border border-black/5 bg-white p-6">
      <h2 class="mb-4 font-display text-lg text-brand-ink"><?= e($section['label']) ?></h2>
      <form action="<?= e(base_url('/admin/settings')) ?>" method="post" class="flex flex-col gap-4">
        <?= csrf_field() ?>
        <input type="hidden" name="setting_key" value="<?= e($key) ?>">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <?php foreach ($section['fields'] as $field):
            $type = $field['type'] ?? 'text';
            $val = $values[$field['key']] ?? '';
          ?>
            <label class="flex flex-col gap-1.5 <?= $type === 'textarea' ? 'sm:col-span-2' : '' ?>">
              <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary"><?= e($field['label']) ?></span>
              <?php if ($type === 'textarea'): ?>
                <textarea name="field[<?= e($field['key']) ?>]" rows="2" class="input-field"><?= e((string) $val) ?></textarea>
              <?php elseif ($type === 'checkbox'): ?>
                <input type="checkbox" name="field[<?= e($field['key']) ?>]" <?= $val ? 'checked' : '' ?> class="h-5 w-5 accent-brand-primary">
              <?php elseif ($type === 'color'): ?>
                <div class="flex items-center gap-2">
                  <input type="color" name="field[<?= e($field['key']) ?>]" value="<?= e((string) ($val ?: '#B9855A')) ?>" class="h-10 w-14 cursor-pointer rounded border border-black/10">
                  <span class="text-xs text-black/50"><?= e((string) $val) ?></span>
                </div>
              <?php elseif ($type === 'number'): ?>
                <input type="number" name="field[<?= e($field['key']) ?>]" value="<?= e((string) $val) ?>" class="input-field">
              <?php else: ?>
                <input name="field[<?= e($field['key']) ?>]" value="<?= e((string) $val) ?>" class="input-field">
              <?php endif; ?>
            </label>
          <?php endforeach; ?>
        </div>
        <button type="submit" class="btn-primary btn-sm self-start">Save</button>
      </form>
    </div>
  <?php endforeach; ?>
</div>
<?php require __DIR__ . '/../../Views/admin_shell_close.php'; ?>
