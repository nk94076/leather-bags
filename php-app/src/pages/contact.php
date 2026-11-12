<?php
declare(strict_types=1);

$errors = [];
$submitted = false;
$old = ['name' => '', 'email' => '', 'phone' => '', 'subject' => '', 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify()) {
        $errors[] = 'Your session expired. Please try again.';
    } else {
        $old['name'] = trim((string) ($_POST['name'] ?? ''));
        $old['email'] = trim((string) ($_POST['email'] ?? ''));
        $old['phone'] = trim((string) ($_POST['phone'] ?? ''));
        $old['subject'] = trim((string) ($_POST['subject'] ?? ''));
        $old['message'] = trim((string) ($_POST['message'] ?? ''));

        if (mb_strlen($old['name']) < 2) {
            $errors[] = 'Enter your name.';
        }
        if (!filter_var($old['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Enter a valid email address.';
        }
        if (mb_strlen($old['subject']) < 2) {
            $errors[] = 'Enter a subject.';
        }
        if (mb_strlen($old['message']) < 10) {
            $errors[] = 'Message must be at least 10 characters.';
        }

        if (empty($errors)) {
            Database::pdo()->prepare(
                'INSERT INTO contact_submissions (name, email, phone, subject, message) VALUES (?,?,?,?,?)'
            )->execute([$old['name'], $old['email'], $old['phone'] ?: null, $old['subject'], $old['message']]);
            flash_set('success', "Message sent! We'll get back to you within 1 business day.");
            redirect('/contact-us');
        }
    }
}

$page = get_cms_page('contact-us');
$content = $page['content'] ?? [];
$general = get_setting('general');

$pageTitle = $page['meta_title'] ?? 'Contact Us';
$pageDescription = $page['meta_desc'] ?? 'Get in touch with the Corium Leather Co. team.';
$canonicalPath = '/contact-us';
require __DIR__ . '/../Views/layout_open.php';
?>
<div class="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
  <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1.5 text-xs text-black/50">
    <a href="<?= e(base_url('/')) ?>" class="hover:text-brand-primary">Home</a>
    <span>›</span>
    <span class="text-brand-ink">Contact Us</span>
  </nav>
  <h1 class="mb-3 mt-4 font-display text-3xl text-brand-ink sm:text-4xl">Get In Touch</h1>
  <p class="mb-10 max-w-xl text-sm text-black/60"><?= e($content['intro'] ?? "Have a question? We'd love to hear from you.") ?></p>

  <div class="grid grid-cols-1 gap-10 lg:grid-cols-5">
    <div class="flex flex-col gap-4 lg:col-span-2">
      <a href="tel:<?= e($general['phone'] ?? '') ?>" class="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-5">
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.4 1.9.6 2.9.7a2 2 0 0 1 1.6 2Z"/></svg>
        </span>
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-black/40">Call Us</p>
          <p class="mt-0.5 text-sm text-brand-ink"><?= e($general['phone'] ?? '') ?></p>
        </div>
      </a>
      <a href="mailto:<?= e($general['email'] ?? '') ?>" class="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-5">
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>
        </span>
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-black/40">Email Us</p>
          <p class="mt-0.5 text-sm text-brand-ink"><?= e($general['email'] ?? '') ?></p>
        </div>
      </a>
      <div class="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-5">
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-6.5 8-12a8 8 0 1 0-16 0c0 5.5 8 12 8 12Z"/><circle cx="12" cy="10" r="3"/></svg>
        </span>
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-black/40">Visit Us</p>
          <p class="mt-0.5 text-sm text-brand-ink"><?= e($general['address'] ?? '') ?></p>
        </div>
      </div>
      <div class="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-5">
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3" stroke-linecap="round"/></svg>
        </span>
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-black/40">Business Hours</p>
          <p class="mt-0.5 text-sm text-brand-ink"><?= e($content['hours'] ?? 'Monday – Saturday, 9:30 AM – 6:30 PM IST') ?></p>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-black/5 bg-white p-6 sm:p-8 lg:col-span-3">
      <h2 class="mb-6 font-display text-xl text-brand-ink">Send Us a Message</h2>
      <?php foreach ($errors as $err): ?>
        <p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"><?= e($err) ?></p>
      <?php endforeach; ?>
      <form method="post" class="flex flex-col gap-4">
        <?= csrf_field() ?>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Full Name</span>
            <input name="name" required value="<?= e($old['name']) ?>" placeholder="Your name" class="input-field">
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Email Address</span>
            <input type="email" name="email" required value="<?= e($old['email']) ?>" placeholder="you@example.com" class="input-field">
          </label>
        </div>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Phone Number (Optional)</span>
          <input name="phone" value="<?= e($old['phone']) ?>" placeholder="+91 98765 43210" class="input-field">
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Subject</span>
          <input name="subject" required value="<?= e($old['subject']) ?>" placeholder="How can we help?" class="input-field">
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium uppercase tracking-wide text-brand-secondary">Message</span>
          <textarea name="message" required rows="5" placeholder="Tell us more..." class="input-field"><?= e($old['message']) ?></textarea>
        </label>
        <button type="submit" class="btn-primary mt-2 self-start">Send Message</button>
      </form>
    </div>
  </div>
</div>
<?php require __DIR__ . '/../Views/layout_close.php'; ?>
