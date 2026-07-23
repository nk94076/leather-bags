<?php
declare(strict_types=1);

$authUser = Auth::user();
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify()) {
        $errors[] = 'Your session expired. Please try again.';
    } else {
        $currentPassword = (string) ($_POST['current_password'] ?? '');
        $newPassword = (string) ($_POST['new_password'] ?? '');
        $confirmPassword = (string) ($_POST['confirm_password'] ?? '');

        if ($currentPassword === '') {
            $errors[] = 'Enter your current password.';
        }
        if (mb_strlen($newPassword) < 8) {
            $errors[] = 'New password must be at least 8 characters.';
        }
        if ($newPassword !== $confirmPassword) {
            $errors[] = 'Passwords do not match.';
        }

        if (empty($errors)) {
            $pdo = Database::pdo();
            $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
            $stmt->execute([$authUser['id']]);
            $row = $stmt->fetch();

            if (!$row || !password_verify($currentPassword, $row['password_hash'])) {
                $errors[] = 'Current password is incorrect.';
            } else {
                $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
                $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$newHash, $authUser['id']]);
                flash_set('success', 'Password updated successfully.');
                redirect('/account/password');
            }
        }
    }
}

$pageTitle = 'Change Password';
$noindex = true;
$activePath = '/account/password';
require __DIR__ . '/../../Views/layout_open.php';
require __DIR__ . '/../../Views/account_layout_open.php';
?>
<div class="max-w-md rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
  <h3 class="mb-6 font-display text-lg text-brand-ink">Change Password</h3>
  <?php foreach ($errors as $err): ?>
    <p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"><?= e($err) ?></p>
  <?php endforeach; ?>
  <form method="post" class="flex flex-col gap-4">
    <?= csrf_field() ?>
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Current Password</span>
      <input type="password" name="current_password" required class="input-field">
    </label>
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">New Password</span>
      <input type="password" name="new_password" required minlength="8" class="input-field">
    </label>
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Confirm New Password</span>
      <input type="password" name="confirm_password" required minlength="8" class="input-field">
    </label>
    <button type="submit" class="btn-primary mt-2 self-start">Update Password</button>
  </form>
</div>
<?php
require __DIR__ . '/../../Views/account_layout_close.php';
require __DIR__ . '/../../Views/layout_close.php';
