<?php
declare(strict_types=1);

$errors = [];
$old = ['name' => '', 'email' => '', 'phone' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify()) {
        $errors[] = 'Your session expired. Please try again.';
    } else {
        $name = trim((string) ($_POST['name'] ?? ''));
        $email = strtolower(trim((string) ($_POST['email'] ?? '')));
        $phone = trim((string) ($_POST['phone'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');
        $old = ['name' => $name, 'email' => $email, 'phone' => $phone];

        if (strlen($name) < 2) {
            $errors[] = 'Enter your full name.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Enter a valid email address.';
        } elseif (strlen($phone) < 10) {
            $errors[] = 'Enter a valid phone number.';
        } elseif (strlen($password) < 8) {
            $errors[] = 'Password must be at least 8 characters.';
        } else {
            $stmt = Database::pdo()->prepare('SELECT id FROM users WHERE email = ?');
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                $errors[] = 'An account with this email already exists.';
            } else {
                $hash = password_hash($password, PASSWORD_BCRYPT);
                Database::pdo()->prepare('INSERT INTO users (name, email, phone, password_hash, role, email_verified_at) VALUES (?,?,?,?,"CUSTOMER", NOW())')
                    ->execute([$name, $email, $phone, $hash]);
                $userId = (int) Database::pdo()->lastInsertId();
                Auth::login($userId);
                flash_set('success', 'Welcome to Corium!');
                redirect('/account');
            }
        }
    }
}

$pageTitle = 'Create an Account';
$noindex = true;
require __DIR__ . '/../Views/layout_open.php';
?>
<div class="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16 sm:py-24">
  <h1 class="font-display text-3xl text-brand-ink">Create Your Account</h1>
  <p class="mt-2 text-sm text-black/60">Join Corium for faster checkout, order tracking and exclusive offers.</p>

  <?php foreach ($errors as $err): ?>
    <p class="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"><?= e($err) ?></p>
  <?php endforeach; ?>

  <form method="post" class="mt-6 flex flex-col gap-4">
    <?= csrf_field() ?>
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Full Name</span>
      <input type="text" name="name" required value="<?= e($old['name']) ?>" class="input-field" placeholder="Your full name">
    </label>
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Email Address</span>
      <input type="email" name="email" required value="<?= e($old['email']) ?>" class="input-field" placeholder="you@example.com">
    </label>
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Phone Number</span>
      <input type="tel" name="phone" required value="<?= e($old['phone']) ?>" class="input-field" placeholder="+91 98765 43210">
    </label>
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Password</span>
      <input type="password" name="password" required class="input-field" placeholder="At least 8 characters">
    </label>
    <button type="submit" class="btn-primary mt-2">Create Account</button>
    <p class="text-center text-xs text-black/40">By creating an account, you agree to our <a href="<?= e(base_url('/terms-and-conditions')) ?>" class="underline">Terms</a> and <a href="<?= e(base_url('/privacy-policy')) ?>" class="underline">Privacy Policy</a>.</p>
  </form>

  <p class="mt-6 text-center text-sm text-black/60">Already have an account? <a href="<?= e(base_url('/login')) ?>" class="font-medium text-brand-primary hover:underline">Sign in</a></p>
</div>
<?php require __DIR__ . '/../Views/layout_close.php'; ?>
