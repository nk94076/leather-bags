<?php
declare(strict_types=1);

$errors = [];
$adminOnly = isset($_GET['admin']);

if (!empty($_GET['callbackUrl']) && empty($_SESSION['intended'])) {
    $_SESSION['intended'] = $_GET['callbackUrl'];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify()) {
        $errors[] = 'Your session expired. Please try again.';
    } else {
        $email = trim((string) ($_POST['email'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');
        if ($email === '' || $password === '') {
            $errors[] = 'Enter your email and password.';
        } elseif (!Auth::attempt($email, $password)) {
            $errors[] = 'Invalid email or password.';
        } else {
            $intended = $_SESSION['intended'] ?? base_url('/account');
            unset($_SESSION['intended']);
            flash_set('success', 'Welcome back!');
            header('Location: ' . (str_starts_with($intended, 'http') ? $intended : base_url($intended)));
            exit;
        }
    }
}

$pageTitle = 'Sign In';
$noindex = true;
require __DIR__ . '/../Views/layout_open.php';
?>
<div class="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16 sm:py-24">
  <h1 class="font-display text-3xl text-brand-ink">Welcome Back</h1>
  <p class="mt-2 text-sm text-black/60">Sign in to continue to your Corium account.</p>

  <?php if ($adminOnly): ?>
    <p class="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">Please sign in with an administrator account to access the admin panel.</p>
  <?php endif; ?>
  <?php foreach ($errors as $err): ?>
    <p class="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"><?= e($err) ?></p>
  <?php endforeach; ?>

  <form method="post" class="mt-6 flex flex-col gap-4">
    <?= csrf_field() ?>
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Email Address</span>
      <input type="email" name="email" required class="input-field" placeholder="you@example.com">
    </label>
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Password</span>
      <input type="password" name="password" required class="input-field" placeholder="••••••••">
    </label>
    <div class="flex justify-end">
      <a href="<?= e(base_url('/forgot-password')) ?>" class="text-xs font-medium text-brand-primary hover:underline">Forgot Password?</a>
    </div>
    <button type="submit" class="btn-primary mt-2">Sign In</button>
  </form>

  <p class="mt-6 text-center text-sm text-black/60">Don't have an account? <a href="<?= e(base_url('/register')) ?>" class="font-medium text-brand-primary hover:underline">Create one</a></p>

  <div class="mt-8 rounded-xl border border-dashed border-black/15 bg-brand-cream p-4 text-xs text-black/60">
    <p class="mb-1 font-semibold text-brand-ink">Demo credentials</p>
    <p>Customer: aarav.mehta@example.com / Customer@123</p>
    <p>Admin: admin@corium-leather.com / Admin@12345</p>
  </div>
</div>
<?php require __DIR__ . '/../Views/layout_close.php'; ?>
