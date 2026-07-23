<?php
$categories = get_categories();
$general = get_setting('general', ['siteName' => 'CORIUM']);
$siteName = $general['siteName'] ?? 'CORIUM';
$authUser = Auth::user();

$cart = $_SESSION['cart'] ?? [];
$cartCount = array_sum(array_column($cart, 'quantity'));

$wishlistCount = 0;
if ($authUser) {
    $stmt = Database::pdo()->prepare('SELECT COUNT(*) FROM wishlist_items WHERE user_id = ?');
    $stmt->execute([$authUser['id']]);
    $wishlistCount = (int) $stmt->fetchColumn();
}
?>
<header class="sticky top-0 z-40 w-full bg-brand-cream/95 backdrop-blur-sm">
  <div class="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-10">
    <button type="button" class="flex items-center lg:hidden" id="mobile-menu-btn" aria-label="Open menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round"/></svg>
    </button>

    <a href="<?= e(base_url('/')) ?>" class="font-display text-2xl font-semibold tracking-[0.15em] text-brand-ink sm:text-3xl"><?= e($siteName) ?></a>

    <nav class="hidden items-center gap-8 lg:flex">
      <a href="<?= e(base_url('/')) ?>" class="link-underline text-sm font-medium text-brand-ink">Home</a>
      <div class="group relative">
        <a href="<?= e(base_url('/shop')) ?>" class="link-underline flex items-center gap-1 text-sm font-medium text-brand-ink">
          Shop
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <div class="pointer-events-none absolute left-1/2 top-full z-50 w-[720px] -translate-x-1/2 pt-4 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
          <div class="grid grid-cols-5 gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-luxury">
            <?php foreach (array_slice($categories, 0, 10) as $cat): ?>
              <a href="<?= e(base_url('/shop/' . $cat['slug'])) ?>" class="group/item flex flex-col items-center gap-2 text-center">
                <span class="block h-16 w-16 rounded-full bg-cover bg-center ring-1 ring-black/5 transition-transform duration-300 group-hover/item:scale-105" style="background-image:url('<?= e($cat['image_url']) ?>')"></span>
                <span class="text-xs font-medium text-brand-ink group-hover/item:text-brand-primary"><?= e($cat['name']) ?></span>
              </a>
            <?php endforeach; ?>
          </div>
        </div>
      </div>
      <a href="<?= e(base_url('/about-us')) ?>" class="link-underline text-sm font-medium text-brand-ink">About Us</a>
      <a href="<?= e(base_url('/contact-us')) ?>" class="link-underline text-sm font-medium text-brand-ink">Contact</a>
      <a href="<?= e(base_url('/faq')) ?>" class="link-underline text-sm font-medium text-brand-ink">FAQ</a>
    </nav>

    <div class="flex items-center gap-1 sm:gap-2">
      <button type="button" id="search-toggle-btn" aria-label="Search" class="flex h-10 w-10 items-center justify-center rounded-full text-brand-ink hover:bg-brand-cream-dark">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3" stroke-linecap="round"/></svg>
      </button>
      <a href="<?= e(base_url('/wishlist')) ?>" aria-label="Wishlist" class="relative hidden h-10 w-10 items-center justify-center rounded-full text-brand-ink hover:bg-brand-cream-dark sm:flex">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
        <?php if ($wishlistCount > 0): ?>
          <span class="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[10px] text-white"><?= (int) $wishlistCount ?></span>
        <?php endif; ?>
      </a>
      <a href="<?= e(base_url('/cart')) ?>" aria-label="Cart" class="relative flex h-10 w-10 items-center justify-center rounded-full text-brand-ink hover:bg-brand-cream-dark">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0" stroke-linecap="round"/></svg>
        <?php if ($cartCount > 0): ?>
          <span class="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[10px] text-white"><?= (int) $cartCount ?></span>
        <?php endif; ?>
      </a>

      <div class="group relative hidden sm:block">
        <a href="<?= $authUser ? e(base_url('/account')) : e(base_url('/login')) ?>" aria-label="Account" class="flex h-10 w-10 items-center justify-center rounded-full text-brand-ink hover:bg-brand-cream-dark">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke-linecap="round"/></svg>
        </a>
        <?php if ($authUser): ?>
          <div class="pointer-events-none absolute right-0 top-full w-52 pt-2 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
            <div class="rounded-xl border border-black/5 bg-white p-2 shadow-luxury">
              <p class="truncate px-3 py-2 text-xs text-black/50">Signed in as <?= e($authUser['name']) ?></p>
              <a href="<?= e(base_url('/account')) ?>" class="block rounded-lg px-3 py-2 text-sm hover:bg-brand-cream">My Account</a>
              <a href="<?= e(base_url('/account/orders')) ?>" class="block rounded-lg px-3 py-2 text-sm hover:bg-brand-cream">Orders</a>
              <a href="<?= e(base_url('/account/addresses')) ?>" class="block rounded-lg px-3 py-2 text-sm hover:bg-brand-cream">Addresses</a>
              <?php if ($authUser['role'] === 'ADMIN'): ?>
                <a href="<?= e(base_url('/admin')) ?>" class="block rounded-lg px-3 py-2 text-sm hover:bg-brand-cream">Admin Panel</a>
              <?php endif; ?>
              <a href="<?= e(base_url('/logout')) ?>" class="block rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">Sign Out</a>
            </div>
          </div>
        <?php endif; ?>
      </div>
    </div>
  </div>

  <div id="search-panel" class="hidden border-t border-black/5 bg-white">
    <div class="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
      <form action="<?= e(base_url('/shop')) ?>" method="get" class="flex items-center gap-3 py-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-black/40"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3" stroke-linecap="round"/></svg>
        <input type="search" name="q" id="search-input" autocomplete="off" placeholder="Search for bags, backpacks, wallets..." class="w-full bg-transparent text-sm outline-none placeholder:text-black/40">
        <button type="button" id="search-close-btn" aria-label="Close search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-black/40"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/></svg>
        </button>
      </form>
      <div id="search-results" class="hidden max-h-[70vh] overflow-y-auto pb-6"></div>
    </div>
  </div>
</header>

<div id="mobile-menu" class="fixed inset-0 z-50 hidden lg:hidden">
  <div class="absolute inset-0 bg-black/50" id="mobile-menu-overlay"></div>
  <div class="absolute left-0 top-0 h-full w-[82%] max-w-sm overflow-y-auto bg-brand-cream p-6 shadow-luxury">
    <div class="mb-6 flex items-center justify-between">
      <span class="font-display text-xl text-brand-ink"><?= e($siteName) ?></span>
      <button type="button" id="mobile-menu-close" aria-label="Close menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/></svg>
      </button>
    </div>
    <nav class="flex flex-col gap-1">
      <a href="<?= e(base_url('/')) ?>" class="rounded-lg px-2 py-3 text-base font-medium text-brand-ink hover:bg-brand-cream-dark">Home</a>
      <a href="<?= e(base_url('/shop')) ?>" class="rounded-lg px-2 py-3 text-base font-medium text-brand-ink hover:bg-brand-cream-dark">Shop All</a>
      <a href="<?= e(base_url('/about-us')) ?>" class="rounded-lg px-2 py-3 text-base font-medium text-brand-ink hover:bg-brand-cream-dark">About Us</a>
      <a href="<?= e(base_url('/contact-us')) ?>" class="rounded-lg px-2 py-3 text-base font-medium text-brand-ink hover:bg-brand-cream-dark">Contact</a>
      <a href="<?= e(base_url('/faq')) ?>" class="rounded-lg px-2 py-3 text-base font-medium text-brand-ink hover:bg-brand-cream-dark">FAQ</a>
      <a href="<?= e(base_url('/track-order')) ?>" class="rounded-lg px-2 py-3 text-base font-medium text-brand-ink hover:bg-brand-cream-dark">Track Order</a>
    </nav>
    <p class="mb-2 mt-6 px-2 text-xs font-semibold uppercase tracking-wider text-black/40">Categories</p>
    <div class="grid grid-cols-2 gap-2">
      <?php foreach ($categories as $cat): ?>
        <a href="<?= e(base_url('/shop/' . $cat['slug'])) ?>" class="rounded-lg px-3 py-2 text-sm text-brand-ink hover:bg-brand-cream-dark"><?= e($cat['name']) ?></a>
      <?php endforeach; ?>
    </div>
    <div class="mt-6 flex flex-col gap-2 border-t border-black/10 pt-6">
      <?php if ($authUser): ?>
        <a href="<?= e(base_url('/account')) ?>" class="rounded-lg px-2 py-3 text-sm font-medium">My Account</a>
        <a href="<?= e(base_url('/logout')) ?>" class="rounded-lg px-2 py-3 text-sm font-medium text-red-600">Sign Out</a>
      <?php else: ?>
        <a href="<?= e(base_url('/login')) ?>" class="rounded-lg px-2 py-3 text-sm font-medium">Login</a>
        <a href="<?= e(base_url('/register')) ?>" class="rounded-lg px-2 py-3 text-sm font-medium">Register</a>
      <?php endif; ?>
    </div>
  </div>
</div>
