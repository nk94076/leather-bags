<?php
declare(strict_types=1);

$step = 'email';
$email = $_POST['email'] ?? $_GET['email'] ?? '';
$error = null;
$demoOtp = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && csrf_verify()) {
    $action = $_POST['action'] ?? '';

    if ($action === 'request_otp') {
        $email = strtolower(trim((string) ($_POST['email'] ?? '')));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = 'Enter a valid email address.';
        } else {
            $stmt = Database::pdo()->prepare('SELECT id FROM users WHERE email = ?');
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                $code = (string) random_int(100000, 999999);
                $codeHash = password_hash($code, PASSWORD_BCRYPT);
                Database::pdo()->prepare('INSERT INTO password_reset_otps (email, code_hash, expires_at) VALUES (?,?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))')
                    ->execute([$email, $codeHash]);
                $demoOtp = $code;
            }
            $step = 'otp';
        }
    } elseif ($action === 'reset_password') {
        $email = strtolower(trim((string) ($_POST['email'] ?? '')));
        $otp = trim((string) ($_POST['otp'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');
        $step = 'otp';

        if (strlen($password) < 8) {
            $error = 'Password must be at least 8 characters.';
        } else {
            $stmt = Database::pdo()->prepare('SELECT * FROM password_reset_otps WHERE email = ? AND used = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1');
            $stmt->execute([$email]);
            $record = $stmt->fetch();
            if (!$record || !password_verify($otp, $record['code_hash'])) {
                $error = 'Invalid or expired OTP.';
            } else {
                $userStmt = Database::pdo()->prepare('SELECT id FROM users WHERE email = ?');
                $userStmt->execute([$email]);
                $user = $userStmt->fetch();
                if ($user) {
                    Database::pdo()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
                        ->execute([password_hash($password, PASSWORD_BCRYPT), $user['id']]);
                    Database::pdo()->prepare('UPDATE password_reset_otps SET used = 1 WHERE id = ?')->execute([$record['id']]);
                    flash_set('success', 'Password reset successfully. Please sign in.');
                    redirect('/login');
                }
                $error = 'Account not found.';
            }
        }
    }
}

$pageTitle = $step === 'otp' ? 'Verify & Reset' : 'Forgot Password';
$noindex = true;
require __DIR__ . '/../Views/layout_open.php';
?>
<div class="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16 sm:py-24">
  <h1 class="font-display text-3xl text-brand-ink"><?= $step === 'otp' ? 'Verify &amp; Reset' : 'Forgot Password' ?></h1>
  <p class="mt-2 text-sm text-black/60">
    <?= $step === 'otp' ? 'Enter the 6-digit code sent to ' . e($email) . ' and choose a new password.' : "Enter your registered email and we'll send you a one-time verification code." ?>
  </p>

  <?php if ($error): ?><p class="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"><?= e($error) ?></p><?php endif; ?>

  <?php if ($step === 'email'): ?>
    <form method="post" class="mt-6 flex flex-col gap-4">
      <?= csrf_field() ?>
      <input type="hidden" name="action" value="request_otp">
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Email Address</span>
        <input type="email" name="email" required value="<?= e($email) ?>" class="input-field" placeholder="you@example.com">
      </label>
      <button type="submit" class="btn-primary mt-2">Send Verification Code</button>
    </form>
  <?php else: ?>
    <?php if ($demoOtp): ?>
      <p class="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">No SMTP is configured in this demo environment, so your code is shown here: <strong><?= e($demoOtp) ?></strong></p>
    <?php endif; ?>
    <form method="post" class="mt-6 flex flex-col gap-4">
      <?= csrf_field() ?>
      <input type="hidden" name="action" value="reset_password">
      <input type="hidden" name="email" value="<?= e($email) ?>">
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Verification Code</span>
        <input type="text" name="otp" required maxlength="6" class="input-field" placeholder="6-digit code">
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">New Password</span>
        <input type="password" name="password" required minlength="8" class="input-field" placeholder="At least 8 characters">
      </label>
      <button type="submit" class="btn-primary mt-2">Reset Password</button>
    </form>
  <?php endif; ?>

  <p class="mt-6 text-center text-sm text-black/60"><a href="<?= e(base_url('/login')) ?>" class="font-medium text-brand-primary hover:underline">Back to Sign In</a></p>
</div>
<?php require __DIR__ . '/../Views/layout_close.php'; ?>
