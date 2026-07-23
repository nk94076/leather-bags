<?php
$categories = get_categories();
$general = get_setting('general', []);
$social = get_setting('social', []);
$siteName = $general['siteName'] ?? 'CORIUM';
?>
<footer class="mt-24 bg-brand-ink text-brand-cream">
  <div class="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10">
    <div class="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
      <div class="lg:col-span-2">
        <span class="font-display text-2xl tracking-[0.15em]"><?= e($siteName) ?></span>
        <p class="mt-4 max-w-sm text-sm leading-relaxed text-brand-cream/70">Corium Leather Co. crafts premium full-grain leather bags, backpacks and accessories for people who value quiet luxury and things built to last.</p>
        <div class="mt-6 flex flex-col gap-2 text-sm text-brand-cream/70">
          <span class="flex items-center gap-2"><?= e($general['address'] ?? '') ?></span>
          <a href="tel:<?= e($general['phone'] ?? '') ?>" class="hover:text-white"><?= e($general['phone'] ?? '') ?></a>
          <a href="mailto:<?= e($general['email'] ?? '') ?>" class="hover:text-white"><?= e($general['email'] ?? '') ?></a>
        </div>
      </div>
      <div>
        <h3 class="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-gold">Company</h3>
        <ul class="flex flex-col gap-3 text-sm text-brand-cream/70">
          <li><a href="<?= e(base_url('/about-us')) ?>" class="hover:text-white">About Us</a></li>
          <li><a href="<?= e(base_url('/contact-us')) ?>" class="hover:text-white">Contact Us</a></li>
          <li><a href="<?= e(base_url('/shop')) ?>" class="hover:text-white">Shop All</a></li>
          <li><a href="<?= e(base_url('/faq')) ?>" class="hover:text-white">FAQs</a></li>
          <li><a href="<?= e(base_url('/track-order')) ?>" class="hover:text-white">Track Order</a></li>
        </ul>
      </div>
      <div>
        <h3 class="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-gold">Categories</h3>
        <ul class="flex flex-col gap-3 text-sm text-brand-cream/70">
          <?php foreach (array_slice($categories, 0, 6) as $cat): ?>
            <li><a href="<?= e(base_url('/shop/' . $cat['slug'])) ?>" class="hover:text-white"><?= e($cat['name']) ?></a></li>
          <?php endforeach; ?>
        </ul>
      </div>
      <div>
        <h3 class="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-gold">Policies</h3>
        <ul class="flex flex-col gap-3 text-sm text-brand-cream/70">
          <li><a href="<?= e(base_url('/privacy-policy')) ?>" class="hover:text-white">Privacy Policy</a></li>
          <li><a href="<?= e(base_url('/terms-and-conditions')) ?>" class="hover:text-white">Terms &amp; Conditions</a></li>
          <li><a href="<?= e(base_url('/shipping-return-policy')) ?>" class="hover:text-white">Shipping &amp; Returns</a></li>
        </ul>
      </div>
    </div>

    <div class="mt-14 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-10 lg:flex-row lg:items-center">
      <div>
        <h3 class="mb-2 font-display text-lg">Join the Corium Circle</h3>
        <p class="text-sm text-brand-cream/60">Early access to new collections, private sales &amp; craft stories.</p>
      </div>
      <form action="<?= e(base_url('/newsletter/subscribe')) ?>" method="post" class="flex w-full max-w-md items-center gap-2">
        <?= csrf_field() ?>
        <input type="hidden" name="redirect" value="<?= e($_SERVER['REQUEST_URI'] ?? '/') ?>">
        <input type="email" name="email" required placeholder="Enter your email address" class="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-brand-gold">
        <button type="submit" aria-label="Subscribe" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white transition hover:bg-brand-primary-dark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </form>
    </div>

    <div class="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-brand-cream/50 sm:flex-row">
      <p>© <?= date('Y') ?> Corium Leather Co. All rights reserved.</p>
      <div class="flex items-center gap-3">
        <?php foreach (['Visa', 'Mastercard', 'UPI', 'RuPay', 'Amex'] as $p): ?>
          <span class="rounded border border-white/15 px-2 py-1 text-[10px] font-semibold tracking-wide"><?= e($p) ?></span>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</footer>
